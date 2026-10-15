# AGENTS.md

## Project Snapshot

This is a Create React App project that runs as a browser app, an Electron desktop app, and an itch.io HTML5 upload. The app uses the webcam to track a colored object against a user-painted calibration grid, turns that into a depth state from `0` to `4`, and runs training/play sessions made of timed tasks such as holds, hits, up/down rhythm, rests, clap detection, finish, and endless mode.

The codebase is intentionally client-side. Jotai atoms hold app/session state, browser storage holds custom levels and some settings, and Electron is mostly a secure shell around the built React app.

## Important Commands

- `npm start` - CRA dev server at `http://localhost:3000`.
- `npm run electron-dev` - starts CRA and then Electron against localhost.
- `npm run build` - local web/CRA build only. It copies the manually maintained root `version.json` to `public/version.json`, then creates `build/`. Use this only when explicitly asked for a local web build or a raw `build/` folder.
- `npm run package` - preferred itch.io/release packaging command. It runs `package-build.js`, checks that `src/atoms/navAtom.js` starts at `INSTRUCTIONS`, runs the web build, and creates `react-webcam-build-v*.zip` and `react-webcam-src-v*.zip`.
- `npm run electron-pack` - build plus Electron packaging.
- `npm run electron-pack-win` - Windows NSIS package.
- `npm run electron-pack-mac` - macOS ARM64 DMG package.

There is no active `npm test` script in `package.json`; CRA test docs in `README.md` are boilerplate.

## Release And Build Gotchas

- Set the release number manually in root `version.json` and commit it before packaging. `npm run build` uses `sync-version.js` to copy that number to `public/version.json` without incrementing it; package ZIP names use the same root version.
- For itch.io uploads or shareable release artifacts, run `npm run package`, not just `npm run build`.
- `package-build.js` fails unless `navAtom` is exactly `atom(INSTRUCTIONS)`. Do not change the production initial screen without updating the package guard deliberately.
- Itch/source/build zip artifacts may exist in the repo root, such as `react-webcam-build-v*.zip` and `react-webcam-src-v*.zip`. Treat them as generated release artifacts.
- Electron config lives in `package.json` under `build`; Electron entry files are `public/electron.js` and `public/preload.js`.
- The current workflow file is `.github/workflows/build.yml`, despite `ELECTRON.md` mentioning an older `electron-build.yml` name.

## Runtime Architecture

- Entry point: `src/index.js` renders `src/App.js`.
- `App.js` loads default audio packs on startup with `audioManager.loadDefaultPacks()`, shows `Navigation`, conditionally shows `WebcamComponent`, always shows `Cylinder` except on achievements, renders the selected route based on `navAtom`, and includes the global `AudioPlayer`.
- Navigation state is numeric constants in `src/atoms/navAtom.js`.
- Main app sections:
  - `Calibration` - paint/select grid cells, tune base color, sensitivity, depth percentages, and hysteresis.
  - `Training` - select a level, choose/import a voice pack, preview task audio, initialize `currentLevelAtom`.
  - `Playing` - executes task queue and transitions to `Gameover`.
  - `LevelEditor` - creates/imports/exports custom levels in local storage.
  - `VoicePackGenerator` - generates and exports voice packs.
  - `Achievements`, `Instructions`, `Mic`, `ButtplugComponent` - auxiliary screens.

## Webcam And Detection Flow

- `WebcamComponent` wires together:
  - `useWebcam()` for refs, canvas dimensions, scale factor, and drawing video frames to canvas.
  - `FrameProcessor` for requestAnimationFrame processing and FPS throttling via `useFpsCounter`.
  - `WebcamDisplay` for the actual webcam/canvas UI and grid interactions.
  - `useGridProcessor()` for converting sampled grid color matches into the global `currentStateAtom`.
- The current primary detection model is grid based:
  - Grid cells live in `gridSquaresAtom`.
  - Sampled colors live in `gridColorsAtom`.
  - `gridBaseColorAtom` and `gridSensitivityAtom` define what counts as the visible shaft/object color.
  - `gridShaftPercentAtom` is the percent of painted grid cells currently matching the base color.
  - `gridDepthPercentAtom` maps depth thresholds: `{ 1: 50, 2: 40, 3: 30, 4: 20 }` by default.
  - `percentHysterisisAtom` buffers transitions so depth does not flicker.
- There is an older four-marker color-delta path in `useMarkerDetection`, `useMarkersState`, and `markersAtoms.js`. Be careful before deleting it; some components or debug flows may still expect it.

## Game And Task Flow

