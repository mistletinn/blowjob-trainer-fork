const audioElements = new Map()
let audioUnlocked = false

const getAudioElement = (audioUrl) => {
    if (!audioElements.has(audioUrl)) {
        const audio = new Audio(audioUrl)
        audio.preload = 'auto'
        audio.onerror = () => console.error(`[AudioPlayback] Error loading audio file: ${audioUrl}`)
        audioElements.set(audioUrl, audio)
    }

    return audioElements.get(audioUrl)
}

export const isAudioUnlocked = () => audioUnlocked

export const unlockAudio = async (audioUrl = 'audio/calibration/cal_1.mp3') => {
    try {
        await playAudioUrl(audioUrl, { context: 'unlock' })
        audioUnlocked = true
        return true
    } catch (error) {
        audioUnlocked = false
        console.error('[AudioPlayback] Audio unlock failed:', {
            url: audioUrl,
            errorName: error?.name,
            errorMessage: error?.message,
            unlocked: audioUnlocked
        })
        return false
    }
}

export const playAudioUrl = async (audioUrl, options = {}) => {
    if (!audioUrl) {
        console.error('[AudioPlayback] No audio URL provided')
        return false
    }

    const audio = getAudioElement(audioUrl)

    try {
        audio.pause()
        audio.currentTime = 0
        await audio.play()
        if (options.markUnlocked) {
            audioUnlocked = true
        }
        return true
    } catch (error) {
        console.error('[AudioPlayback] Error playing audio:', {
            url: audioUrl,
            context: options.context || 'play',
            errorName: error?.name,
            errorMessage: error?.message,
            unlocked: audioUnlocked
        })
        throw error
    }
}
