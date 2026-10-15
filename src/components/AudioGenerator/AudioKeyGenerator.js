import React, { useState, useMemo } from 'react'
import { AUDIO_HELPER } from './audioHelper'
import AudioGeneration from './AudioGeneration'

function AudioKeyGenerator({ category, audioKey, audioPack, onAddToPack }) {
    const [audioBlob, setAudioBlob] = useState(null)
    const [savedToPack, setSavedToPack] = useState('')

    // Get helper info for this category and key
    const helperInfo = useMemo(() => {
        if (category && audioKey && AUDIO_HELPER[category]?.[audioKey]) {
            return AUDIO_HELPER[category][audioKey]
        }
        return null
    }, [category, audioKey])

    const description = helperInfo?.description || ''
    const defaultText = helperInfo?.defaultText || ''

    // Handle audio generation completion
    const handleAudioGenerated = (blob, url, text) => {
        setAudioBlob(blob)
        setSavedToPack('') // Clear previous saved location when new audio is generated
    }

    // Handle add to pack
    const handleAddToPackClick = () => {
        if (!audioBlob || !category || !audioKey) {
            alert('Please generate audio before adding to pack')
            return
        }
        // Clone the blob to avoid reference issues
        const clonedBlob = audioBlob.slice()
        // Get current length (or 0 if key doesn't exist yet)
        const currentLength = audioPack[category]?.[audioKey]?.length || 0
        onAddToPack(category, audioKey, clonedBlob)
        setSavedToPack(`Added to ${category}.${audioKey} at index ${currentLength}`)
    }

    return (
        <div className="margin-y-sm">
            <div className="margin-y-sm">
                <strong>{audioKey}</strong>
                {description && (
                    <span style={{ marginLeft: '0.5rem', color: '#666', fontSize: '0.9em' }}>
                        - {description}
                    </span>
                )}
            </div>

            <div>
                <div className="row" style={{ gap: '0.5rem', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
                    <AudioGeneration
                        onAudioGenerated={handleAudioGenerated}
                        initialText={defaultText}
                        selectedCategory={category}
                        selectedAudioKey={audioKey}
                        compact={true}
                    />
                    <button
                        className="button "
                        onClick={handleAddToPackClick}
                        disabled={!audioBlob || !category || !audioKey}
                    >
                        Add
                    </button>
                </div>
            </div>

            {savedToPack && (
                <div className="margin-y-sm" style={{ fontSize: '0.9rem', color: '#2e7d32' }}>
                    <strong>Saved:</strong> {savedToPack}
                </div>
            )}
        </div>
    )
}

export default AudioKeyGenerator
