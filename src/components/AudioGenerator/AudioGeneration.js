import React, { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { apiKeyAtom, voiceIdAtom, speedAtom, stabilityAtom, similarityAtom } from '../../atoms/moddingAtom'

function AudioGeneration({ onAudioGenerated, initialText = '', showDownload = false, selectedCategory, selectedAudioKey, compact = false }) {
    const apiKey = useAtomValue(apiKeyAtom)
    const voiceId = useAtomValue(voiceIdAtom)
    const speed = useAtomValue(speedAtom)
    const stability = useAtomValue(stabilityAtom)
    const similarity = useAtomValue(similarityAtom)
    const [textToSpeech, setTextToSpeech] = useState(initialText)

    const [isGenerating, setIsGenerating] = useState(false)
    const [error, setError] = useState('')
    const [audioUrl, setAudioUrl] = useState(null)
    const [audioBlob, setAudioBlob] = useState(null)
    const [generatedText, setGeneratedText] = useState('')
    const [isPlaying, setIsPlaying] = useState(false)
    const [audioElement, setAudioElement] = useState(null)

    // Update text when initialText prop changes
    useEffect(() => {
        if (initialText) {
            setTextToSpeech(initialText)
        }
    }, [initialText])

    // Generate audio using Eleven Labs API
    const handleGenerate = async () => {
        if (!apiKey || !voiceId || !textToSpeech) {
            setError('Please fill in API Key, Voice ID, and Text to Speech fields')
            return
        }

        setIsGenerating(true)
        setError('')
        // Stop any currently playing audio
        if (audioElement) {
            audioElement.pause()
            setAudioElement(null)
        }
        setIsPlaying(false)
        setAudioUrl(null)
        setGeneratedText('')

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey
                },
                body: JSON.stringify({
                    text: textToSpeech,
                    model_id: 'eleven_multilingual_v2',
                    output_format: 'mp3_44100_128',
                    voice_settings: {
                        stability: stability / 100, // Convert from 0-100 to 0-1
                        similarity_boost: similarity / 100, // Convert from 0-100 to 0-1
                        speed: speed / 100 // Convert from 70-120 to 0.7-1.2
                    }
                })
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: { message: 'Unknown error' } }))
                throw new Error(errorData.detail?.message || `HTTP error! status: ${response.status}`)
            }

            // Convert the response to a blob
            const blob = await response.blob()
            console.log('Audio blob received:', { type: blob.type, size: blob.size })

            // Verify it's an audio blob
            if (!blob.type.startsWith('audio/') && blob.type !== '') {
                console.warn('Unexpected blob type:', blob.type)
            }

            const url = URL.createObjectURL(blob)
            setAudioUrl(url)
            setAudioBlob(blob)
            setGeneratedText(textToSpeech)

            // Notify parent component
            if (onAudioGenerated) {
                onAudioGenerated(blob, url, textToSpeech)
            }

            // Automatically play the generated audio once
            playAudioAutomatically(url)
        } catch (err) {
            setError(err.message || 'Failed to generate audio')
            console.error('Error generating audio:', err)
        } finally {
            setIsGenerating(false)
        }
    }

    // Download the generated audio
    const handleDownload = () => {
        if (!audioUrl) return

        const link = document.createElement('a')
        link.href = audioUrl
        const filename = selectedCategory && selectedAudioKey
            ? `${selectedCategory}_${selectedAudioKey}.mp3`
            : 'generated_audio.mp3'
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Shared function to play audio from a URL
    const playAudioFromUrl = async (url, showErrors = true) => {
        if (!url) return

        try {
            // Stop any currently playing audio
            if (audioElement) {
                audioElement.pause()
                setAudioElement(null)
            }
            setIsPlaying(false)

            const audio = new Audio(url)

            // Wait for audio to be ready to play
            await new Promise((resolve, reject) => {
                audio.oncanplaythrough = resolve
                audio.onerror = (e) => {
                    console.error('Audio loading error:', e, audio.error)
                    reject(new Error(audio.error?.message || 'Failed to load audio'))
                }
                // If already loaded, resolve immediately
                if (audio.readyState >= 3) {
                    resolve()
                }
            })

            audio.onended = () => {
                setIsPlaying(false)
                setAudioElement(null)
            }
            audio.onpause = () => {
                setIsPlaying(false)
            }
            audio.onerror = (e) => {
                console.error('Audio playback error:', e, audio.error)
                if (showErrors) {
                    setError('Error playing audio: ' + (audio.error?.message || 'Unknown error'))
                }
                setIsPlaying(false)
                setAudioElement(null)
            }
            setAudioElement(audio)
            await audio.play()
            setIsPlaying(true)
        } catch (err) {
            console.error('Error playing audio:', err)
            if (showErrors) {
                setError('Error playing audio: ' + (err.message || 'Unknown error'))
            }
            setIsPlaying(false)
            setAudioElement(null)
        }
    }

    // Helper function to play audio automatically (without showing errors)
    const playAudioAutomatically = async (url) => {
        await playAudioFromUrl(url, false)
    }

    // Handle play/pause
    const handlePlayPause = async () => {
        if (!audioUrl) return

        try {
            if (!audioElement) {
                // No audio element exists, play from URL
                await playAudioFromUrl(audioUrl, true)
            } else {
                // Audio element exists, toggle play/pause
                if (isPlaying) {
                    audioElement.pause()
                    setIsPlaying(false)
                } else {
                    await audioElement.play()
                    setIsPlaying(true)
                }
            }
        } catch (err) {
            console.error('Error playing audio:', err)
            setError('Error playing audio: ' + (err.message || 'Unknown error'))
            setIsPlaying(false)
            setAudioElement(null)
        }
    }

    // Clean up audio URL and element when audioUrl changes (but keep element if URL is the same)
    useEffect(() => {
        return () => {
            // Only clean up if we're actually changing the URL
            if (audioUrl) {
                // Small delay to ensure audio has finished playing
                const timeoutId = setTimeout(() => {
                    URL.revokeObjectURL(audioUrl)
                }, 100)
                return () => clearTimeout(timeoutId)
            }
        }
    }, [audioUrl])

    // Clean up audio element on unmount
    useEffect(() => {
        return () => {
            if (audioElement) {
                audioElement.pause()
                audioElement.onended = null
                audioElement.onpause = null
                audioElement.onerror = null
                audioElement.oncanplaythrough = null
            }
        }
    }, [audioElement])

    if (compact) {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="row" style={{ gap: '0.5rem', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <input
                            type="text"
                            value={textToSpeech}
                            onChange={(e) => setTextToSpeech(e.target.value)}
                            placeholder="Enter text to generate audio"
                        />
                    </div>
                    <button
                        className="button button-primary"
                        onClick={handleGenerate}
                        disabled={isGenerating || !apiKey || !voiceId || !textToSpeech}
                    >
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                    {showDownload && (
                        <button
                            className="button"
                            onClick={handleDownload}
                            disabled={!audioUrl}
                        >
                            Download
                        </button>
                    )}
                    {audioUrl && (
                        <button
                            className="button"
                            onClick={handlePlayPause}
                        >
                            {isPlaying ? 'Pause' : 'Play'}
                        </button>
                    )}
                </div>
                {error && (
                    <div className="margin-y-sm" style={{ color: '#FF3333', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div style={{ marginBottom: '1rem' }}>
            <label>
                <div style={{ marginBottom: '0.5rem' }}>Text to Speech</div>
                <input
                    type="text"
                    value={textToSpeech}
                    onChange={(e) => setTextToSpeech(e.target.value)}
                    placeholder="Enter text to generate audio"
                />
            </label>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <button
                    className="button button-primary"
                    onClick={handleGenerate}
                    disabled={isGenerating || !apiKey || !voiceId || !textToSpeech}
                >
                    {isGenerating ? 'Generating...' : 'Generate Audio'}
                </button>
                {showDownload && (
                    <button
                        className="button"
                        onClick={handleDownload}
                        disabled={!audioUrl}
                    >
                        Download Audio
                    </button>
                )}
            </div>

            {error && (
                <div style={{ marginBottom: '1rem', color: '#FF3333', padding: '0.5rem', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
                    {error}
                </div>
            )}

            {audioUrl && (
                <div style={{ marginBottom: '1rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>Generated Audio:</div>
                    <audio controls src={audioUrl} style={{ width: '100%', marginBottom: '0.5rem' }} />
                    {generatedText && (
                        <div style={{ marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px', fontSize: '0.9rem', color: '#666' }}>
                            <strong>Text:</strong> {generatedText}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AudioGeneration
