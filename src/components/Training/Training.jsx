import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { DEBUG } from '../../App';
import Level from './Level';
import { levelManager } from '../../services/levelManager';
import { useSetAtom, useAtom } from 'jotai';
import { currentLevelAtom } from '../../atoms/taskAtom';
import { navAtom } from '../../atoms/navAtom';
import { audioUnlockedAtom, feedbackAtom } from '../../atoms/audioAtom';
import { voiceSelectionAtom } from '../../atoms/moddingAtom';
import * as NAV from '../../atoms/navAtom';
import { getRandomInt } from '../randomInt'
import { audioManager } from '../../services/audioManager';
import { playAudioUrl, unlockAudio } from '../../services/audioPlayback';
import AudioUnlockControls from '../AudioUnlockControls';
import { importVoicePack } from '../../services/voicePackImport';

const Training = () => {

    const [selectedLevel, setSelectedLevel] = useState(null)
    const [voiceSelection, setVoiceSelection] = useAtom(voiceSelectionAtom)
    const [availableVoices, setAvailableVoices] = useState([])
    const [packsLoading, setPacksLoading] = useState(true)
    const [isImporting, setIsImporting] = useState(false)
    const fileInputRef = useRef(null)
    const setCurrentLevel = useSetAtom(currentLevelAtom)
    const setNav = useSetAtom(navAtom)
    const setFeedback = useSetAtom(feedbackAtom)
    const [audioUnlocked, setAudioUnlocked] = useAtom(audioUnlockedAtom)

    // Load available voices
    useEffect(() => {
        const loadVoices = () => {
            const voices = audioManager.getAllVoices()
            setAvailableVoices(voices)
            return voices
        }

        // Load voices immediately
        const voices = loadVoices()

        // If no builtin voices with samples found, retry periodically until loaded
        const hasBuiltinSamples = voices.some(v => v.type === 'builtin' && v.sample)
        if (!hasBuiltinSamples) {
            let retryCount = 0
            const maxRetries = 10
            const interval = setInterval(() => {
                const newVoices = loadVoices()
                const nowHasSamples = newVoices.some(v => v.type === 'builtin' && v.sample)

                retryCount++
                if (nowHasSamples || retryCount >= maxRetries) {
                    clearInterval(interval)
                    setPacksLoading(false)
                }
            }, 300)

            return () => clearInterval(interval)
        } else {
            setPacksLoading(false)
        }
    }, [])

    // Handle voice selection change
    const handleVoiceChange = (voiceId) => {
        setVoiceSelection(voiceId)
        audioManager.setVoice(voiceId)
    }

    // Handle previewing voice sample (for default packs and custom packs)
    const handlePreviewSample = async (voice) => {
        if (voice && voice.sample) {
            // Sample can be a string or array
            const sampleRef = Array.isArray(voice.sample) ? voice.sample[0] : voice.sample

            // For default packs, sampleRef is already a data URL
            // For custom packs loaded via VoicePackGenerator, it might be a custom-content:// URL
            // Use audioManager to resolve it
            const audioPath = await audioManager.getAudioFile(sampleRef)
            if (audioPath) {
                playAudioUrl(audioPath, { context: 'voice-preview', markUnlocked: true })
                    .then(() => setAudioUnlocked(true))
                    .catch(() => setAudioUnlocked(false))
            }
        }
    }

    // Handle custom pack import
    const handleImportPack = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        setIsImporting(true)

        try {
            const { pack, fileCount } = await importVoicePack(file)
            const packId = pack.id
            const packName = pack.name

            // Register pack in memory (no localStorage to avoid quota issues)
            audioManager.registerCustomPack(pack)

            // Set as active voice
            setVoiceSelection(packId)
            audioManager.setVoice(packId)

            // Refresh voice list
            const voices = audioManager.getAllVoices()
            setAvailableVoices(voices)

            console.log(`[Training] Imported custom pack: ${packName} (${fileCount} files)`)
            alert(`Pack "${packName}" imported successfully! (${fileCount} audio files)`)
        } catch (error) {
            console.error('Import error:', error)
            alert(`Error importing pack: ${error.message}`)
        } finally {
            setIsImporting(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleSelectLevel = (level) => {
        setSelectedLevel(level)
        // Automatically set the current level when a level is selected
        setCurrentLevel({
            status: 'idle',
            startTime: null,
            totalTime: 0,
            currentScore: 0,
            tasks: (level.tasks || []).map(task => ({
                ...task,
                id: task.id || getRandomInt()
            })),
            currentTask: null,
            completedTasks: [],
            milestones: {},
            taskScores: {},
            metrics: {}
        })
    }

    const handleBeginLevel = async () => {
        if (!audioUnlocked) {
            const unlocked = await unlockAudio()
            setAudioUnlocked(unlocked)
        }

        // Initialize the currentLevel with the selected level data
        setCurrentLevel({
            id: selectedLevel.id,
            status: 'idle',
            startTime: null,
            totalTime: 0,
            soft: selectedLevel?.soft ?? false,
            currentScore: 0,
            tasks: (selectedLevel.tasks || []).map(task => ({
                ...task,
                id: task.id || getRandomInt()
            })),
            currentTask: null,
            completedTasks: [],
            milestones: {},
            taskScores: {},
            metrics: {}
        })
        setNav(NAV.PLAYING)
    }

    // Handle playing the audio for a task
    const handlePlayAudio = (task) => {
        if (task.audio) {
            setFeedback(task.audio)
        }
    }


    return (
        <React.Fragment>
            {/* Voice Selection Picker */}
            <div className="row-centered margin-y-sm" style={{ marginBottom: '1rem', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong>Voice</strong>
                    <select
                        value={voiceSelection || 'female_default'}
                        onChange={(e) => handleVoiceChange(e.target.value)}
                        disabled={packsLoading || isImporting}
                    >
                        {!availableVoices.some(voice => voice.id === (voiceSelection || 'female_default')) && (
                            <option value={voiceSelection || 'female_default'}>
                                {packsLoading ? 'Loading selected voice…' : 'Selected pack unavailable — import it again'}
                            </option>
                        )}
                        {availableVoices.map(voice => (
                            <option key={voice.id} value={voice.id}>
                                {voice.name}
                            </option>
                        ))}
                    </select>
                    {packsLoading && (
                        <span style={{ fontSize: '0.9em', color: '#666' }}>Loading voice packs...</span>
                    )}
                </div>

                {/* Import Custom Pack Button */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleImportPack}
                    style={{ display: 'none' }}
                />


                {/* Preview Button */}
                {voiceSelection && (() => {
                    const selectedVoice = availableVoices.find(v => v.id === voiceSelection)
                    return selectedVoice?.sample && (
                        <button
                            className="button"
                            onClick={() => handlePreviewSample(selectedVoice)}
                            title="Preview voice sample"
                        >
                            ▶ Preview
                        </button>
                    )
                })()}

                <button
                    className="button"
                    onClick={handleImportClick}
                    disabled={isImporting || packsLoading}
                    title="Import custom voice pack from ZIP file"
                >
                    {isImporting ? 'Importing...' : 'Import Voice Pack'}
                </button>


            </div>

            {!audioUnlocked && <AudioUnlockControls compact />}

            <div className="row-centered margin-y-sm" style={{ marginBottom: '1rem', gap: '1rem', alignItems: 'center' }}>
                {/* Voice Description */}
                {voiceSelection && availableVoices.find(v => v.id === voiceSelection)?.description && (
                    <div style={{ fontSize: '1em', color: '#666' }}>
                        {availableVoices.find(v => v.id === voiceSelection).description}
                    </div>
                )}
            </div>

            <div className="row-centered">
                <h4 className="margin-y-sm">Select a Level</h4>
            </div>
            <div className="grid-three">
                {levelManager.getAllLevels().map(level =>
                    <Level
                        key={level.id}
                        isSelected={selectedLevel?.id === level.id}
                        level={level}
                        onSelect={handleSelectLevel}
                    />)}
            </div>
            <div className="row-centered margin-y">
                <button
                    className={`button padding-x margin-y ${selectedLevel ? 'button-primary' : ''}`}
                    onClick={handleBeginLevel}
                    disabled={!selectedLevel}
                >
                    {selectedLevel ? `Begin Level ${selectedLevel.order}` : 'No level selected'}
                </button>
            </div>

            {DEBUG && selectedLevel && <div className="row margin-y">
                <div>
                    <h4>Tasks for Level {selectedLevel?.id}: {selectedLevel?.title}</h4>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {selectedLevel?.tasks.map((task, index) => {
                            let taskDescription = `Task ${index + 1}: ${task.type}`
                            if (task.targetDepth) taskDescription += ` - Depth: ${task.targetDepth}`
                            if (task.minDepth && task.maxDepth) taskDescription += ` - Depth Range: ${task.minDepth}-${task.maxDepth}`
                            if (task.tempo) taskDescription += ` - Tempo: ${task.tempo}`
                            if (task.time) taskDescription += ` - Time: ${task.time}s`
                            if (task.repeat) taskDescription += ` - Repeat: ${task.repeat}x`
                            if (task.timeLimit) taskDescription += ` - Time Limit: ${task.timeLimit}s`

                            return (
                                <li key={index} style={{ margin: '5px 0', padding: '5px', backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>
                                        {taskDescription}
                                        {task.audio && (
                                            <span> - <b>{audioManager.getAudioKey(task.audio) || 'Audio'}</b></span>
                                        )}
                                    </span>
                                    {task.audio && (
                                        <button className='button'
                                            onClick={() => handlePlayAudio(task)}
                                        >
                                            Play Audio
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>}



            {/* Score Preview for debugging */}
            {/* <div className="row margin-y">
                <ScorePreview level={selectedLevel?.id || 1} />
            </div> */}
        </React.Fragment>
    )
};



// function Training() {

//     // this is our global state
//     const [mission, setMission] = useState(10)

//     function handleClick() {
//         setMission(mission + 1)
//     }

//     return (
//         <div>
//             <h2>Training</h2>
//             <MyButton mission={mission} onClick={handleClick} />
//         </div>
//     );
// }

export default Training;
