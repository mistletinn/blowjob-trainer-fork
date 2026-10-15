# Loading Audio Files from ZIPs on Itch.io

## The Problem

We needed to load ~1000 audio files for voice packs on itch.io, but faced several challenges:

1. **Itch.io file limit**: Maximum ~1000 files per upload
2. **Storage approach needed**: Must use ZIPs to stay under the file limit
3. **Runtime extraction required**: ZIPs must be loaded and extracted in the browser

## Failed Approaches

### Attempt 1: Absolute Paths
**Problem**: Used `/audio_female_default.zip` (absolute path)
**Error**: `403 Forbidden`
**Why it failed**: Itch.io hosts games in subdirectories (e.g., `/html/[gameID]/`), so absolute paths point to the wrong location

### Attempt 2: IndexedDB + Blob URLs
**Problem**: Stored extracted audio in IndexedDB, created blob URLs with `URL.createObjectURL()`
**Error**: `WebKitBlobResource error 1` and `NotSupportedError`
**Why it failed**: Itch.io's iframe security restrictions block blob URL operations

### Attempt 3: IndexedDB + Data URLs
**Problem**: Converted blobs to data URLs using FileReader, stored in IndexedDB
**Error**: Still `WebKitBlobResource error 1`
**Why it failed**: The issue was the conversion happening after IndexedDB storage, not before

### Attempt 4: localStorage with Data URLs
**Problem**: Tried to cache pack metadata (including data URLs) in localStorage
**Error**: `QuotaExceededError`
**Why it failed**: localStorage has a 5-10MB limit, but base64-encoded audio data URLs are ~30MB

## ✅ Working Solution

### Use In-Memory Cache with Data URLs

**Key Insight**: Itch.io allows loading files into memory, but blocks most storage APIs. The solution is to keep everything in RAM.

### Implementation

1. **Relative Paths**: Changed to `./audio_female_default.zip`
   - Works with itch.io's subdirectory structure

2. **In-Memory Cache**: Created `audioCache.js` using JavaScript Map
   - No IndexedDB
   - No blob URLs
   - Just a simple `Map<string, dataURL>`

3. **Data URLs**: Convert audio blobs to data URLs immediately
   ```javascript
   const reader = new FileReader()
   reader.readAsDataURL(blob)
   // Returns: "data:audio/mpeg;base64,..."
   ```

4. **Direct Playback**: Use data URLs directly in retained Audio elements
   ```javascript
   const audio = getAudioElement(dataUrl)
   audio.currentTime = 0
   audio.play()
   ```

### Code Flow

```
App Start
  ↓
Fetch ./audio_female_default.zip
  ↓
JSZip.loadAsync()
  ↓
Extract audio files as Blobs
  ↓
Convert each Blob → Data URL (FileReader)
  ↓
Store in memory Map (audioCache)
  ↓
Resolve cue to URL/path
  ↓
Play through shared audioPlayback service
```

### Files Involved

- **`src/services/audioCache.js`**: In-memory cache (Map of data URLs)
- **`src/services/defaultPackLoader.js`**: Fetches ZIPs, extracts, converts to data URLs
- **`src/services/audioManager.js`**: Manages voice selection and audio resolution
- **`src/services/audioPlayback.js`**: Reuses Audio elements, resets replay position, and logs play failures
- **`src/components/AudioUnlockControls.js`**: User-facing iOS/Safari audio unlock and test controls
- **`src/components/AudioPlayer.js`**: Bridges cue atoms into the shared playback service
- **`src/App.js`**: Loads default packs on startup

## iOS Safari Playback Permission Fix

The ZIP/data URL loading path fixes itch.io asset access, but iPad/iPhone Safari has a separate playback permission issue.

### Symptom

On iPad/iPhone Safari, audio could play once from a direct tap, such as a voice preview, but later automatic cues failed during calibration or gameplay.

Calibration made this easy to reproduce:

```text
Depth changes: 1, 2, 3, 4, 2, 1
Expected: each depth cue plays
Observed: first cue may play, then later cues stop
```

Remote Safari console confirmed:

```text
NotAllowedError: The request is not allowed by the user agent or the platform in the current context
```

### Root Cause

iOS Safari treats webcam/state/timer-driven cue playback as autoplay unless the app has been unlocked by a direct user gesture.

The old playback pattern created a fresh `Audio` object for each cue:

```javascript
const audio = new Audio(audioUrl)
audio.play()
```

That is fragile on iOS because a preview tap may only allow that one playback attempt or media element. Later gameplay cues are triggered by React effects and state changes, not by the original tap, so Safari can block them.

### Current Fix

The app now has a single runtime audio unlock path:

1. `audioUnlockedAtom` stores whether this page session has successfully unlocked audio.
2. `unlockAudio()` is called from explicit user taps.
3. `audioPlayback.js` caches `HTMLAudioElement` instances by URL.
4. Replays reset the retained element before playback:

   ```javascript
   audio.pause()
   audio.currentTime = 0
   await audio.play()
   ```

5. `AudioPlayer` sends all normal cue playback through the shared service.
6. Failed `play()` promises log context, URL, error name/message, and unlock state.

### User-Facing Unlock Points

- Navigation shows a prominent `Allow Audio` button until audio unlock succeeds.
- Calibration always shows audio allow/test controls so users can verify cue playback.
- Training/levels shows audio allow/test controls only while audio is still locked.
- Voice preview uses the same shared playback path and can mark audio as unlocked after a successful user-tap playback.
- Starting a level defensively calls `unlockAudio()` from the button handler if audio is still locked.

This is intentionally not an app mute toggle. Users can control volume with device/browser controls; the app only needs to satisfy iOS Safari's user-gesture requirement.

### Important Constraint

The first successful unlock must happen directly inside a user gesture handler, such as a button click/tap. Do not move the first unlock into a delayed `useEffect`, timer, webcam callback, or task transition.

## iPad Touch Control Fix

Long-pressing calibration number controls on iPad selected the `+`/`-` text instead of cleanly repeating the adjustment.

The shared `NumberControl` now prevents default touch behavior for hold presses, blocks context menus on the controls, and CSS disables selection/callouts for the number-control container, buttons, and value.

Relevant files:

- **`src/components/NumberControl.jsx`**
- **`src/css/skeleton-light.css`**

### Trade-offs

✅ **Pros**:
- Works perfectly on itch.io
- Fast playback (no async lookups)
- Simple, predictable behavior

⚠️ **Cons**:
- Uses ~22MB of RAM per session
- Audio reloaded on every page refresh
- No offline caching
- iOS audio unlock state is runtime-only and must be re-established after refresh

### Testing Checklist

- [x] ZIPs load without 403 errors
- [x] Audio converts to data URLs successfully
- [x] Preview button plays samples
- [x] No storage quota errors
- [x] Works in itch.io iframe environment
- [x] `play()` rejections are logged with context
- [x] Calibration has permanent audio test controls
- [x] Training only shows unlock controls while audio is locked
- [ ] Verify on a real iPad/iPhone Safari session after deployment or HTTPS tunnel

## Key Takeaway

**For itch.io HTML5 games**: When loading large binary assets (audio, images), use relative paths to fetch them, then keep them in memory as data URLs. Don't try to use IndexedDB, blob URLs, or localStorage for large data.

**For iOS Safari audio**: Data URLs solve loading, not permission. Unlock audio once from a direct user tap, reuse retained media elements for later automatic cues, reset `currentTime` before replay, and log every rejected `play()` promise.