- Built-in levels are declared in `src/components/Training/levels.js`.
- Task factory functions and task types live in `src/components/Tasks/task.js`.
- A selected level is copied into `currentLevelAtom` with task ids added, then `Training` sets `navAtom` to `PLAYING`.
- `Playing` shifts `currentLevel.tasks` into `currentLevel.currentTask`, renders the correct task component, records summaries/scores, and plays feedback through atoms.
- Task components such as `HoldDepth`, `HitDepth`, `Diving`, `EndlessDive`, and `ClapDetector` use the live depth/audio/timer atoms to determine success and produce summaries.
- Shared task/session state lives in `src/atoms/taskAtom.js`; audio triggers live in `src/atoms/audioAtom.js`.

## Audio System

Audio references should usually be symbolic strings such as `Hold.ONE`, `LevelStart.GENERIC`, or `Sfx.METRONOME`, not hard-coded file paths.

- Audio definitions:
  - `src/components/Tasks/audio.js` - moddable voice/task cue keys.
  - `src/components/Tasks/audioShared.js` - non-modded shared SFX/calibration audio.
  - `src/components/Tasks/audioPaths.js` - path/key helpers.
- Resolution:
  - `src/services/audioResolver.js` resolves symbolic references against shared audio, default packs, or the active custom pack.
  - `src/services/audioManager.js` owns voice selection, default pack loading, custom pack registration, and public audio APIs.
  - `src/components/AudioPlayer.js` listens to `sfxAtom`, `feedbackAtom`, and `currentLevel.currentTask.audio`, then plays resolved audio.

## Itch.io Audio Constraints

This repo has a very specific itch.io audio strategy. Preserve it unless intentionally replacing the whole approach.

- Default voice packs are `public/audio_female_default.zip` and `public/audio_male_default.zip`.
- They must be fetched with relative paths like `./audio_female_default.zip`; absolute `/audio_female_default.zip` breaks in itch.io subdirectories.
- `src/services/defaultPackLoader.js` uses JSZip to read `audio-pack.json`, extract each audio file, set MIME types, convert blobs to data URLs, and cache them in memory with `src/services/audioCache.js`.
- Do not use blob URLs, IndexedDB, or localStorage for the built-in itch default pack playback path. The working path is in-memory data URLs.
- User-imported voice packs in `Training` also convert ZIP contents to data URLs and register the pack in memory.
- Older custom-pack storage APIs in `storageService.js` use IndexedDB/localStorage and `custom-content://` URLs. Keep compatibility in mind, but itch default packs rely on the in-memory path.

## Custom Content

- Custom levels are stored in localStorage through `storageService` and managed by `levelManager`.
- `LevelEditor` imports/exports level JSON in `{ format: "level-v1", level: ... }`.
- Voice pack generation uses ElevenLabs-related atoms in `moddingAtom.js`; API key and voice id are stored with `atomWithStorage`.
- Exported voice packs are ZIPs expected to include an `audio-pack.json` manifest.
- `CUSTOM_CONTENT_OUTLINE.md` and `ITCH_IO_AUDIO_LOADING.md` are important design/background docs.

## Electron Notes

- `public/electron.js` creates a single `BrowserWindow`, loads `http://localhost:3000` in dev and `build/index.html` in production.
- Security defaults are on: `nodeIntegration: false`, `contextIsolation: true`, `webSecurity: true`, preload enabled.
- `public/preload.js` exposes a small `window.electronAPI` with version/platform helpers and whitelisted IPC channel examples.
- If adding Electron-native capabilities, prefer adding narrow APIs in preload rather than exposing Node to the renderer.

## Coding Style And Safety

- The code is JavaScript/JSX, not TypeScript.
- State management is Jotai; prefer adding or reusing atoms over prop drilling for global/session state.
- Existing style is semicolon-light and uses mostly single quotes in newer files. Match nearby style.
- Be conservative around user-facing adult-training wording and task/audio key names; changing keys can break generated voice packs and existing levels.
- Avoid moving public asset names casually. ZIP manifests and audio references are path/key sensitive.
- Before package/release changes, inspect `git status` because generated version files and zips are commonly dirty.

## Useful Files

- `src/App.js` - top-level route/render logic and default pack startup.
- `src/atoms/navAtom.js` - screen constants and required production initial route.
- `src/atoms/taskAtom.js` - play/session state.
- `src/atoms/gridAtoms.js` - calibration grid state.
- `src/components/Training/levels.js` - built-in levels.
- `src/components/Tasks/task.js` - task constructors and duration/summary helpers.
- `src/components/Playing/Playing.js` - task queue runtime.
- `src/services/audioManager.js` - audio pack/voice API.
- `src/services/defaultPackLoader.js` - itch-compatible default ZIP loader.
- `src/services/audioCache.js` - in-memory data URL cache.
- `src/services/levelManager.js` and `src/services/storageService.js` - custom content persistence.
- `package-build.js` - itch packaging script.
- `.github/workflows/build.yml` - Windows/macOS Electron CI.
