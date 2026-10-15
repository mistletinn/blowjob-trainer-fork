import React, { useState, useMemo } from 'react'
import { useAtom } from 'jotai'
import { AUDIO } from '../Tasks/audio'
import { AUDIO_HELPER } from './audioHelper'
import CoreAudioCues from './CoreAudioCues'
import LevelAudioCues from './LevelAudioCues'
import AudioKeyGenerator from './AudioKeyGenerator'
import AudioGeneration from './AudioGeneration'
import PackExport from './PackExport'
import { normalizeCustomCueName, validateCustomCueName } from '../../services/customAudio'
import NumberControl from '../NumberControl'
import { apiKeyAtom, voiceIdAtom, audioPackAtom, selectedCategoryAtom, speedAtom, stabilityAtom, similarityAtom, initializeCustom, levelAudioModeAtom } from '../../atoms/moddingAtom'

function VoicePackGenerator() {
    const [apiKey, setApiKey] = useAtom(apiKeyAtom)
    const [voiceId, setVoiceId] = useAtom(voiceIdAtom)
    const [audioPack, setAudioPack] = useAtom(audioPackAtom)
    const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom)
    const [speed, setSpeed] = useAtom(speedAtom)
    const [stability, setStability] = useAtom(stabilityAtom)
    const [similarity, setSimilarity] = useAtom(similarityAtom)
    const [playingAudio, setPlayingAudio] = useState(null) // Track which audio is currently playing {category, key, index}
    const [levelAudioMode, setLevelAudioMode] = useAtom(levelAudioModeAtom) // 'disabled' | 'currentLevels' | 'custom'
    const [customCueName, setCustomCueName] = useState('') // For custom Custom cue creation
    const [customCueAudioBlob, setCustomCueAudioBlob] = useState(null) // For custom Custom cue creation

    const cueNameError = customCueName ? validateCustomCueName(customCueName) : ''

    // Get available categories (excluding NONE, Sfx, Calibration, and Custom unless in currentLevels mode)
    const availableCategories = useMemo(() => {
        const categories = []
        // Non-themeable categories that should be excluded
        const nonThemeableCategories = ['NONE', 'Sfx', 'Calibration']
        for (const category in AUDIO) {
            if (!nonThemeableCategories.includes(category)) {
                // Include Custom only when in currentLevels mode
                if (category === 'Custom' && levelAudioMode !== 'currentLevels') {
                    continue
                }
                // In currentLevels mode, show both Custom and core categories
                if (typeof AUDIO[category] === 'object' && AUDIO[category] !== null) {
                    categories.push(category)
                }
            }
        }
        return categories
    }, [levelAudioMode])


    // Handle circle click - play audio
    const handleCircleClick = async (category, key, index) => {
        if (!audioPack[category]?.[key]?.[index]) {
            console.warn('[VoicePack] handleCircleClick: no blob at', { category, key, index })
            return
        }

        const blob = audioPack[category][key][index]

        let url
        let audio
        try {
            url = URL.createObjectURL(blob)
            audio = new Audio(url)
        } catch (err) {
            console.error('[VoicePack] create object URL / Audio failed', {
                category,
                key,
                index,
                errorName: err?.name,
                errorMessage: err?.message,
                error: err
            })
            return
        }

        // Stop currently playing audio
        if (playingAudio?.audio) {
            playingAudio.audio.pause()
            playingAudio.audio.currentTime = 0
            if (playingAudio.url) {
                URL.revokeObjectURL(playingAudio.url)
            }
        }

        setPlayingAudio({ category, key, index, audio, url })

        // Clean up when audio ends
        audio.onended = () => {
            setPlayingAudio(null)
            URL.revokeObjectURL(url)
        }

        try {
            await audio.play()
            console.log('[VoicePack] play started ok', { category, key, index })
        } catch (err) {
            console.error('[VoicePack] audio.play() failed', {
                category,
                key,
                index,
                blobType: blob?.type,
                blobSize: blob?.size,
                errorName: err?.name,
                errorMessage: err?.message,
                error: err
            })
            setPlayingAudio(null)
            URL.revokeObjectURL(url)
        }
    }

    // Handle delete audio cue
    const handleDelete = (category, key, index) => {
        if (!audioPack[category]?.[key]?.[index]) return

        // Stop playing if this is the currently playing audio
        if (playingAudio?.category === category &&
            playingAudio?.key === key &&
            playingAudio?.index === index) {
            if (playingAudio.audio) {
                playingAudio.audio.pause()
                playingAudio.audio.currentTime = 0
            }
            if (playingAudio.url) {
                URL.revokeObjectURL(playingAudio.url)
            }
            setPlayingAudio(null)
        }

        // Remove the audio cue from the pack
        setAudioPack(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: prev[category][key].filter((_, i) => i !== index)
            }
        }))
    }

    // Get available audio keys for the selected category
    const availableAudioKeys = useMemo(() => {
        if (!selectedCategory || !AUDIO[selectedCategory]) {
            return []
        }
        const keys = []
        for (const key in AUDIO[selectedCategory]) {
            if (key !== 'desc') { // Filter out the desc property
                keys.push(key)
            }
        }
        return keys
    }, [selectedCategory])

    // Get category description
    const categoryDescription = useMemo(() => {
        if (selectedCategory && AUDIO_HELPER[selectedCategory]?.desc) {
            return AUDIO_HELPER[selectedCategory].desc
        }
        return null
    }, [selectedCategory])

    // Reset when category changes
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value)
    }

    // Save API Key and Voice ID (atomWithStorage handles persistence automatically, but this provides explicit save action)
    const handleSave = () => {
        // atomWithStorage automatically saves, but we can trigger a save by setting the values
        // This is mainly for UI feedback that save was clicked
        setApiKey(apiKey)
        setVoiceId(voiceId)
    }

    // Clear API Key and Voice ID from state (atomWithStorage will also clear from localStorage)
    const handleClear = () => {
        setApiKey('')
        setVoiceId('')
    }

    // Handle adding audio to pack (called from AudioKeyGenerator)
    const handleAddToPack = (category, key, blob) => {
        // For Custom, allow adding (both currentLevels and custom modes)
        if (category === 'Custom') {
            setAudioPack(prev => ({
                ...prev,
                Custom: {
                    ...prev.Custom,
                    [key]: [...(prev.Custom?.[key] || []), blob]
                }
            }))
            return
        }

        // For other categories, check if the key exists in AUDIO
        if (!AUDIO[category] || !(key in AUDIO[category])) {
            alert(`Invalid category/key combination: ${category}.${key}`)
            return
        }
        // Initialize the key in audioPack if it doesn't exist
        setAudioPack(prev => {
            const newPack = { ...prev }
            if (!newPack[category]) {
                newPack[category] = {}
            }
            if (!newPack[category][key]) {
                newPack[category][key] = []
            }
            return {
                ...newPack,
                [category]: {
                    ...newPack[category],
                    [key]: [...newPack[category][key], blob]
                }
            }
        })
    }

    // Handle enabling current levels mode
    const handleEnableCurrentLevels = () => {
        const custom = initializeCustom()
        setAudioPack(prev => ({
            ...prev,
            Custom: { ...custom, ...prev.Custom }
        }))
        setLevelAudioMode('currentLevels')
    }

    // Handle custom Custom cue audio generation
    const handleCustomCueAudioGenerated = (blob, url, text) => {
        setCustomCueAudioBlob(blob)
    }

    // Handle adding custom Custom cue
    const handleAddCustomCue = () => {
        if (validateCustomCueName(customCueName)) {
            alert(validateCustomCueName(customCueName))
            return
        }
        if (!customCueAudioBlob) {
            alert('Please generate audio before adding the cue')
            return
        }
        const clonedBlob = customCueAudioBlob.slice(0, customCueAudioBlob.size, customCueAudioBlob.type || 'audio/mpeg')
        handleAddToPack('Custom', normalizeCustomCueName(customCueName), clonedBlob)
        if (levelAudioMode === 'disabled') setLevelAudioMode('custom')
        setCustomCueAudioBlob(null)
    }


    return (
        <div className="padding-x-sm padding-y-sm">
            <h2>Voice Pack Generator</h2>
            <p className='important'><b>(Tip: Export to save early and often)</b></p>

            <div className="row" style={{ marginBottom: '1rem', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label>
                        <div style={{ marginBottom: '0.5rem' }}>API Key</div>
                        <input
                            type="text"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="Enter Eleven Labs API Key"
                        />
                    </label>
                </div>
                <div style={{ flex: 1 }}>
                    <label>
                        <div style={{ marginBottom: '0.5rem' }}>Voice ID</div>
                        <input
                            type="text"
                            value={voiceId}
                            onChange={(e) => setVoiceId(e.target.value)}
                            placeholder="Enter Eleven Labs Voice ID"
                        />
                    </label>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="button"
                        onClick={handleSave}
                    >
                        Save
                    </button>
                    <button
                        className="button"
                        onClick={handleClear}
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="row" style={{ justifyContent: 'space-around', gap: '1rem', alignItems: 'flex-end' }}>
                <NumberControl
                    label="Speed"
                    value={speed}
                    setValue={setSpeed}
                    min={70}
                    max={120}
                    step={1}
                />
                <NumberControl
                    label="Stability"
                    value={stability}
                    setValue={setStability}
                    min={0}
                    max={100}
                    step={1}
                />
                <NumberControl
                    label="Similarity"
                    value={similarity}
                    setValue={setSimilarity}
                    min={0}
                    max={100}
                    step={1}
                />
            </div>

            <div className="row" style={{ marginBottom: '1rem', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <label>
                        <div style={{ marginBottom: '0.5rem' }}>Category</div>
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                        >
                            <option value="">Select a category</option>
                            {availableCategories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>
                    {categoryDescription && (
                        <div style={{ marginTop: '0.25rem', fontSize: '1rem', color: '#666' }}>
                            {categoryDescription}
                        </div>
                    )}
                </div>
            </div>

            {selectedCategory && (
                <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>{selectedCategory}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {availableAudioKeys.map(key => (
                            <AudioKeyGenerator
                                key={key}
                                category={selectedCategory}
                                audioKey={key}
                                audioPack={audioPack}
                                onAddToPack={handleAddToPack}
                            />
                        ))}
                    </div>
                </div>
            )}



            <CoreAudioCues
                audioPack={audioPack}
                playingAudio={playingAudio}
                onCircleClick={handleCircleClick}
                onDelete={handleDelete}
            />

            {/* Custom Section */}
            <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                <h3>Custom Cues</h3>
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="button"
                        onClick={handleEnableCurrentLevels}
                        disabled={levelAudioMode === 'currentLevels'}
                    >
                        Enable Current Levels
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <h4 style={{ marginBottom: '0.5rem' }}>Add Custom Cue</h4>
                    <div className="row" style={{ marginBottom: '0.5rem', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label>
                                <div style={{ marginBottom: '0.5rem' }}>Cue Name</div>
                                <input
                                    type="text"
                                    value={customCueName}
                                    onChange={(e) => setCustomCueName(e.target.value)}
                                    placeholder="e.g., hello world or Custom.myLevel_END"
                                />
                            </label>
                        </div>
                    </div>
                    <small>Name this cue, then enter its spoken text below. It will be saved as Custom.{normalizeCustomCueName(customCueName) || 'your cue name'}.</small>
                    {cueNameError && <p role="alert">{cueNameError}</p>}
                    <div className="row" style={{ gap: '0.5rem', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                        <AudioGeneration
                            onAudioGenerated={handleCustomCueAudioGenerated}
                            initialText=""
                            selectedCategory="Custom"
                            selectedAudioKey={customCueName}
                            compact={true}
                        />
                        <button
                            className="button"
                            onClick={handleAddCustomCue}
                            disabled={!customCueName.trim() || !!cueNameError || !customCueAudioBlob}
                        >
                            Add Cue
                        </button>
                    </div>
                </div>

                {levelAudioMode === 'currentLevels' && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <p style={{ color: '#666', fontSize: '0.9em' }}>
                            Generate audio for existing Custom cues. Select "Custom" as the category above to generate audio for each cue.
                        </p>
                    </div>
                )}

                <LevelAudioCues
                    audioPack={audioPack}
                    playingAudio={playingAudio}
                    onCircleClick={handleCircleClick}
                    onDelete={handleDelete}
                    mode={levelAudioMode === 'disabled' ? 'custom' : levelAudioMode}
                />
            </div>

            <PackExport />
        </div>
    )
}

export default VoicePackGenerator
