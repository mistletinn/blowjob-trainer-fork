import React, { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { navAtom } from '../atoms/navAtom'
import * as NAV from '../atoms/navAtom'
import PlayTime from './PlayTime'
import { Compass, Book, Play, Pause, Circle, Award, HelpCircle, Mic as MicIcon, Zap, Edit, Music, Volume2, ChevronDown, ChevronUp } from 'react-feather'
import { playStateAtom, PlayState } from '../atoms/taskAtom'
import { vibrateSpeedAtom } from '../atoms/buttplugAtom'
import { useButtplug } from '../hooks/useButtplug'
import { audioUnlockedAtom } from '../atoms/audioAtom'
import { unlockAudio } from '../services/audioPlayback'

function Navigation() {
    const [nav, setNav] = useAtom(navAtom)
    const [playState, setPlayState] = useAtom(playStateAtom)
    const [audioUnlocked, setAudioUnlocked] = useAtom(audioUnlockedAtom)
    const setVibrateSpeed = useSetAtom(vibrateSpeedAtom)
    const [showModdingLinks, setShowModdingLinks] = useState(false)
    useButtplug()

    // Determine if buttons should be disabled based on play state
    const isPlaying = playState === PlayState.PLAYING
    const isPaused = playState === PlayState.PAUSED
    const disableNavigation = isPlaying && !isPaused

    function handleChangeState(toState) {
        setNav(toState)
    }

    function handleInstructions() {
        handleChangeState(NAV.INSTRUCTIONS)
    }

    function handleCalibration() {
        handleChangeState(NAV.CALIBRATE)
    }

    function handleTraining() {
        handleChangeState(NAV.TRAINING)
    }

    function handleBeginPlay() {
        handleChangeState(NAV.PLAYING)
    }

    function handleAchievement() {
        handleChangeState(NAV.ACHIEVEMENTS)
    }

    function handleMic() {
        handleChangeState(NAV.MIC)
    }

    function handleButtplug() {
        handleChangeState(NAV.BUTTPLUG)
    }

    function handleLevelEditor() {
        handleChangeState(NAV.LEVEL_EDITOR)
    }

    function handleAudioGenerator() {
        handleChangeState(NAV.VOICE_GENERATOR)
    }

    function handlePlayPause() {
        setVibrateSpeed(0)
        if (playState === PlayState.PLAYING) {
            setPlayState(PlayState.PAUSED)
        } else if (playState === PlayState.PAUSED) {
            setPlayState(PlayState.PLAYING)
        }
    }

    async function handleAllowAudio() {
        const unlocked = await unlockAudio()
        setAudioUnlocked(unlocked)
    }

    const showPlayControls = playState === PlayState.PLAYING || playState === PlayState.PAUSED

    const navClass = (route) => `nav-button ${nav === route ? 'is-active' : ''}`

    return (
        <>
            <header className="app-header">
                <div className="brand-lockup">
                    <div>
                        <div className="brand-eyebrow">Camera-guided practice</div>
                        <h1>Blowjob Trainer</h1>
                    </div>
                </div>

                <nav className="primary-navigation" aria-label="Main navigation">
                <button
                    className={navClass(NAV.INSTRUCTIONS)}
                    disabled={disableNavigation}
                    onClick={handleInstructions}>
                    <HelpCircle size={18} /> <span>Help</span>
                </button>
                {/* <button
                    className={`button margin-x-sm padding-x ${nav === NAV.SETUP && "button-primary"}`}
                    disabled={disableNavigation}
                    onClick={handleSetup}>
                    <Settings size={18} className="margin-xr-sm" /> Setup
                </button> */}
                <button
                    className={navClass(NAV.CALIBRATE)}
                    disabled={disableNavigation}
                    onClick={handleCalibration}>
                    <Compass size={18} /> <span>Calibrate</span>
                </button>
                <button
                    className={navClass(NAV.MIC)}
                    disabled={disableNavigation}
                    onClick={handleMic}>
                    <MicIcon size={18} /> <span>Mic</span>
                </button>
                <button
                    className={navClass(NAV.BUTTPLUG)}
                    disabled={disableNavigation}
                    onClick={handleButtplug}>
                    <Zap size={18} /> <span>Buttplug</span>
                </button>
                <button
                    className={navClass(NAV.TRAINING)}
                    disabled={disableNavigation}
                    onClick={handleTraining}>
                    <Book size={18} /> <span>Levels</span>
                </button>
                <button
                    className={navClass(NAV.ACHIEVEMENTS)}
                    disabled={disableNavigation}
                    onClick={handleAchievement}>
                    <Award size={18} /> <span>Achievements</span>
                </button>
                <button
                    className={`${navClass(NAV.PLAYING)} nav-button-play`}
                    disabled={disableNavigation && nav === NAV.PLAYING}
                    onClick={handleBeginPlay}>
                    <Circle size={18} /> <span>Play</span>
                </button>
                {showPlayControls && (
                    <div className="play-controls">
                        <PlayTime />
                        <button
                            className="nav-button nav-pause-button"
                            disabled={nav !== NAV.PLAYING}
                            onClick={handlePlayPause}>
                            {playState === PlayState.PLAYING ?
                                <Pause size={18} /> :
                                <Play size={18} />
                            }
                        </button>
                    </div>
                )}
                </nav>
            </header>

            {!audioUnlocked && (
                <div className="audio-permission-banner">
                    <div>
                        <strong>Enable audio cues</strong>
                        <p>Allow audio before calibration or play so cues replay reliably on iPhone and iPad.</p>
                    </div>
                    <button
                        className="button button-primary"
                        disabled={disableNavigation}
                        onClick={handleAllowAudio}>
                        <Volume2 size={18} /> Allow Audio
                    </button>
                </div>
            )}

            {!isPlaying && (
                <div className="utility-navigation">
                    <button
                        className="utility-toggle"
                        aria-expanded={showModdingLinks}
                        onClick={() => setShowModdingLinks(!showModdingLinks)}>
                        Creator tools {showModdingLinks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showModdingLinks && (
                        <div className="utility-links">
                            <button
                                className={`button ${nav === NAV.LEVEL_EDITOR ? "button-primary" : ""}`}
                                disabled={disableNavigation}
                                onClick={handleLevelEditor}>
                                <Edit size={18} /> Edit Levels
                            </button>
                            <button
                                className={`button ${nav === NAV.VOICE_GENERATOR ? "button-primary" : ""}`}
                                disabled={disableNavigation}
                                onClick={handleAudioGenerator}>
                                <Music size={18} /> Voice Pack Generator
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default Navigation
