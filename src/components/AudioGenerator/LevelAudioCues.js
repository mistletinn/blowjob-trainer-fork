import React, { useState, useMemo } from 'react'
import { AUDIO } from '../Tasks/audio'
import { AUDIO_HELPER } from './audioHelper'

function LevelAudioCues({ audioPack, playingAudio, onCircleClick, onDelete, mode }) {
    const [expanded, setExpanded] = useState(true) // Default to expanded
    const [selectedAudio, setSelectedAudio] = useState(null) // Track which audio cue is selected {category, key, index}

    // Get all Custom cues for display
    const customCues = useMemo(() => {
        const keys = []
        if (mode === 'currentLevels') {
            // Show existing cues from AUDIO.Custom
            if (AUDIO.Custom && typeof AUDIO.Custom === 'object') {
                for (const key in AUDIO.Custom) {
                    if (key !== 'desc' && AUDIO.Custom[key] !== null && AUDIO.Custom[key] !== 'non') {
                        keys.push(key)
                    }
                }
            }
        }
        // Include user-created and imported cues in either editing mode.
        for (const key of Object.keys(audioPack.Custom || {})) {
            if (!keys.includes(key)) keys.push(key)
        }
        return keys.sort()
    }, [audioPack, mode])

    // Calculate how many keys have at least 1 audio file
    const doneCount = customCues.filter(key => {
        const fileCount = audioPack.Custom?.[key]?.length || 0
        return fileCount > 0
    }).length
    const totalCount = customCues.length

    return (
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
            <div
                style={{
                    fontWeight: 'bold',
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? '▼' : '▶'} Custom
                <span style={{ fontWeight: 'normal', color: '#999', marginLeft: '0.5rem' }}>
                    - {doneCount}/{totalCount}
                </span>
                {AUDIO_HELPER.Custom?.desc && (
                    <span style={{ fontWeight: 'normal', color: '#999', marginLeft: '0.5rem' }}>
                        - {AUDIO_HELPER.Custom.desc}
                    </span>
                )}
                {mode === 'custom' && (
                    <span style={{ fontWeight: 'normal', color: '#666', marginLeft: '0.5rem', fontSize: '0.9em' }}>
                        (Custom Mode)
                    </span>
                )}
            </div>
            {expanded && (
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {customCues.length === 0 ? (
                        <div style={{ marginLeft: '1rem', color: '#999', fontStyle: 'italic' }}>
                            {mode === 'custom' ? 'No custom cues yet. Add cues using the form above.' : 'No Custom cues available.'}
                        </div>
                    ) : (
                        customCues.map(key => {
                            const fileCount = audioPack.Custom?.[key]?.length || 0
                            return (
                                <div key={key} style={{ marginLeft: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center' }}>- {key}</span>
                                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                        {Array.from({ length: fileCount }).map((_, index) => {
                                            const isPlaying = playingAudio?.category === 'Custom' &&
                                                playingAudio?.key === key &&
                                                playingAudio?.index === index
                                            const isSelected = selectedAudio?.category === 'Custom' &&
                                                selectedAudio?.key === key &&
                                                selectedAudio?.index === index
                                            const isActive = isPlaying || isSelected
                                            return (
                                                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <span
                                                        onClick={() => {
                                                            onCircleClick('Custom', key, index)
                                                            setSelectedAudio({ category: 'Custom', key, index })
                                                        }}
                                                        style={{
                                                            cursor: 'pointer',
                                                            fontSize: '3rem',
                                                            userSelect: 'none',
                                                            lineHeight: '1'
                                                        }}
                                                    >
                                                        {isActive ? '●' : '○'}
                                                    </span>
                                                    {isSelected && onDelete && (
                                                        <span
                                                            onClick={() => {
                                                                onDelete('Custom', key, index)
                                                                setSelectedAudio(null)
                                                            }}
                                                            style={{
                                                                cursor: 'pointer',
                                                                fontSize: '0.875rem',
                                                                color: '#666',
                                                                padding: '0.25rem 0.5rem',
                                                                userSelect: 'none'
                                                            }}
                                                        >
                                                            del
                                                        </span>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            )}
        </div>
    )
}

export default LevelAudioCues
