import React, { useState, useMemo } from 'react'
import { AUDIO } from '../Tasks/audio'
import { AUDIO_HELPER } from './audioHelper'

function CoreAudioCues({ audioPack, playingAudio, onCircleClick, onDelete }) {
    const [expandedCategories, setExpandedCategories] = useState({}) // Track which categories are expanded
    const [selectedAudio, setSelectedAudio] = useState(null) // Track which audio cue is selected {category, key, index}

    // Get all core audio cues for display
    const coreAudioCues = useMemo(() => {
        const cues = []
        // Non-themeable categories that should be excluded
        const nonThemeableCategories = ['NONE', 'Sfx', 'Calibration', 'Custom']
        for (const category in AUDIO) {
            if (!nonThemeableCategories.includes(category)) {
                if (typeof AUDIO[category] === 'object' && AUDIO[category] !== null) {
                    const keys = []
                    for (const key in AUDIO[category]) {
                        if (AUDIO[category][key] !== null && AUDIO[category][key] !== 'non') {
                            keys.push(key)
                        }
                    }
                    if (keys.length > 0) {
                        cues.push({ category, keys })
                    }
                }
            }
        }
        return cues
    }, [])

    // Toggle category expansion
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }))
    }

    return (
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
            <h3>Core Audio Cues</h3>
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {coreAudioCues.map(({ category, keys }) => {
                    const isExpanded = expandedCategories[category] === true // Default to collapsed
                    // Calculate how many keys have at least 1 audio file
                    const doneCount = keys.filter(key => {
                        const fileCount = audioPack[category]?.[key]?.length || 0
                        return fileCount > 0
                    }).length
                    const totalCount = keys.length
                    return (
                        <div key={category} style={{ marginBottom: '1rem' }}>
                            <div
                                style={{
                                    fontWeight: 'bold',
                                    marginBottom: '0.5rem',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}
                                onClick={() => toggleCategory(category)}
                            >
                                {isExpanded ? '▼' : '▶'} {category}
                                <span style={{ fontWeight: 'normal', color: '#999', marginLeft: '0.5rem' }}>
                                    - {doneCount}/{totalCount}
                                </span>
                                {AUDIO_HELPER[category]?.desc && (
                                    <span style={{ fontWeight: 'normal', color: '#999', marginLeft: '0.5rem' }}>
                                        - {AUDIO_HELPER[category].desc}
                                    </span>
                                )}
                            </div>
                            {isExpanded && keys.map(key => {
                                const fileCount = audioPack[category]?.[key]?.length || 0
                                return (
                                    <div key={key} style={{ marginLeft: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center' }}>- {key}</span>
                                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                            {Array.from({ length: fileCount }).map((_, index) => {
                                                const isPlaying = playingAudio?.category === category &&
                                                    playingAudio?.key === key &&
                                                    playingAudio?.index === index
                                                const isSelected = selectedAudio?.category === category &&
                                                    selectedAudio?.key === key &&
                                                    selectedAudio?.index === index
                                                const isActive = isPlaying || isSelected
                                                return (
                                                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <span
                                                            onClick={() => {
                                                                try {
                                                                    onCircleClick(category, key, index)
                                                                    setSelectedAudio({ category, key, index })
                                                                } catch (err) {
                                                                    console.error('[CoreAudioCues] circle click error', { category, key, index, errorName: err?.name, errorMessage: err?.message, error: err })
                                                                }
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
                                                                    onDelete(category, key, index)
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
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CoreAudioCues
