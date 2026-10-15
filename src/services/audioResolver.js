/**
 * Audio Resolver - Resolves string references like "Category.KEY" to actual audio paths
 * Supports shared non-modded audio, default packs, and custom audio packs
 */

import { canonicalAudioReference, hasAudio } from './customAudio'
import { AUDIO_SHARED } from '../components/Tasks/audioShared'

// Avoid circular dependency by accessing audioManager through a function
let audioManagerRef = null
export const setAudioManagerRef = (manager) => {
    audioManagerRef = manager
}

// List of non-modded categories that always use AUDIO_SHARED
const NON_MODDED_CATEGORIES = ['Sfx', 'Calibration', 'NONE']

/**
 * Resolves an audio reference to a file path or array of paths
 * @param {string|string[]|object} audioRef - Can be:
 *   - String: "Category.KEY" (e.g., "Feedback.PERFECT")
 *   - String: Direct path (e.g., "audio/feedback/perfect.mp3")
 *   - Array: ["Category.KEY1", "Category.KEY2"]
 *   - Object: Direct audio object (backward compatibility)
 * @param {object} customAudioPack - Optional custom audio pack object
 * @param {string} voiceSelection - Voice selection: 'female', 'male', or custom pack ID
 * @returns {string|string[]|null} - Resolved audio path(s) or null if not found
 */
export const resolveAudioReference = (audioRef, customAudioPack = null, voiceSelection = 'female') => {
    audioRef = canonicalAudioReference(audioRef)
    // Handle null/undefined
    if (!audioRef) {
        return null
    }

    // Backward compatibility: if it's already a path or array of paths, return as-is
    if (typeof audioRef === 'string' && audioRef.includes('/')) {
        return audioRef
    }
    if (Array.isArray(audioRef) && audioRef.length > 0 && typeof audioRef[0] === 'string' && audioRef[0].includes('/')) {
        return audioRef
    }

    // Handle string reference like "Category.KEY"
    if (typeof audioRef === 'string' && audioRef.includes('.')) {
        const separator = audioRef.indexOf('.')
        const category = audioRef.slice(0, separator)
        const key = audioRef.slice(separator + 1)

        // Check if category is non-modded (always use shared)
        if (NON_MODDED_CATEGORIES.includes(category)) {
            const sharedValue = AUDIO_SHARED[category]?.[key]
            if (sharedValue !== undefined) {
                return sharedValue
            }
            console.warn(`Non-modded audio reference not found: ${audioRef}`)
            return null
        }

        // For moddable categories:
        // 1. Try default packs first (if voiceSelection is female_default or male_default)
        if (voiceSelection === 'female_default' || voiceSelection === 'male_default') {
            // Get default pack from audioManager
            const defaultPack = audioManagerRef?.getDefaultPack?.(voiceSelection)
            if (defaultPack && defaultPack.audioFiles) {
                const defaultValue = defaultPack.audioFiles[category]?.[key]
                if (hasAudio(defaultValue)) {
                    return defaultValue
                }
                return null
            }
        }
        
        // 2. Try custom pack (if voiceSelection is a pack ID)
        if (voiceSelection && voiceSelection !== 'female_default' && voiceSelection !== 'male_default') {
            // voiceSelection is a custom pack ID
            const selectedPack = audioManagerRef?.getDefaultPack?.(voiceSelection) || (customAudioPack?.id === voiceSelection ? customAudioPack : null)
            if (selectedPack && selectedPack.audioFiles) {
                const customValue = selectedPack.audioFiles[category]?.[key]
                if (hasAudio(customValue)) {
                    return customValue
                }
                // No fallback for other moddable categories in custom packs
                return null
            }
        }

        console.warn(`Audio reference not found: ${audioRef}`)
        return null
    }

    // Handle array of string references
    if (Array.isArray(audioRef)) {
        return audioRef.map(ref => resolveAudioReference(ref, customAudioPack, voiceSelection)).filter(Boolean)
    }

    // Backward compatibility: return object as-is (direct audio object)
    return audioRef
}

/**
 * Gets a random audio file from a reference (handles arrays)
 * @param {string|string[]|object} audioRef - Audio reference
 * @param {object} customAudioPack - Optional custom audio pack
 * @param {string} voiceSelection - Voice selection: 'female', 'male', or custom pack ID
 * @returns {string|null} - Single audio file path or null
 */
export const getAudioFile = (audioRef, customAudioPack = null, voiceSelection = 'female') => {
    const resolved = resolveAudioReference(audioRef, customAudioPack, voiceSelection)

    if (!resolved) {
        return null
    }

    // Handle arrays - pick random
    if (Array.isArray(resolved)) {
        return resolved[Math.floor(Math.random() * resolved.length)]
    }

    return resolved
}

/**
 * Gets the string key for an audio path (reverse lookup)
 * @param {string} audioPath - Audio file path
 * @param {object} customAudioPack - Optional custom audio pack
 * @returns {string|null} - String reference like "Category.KEY" or null
 */
export const getAudioKey = (audioPath, customAudioPack = null) => {
    // If it's already a string reference (Category.KEY format), return it
    if (typeof audioPath === 'string' && audioPath.includes('.') && !audioPath.includes('/')) {
        return audioPath
    }

    // Check custom pack first
    if (customAudioPack && customAudioPack.audioFiles) {
        for (const category in customAudioPack.audioFiles) {
            for (const key in customAudioPack.audioFiles[category]) {
                const value = customAudioPack.audioFiles[category][key]
                if (value === audioPath || (Array.isArray(value) && value.includes(audioPath))) {
                    return `${category}.${key}`
                }
            }
        }
    }

    // Check shared audio
    for (const category in AUDIO_SHARED) {
        if (typeof AUDIO_SHARED[category] === 'object') {
            for (const key in AUDIO_SHARED[category]) {
                const value = AUDIO_SHARED[category][key]
                if (value === audioPath || (Array.isArray(value) && value.includes(audioPath))) {
                    return `${category}.${key}`
                }
            }
        }
    }

    return null
}
