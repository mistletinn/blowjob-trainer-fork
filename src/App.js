// import Webcam from 'react-webcam';
import React, { useEffect } from 'react';
import './App.css';
// components
import WebcamComponent from './components/Webcam/WebcamComponent';
import AudioPlayer from './components/AudioPlayer';
import Navigation from './components/Navigation';
import Calibration from './components/Calibration/Calibration';
import Training from './components/Training/Training';
import Playing from './components/Playing/Playing';
import Cylinder from './components/Cylinder/Cylinder';
import Gameover from './components/Gameover/Gameover';
import Achievements from './components/Achievements/Achievements';
import Instructions from './components/Instructions/Instructions';
import DebugStateSlider from './components/Debug/DebugStateSlider';
import AudioTest from './components/AudioTest';
import Version from './components/Version';
import Mic from './components/Mic/Mic';
import NumberControl from './components/NumberControl';
import ButtplugComponent from './components/Buttplug/ButtplugComponent';
import LevelEditor from './components/LevelEditor/LevelEditor';
import VoicePackGenerator from './components/AudioGenerator/VoicePackGenerator';

// atoms
import { useAtom, useAtomValue } from 'jotai';
import { navAtom } from './atoms/navAtom';
import * as NAV from './atoms/navAtom';
import RGBControl from './components/RGBControl';

// services
import { audioManager } from './services/audioManager';

export const DEBUG = false

function App() {
  // this is our navigation state
  const nav = useAtomValue(navAtom);

  // Load default voice packs on app start
  useEffect(() => {
    const initDefaultPacks = async () => {
      try {
        console.log('[App] Initializing default voice packs...')
        await audioManager.loadDefaultPacks()
        console.log('[App] Default voice packs loaded successfully')
      } catch (error) {
        console.error('[App] Failed to load default voice packs:', error)
      }
    }
    initDefaultPacks()
  }, [])

  function renderControls() {
    switch (nav) {
      case NAV.CALIBRATE:
        return <Calibration />
      case NAV.TRAINING:
        return <Training />
      case NAV.PLAYING:
        return <Playing />
      case NAV.GAMEOVER:
        return <Gameover />
      case NAV.ACHIEVEMENTS:
        return <Achievements />
      case NAV.INSTRUCTIONS:
        return <Instructions />
      case NAV.MIC:
        return <Mic />
      case NAV.BUTTPLUG:
        return <ButtplugComponent />
      case NAV.LEVEL_EDITOR:
        return <LevelEditor />
      case NAV.VOICE_GENERATOR:
        return <VoicePackGenerator />
      // Add more cases as needed for different states
      default:
        return null;
    }
  }

  console.log("app");

  // return <CircularCountdown duration={10000} />

  return (
    <div className="App">
      {/* <div className="debug-state-display">
        <pre>{JSON.stringify(currentState, null, 2)}</pre>
      </div> */}
      <div className="container app-shell">
        <Navigation />
        {/* Debug state slider component */}
        {DEBUG && <DebugStateSlider />}
        {/* Normal webam use */}
        {!DEBUG && nav !== NAV.ACHIEVEMENTS && nav !== NAV.LEVEL_EDITOR && nav !== NAV.VOICE_GENERATOR && <WebcamComponent />}
        {/* {!DEBUG && nav !== NAV.ACHIEVEMENTS && <MarkerPreviews />} */}
        {nav !== NAV.ACHIEVEMENTS && <Cylinder />}
        <AudioPlayer />

        <main className="content-panel">
          {renderControls()}
        </main>

        {/* {DEBUG && <AudioTest />} */}
      </div>
      <Version />
    </div>
  );
}

export default App;


// State system
// 0 - placing 4 markers
// 1 - calibration, waiting to lock in the base colors
// 2 - training
