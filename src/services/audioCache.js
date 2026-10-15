/**
 * Audio Cache - In-memory cache for audio files from ZIPs
 * Avoids IndexedDB/blob URL issues on itch.io by keeping audio in memory
 */

// In-memory cache of audio data URLs
const audioCache = new Map()

/**
 * Store audio file as data URL in memory
 * @param {string} packId - Pack ID
 * @param {string} filePath - File path within pack
 * @param {Blob} blob - Audio blob
 * @returns {Promise<string>} Data URL that can be used to play audio
 */
export const cacheAudioFile = async (packId, filePath, blob) => {
    const id = `${packId}:${filePath}`
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            const dataUrl = reader.result
            audioCache.set(id, dataUrl)
            resolve(dataUrl)
        }
        reader.onerror = () => {
            console.error('Error reading blob as data URL')
            reject(reader.error)
        }
        reader.readAsDataURL(blob)
    })
}

/**
 * Get audio file data URL from cache
 * @param {string} packId - Pack ID
 * @param {string} filePath - File path within pack
 * @returns {string|null} Data URL or null if not cached
 */
export const getAudioFromCache = (packId, filePath) => {
    const id = `${packId}:${filePath}`
    return audioCache.get(id) || null
}

/**
 * Clear all cached audio for a pack
 * @param {string} packId - Pack ID to clear
 */
export const clearPackCache = (packId) => {
    for (const [key] of audioCache.entries()) {
        if (key.startsWith(`${packId}:`)) {
            audioCache.delete(key)
        }
    }
}

/**
 * Clear all cached audio
 */
export const clearAllCache = () => {
    audioCache.clear()
}

/**
 * Get cache stats
 */
export const getCacheStats = () => {
    return {
        totalFiles: audioCache.size,
        packs: [...new Set([...audioCache.keys()].map(key => key.split(':')[0]))]
    }
}
