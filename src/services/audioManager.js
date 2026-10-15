/**
 * Audio Manager - Manages default and custom audio packs
 * Provides unified API for accessing audio files
 */

import { AUDIO } from '../components/Tasks/audio'
import { storageService, audioFileService } from './storageService'
import { resolveAudioReference, getAudioFile as resolveAudioFile, getAudioKey as resolveAudioKey, setAudioManagerRef } from './audioResolver'
import { loadDefaultPack, shouldLoadPack, markPackLoaded } from './defaultPackLoader'

let activeCustomPack = null
let packRevision = 0
const packListeners = new Set()
const notifyPacks = () => {
    packRevision++
    packListeners.forEach(listener => listener())
}
let defaultPacks = {} // Stores female_default and male_default packs

// Set reference for circular dependency resolution
setAudioManagerRef({
    getDefaultPack: (packId) => defaultPacks[packId] || null
})

// Helper to get voice selection - reads from atom if available, otherwise defaults to 'female'
// Note: In service files, we read from storage directly for voiceSelectionAtom since it uses atomWithStorage
const getVoiceSelection = () => {
    try {
        // Try to read from localStorage directly (since voiceSelectionAtom uses atomWithStorage)
        const stored = localStorage.getItem('voice_selection')
        let selection = stored
        try { selection = JSON.parse(stored) } catch (e) { /* Legacy unquoted value */ }
        return selection === 'male' ? 'male_default' : (!selection || selection === 'female' ? 'female_default' : selection)
    } catch (e) {
        return 'female_default'
    }
}

/**
 * Load active custom audio pack from storage
 */
const loadActivePack = () => {
    const activePackId = storageService.getActiveAudioPack()
    if (activePackId) {
        activeCustomPack = storageService.loadAudioPack(activePackId)
    } else {
        activeCustomPack = null
    }
}

// Initialize on module load
loadActivePack()

/**
 * Audio Manager API
 */
export const audioManager = {
    subscribe: listener => {
        packListeners.add(listener)
        return () => packListeners.delete(listener)
    },
    getPackRevision: () => packRevision,
    getSelectedPack: () => {
        const id = getVoiceSelection()
        return defaultPacks[id] || (activeCustomPack?.id === id ? activeCustomPack : null)
    },
    /**
     * Load default voice packs from ZIP files
     * @returns {Promise<void>}
     */
    loadDefaultPacks: async () => {
        console.log('[AudioManager] Loading default packs...')
        
        const packs = [
            { url: './audio_female_default.zip', id: 'female_default', name: 'Female Voice (Default)' },
            { url: './audio_male_default.zip', id: 'male_default', name: 'Male Voice (Default)' }
        ]
        
        for (const { url, id, name } of packs) {
            try {
                // Check if pack needs loading (just version check, not data)
                const needsLoad = shouldLoadPack(id)
                
                if (needsLoad) {
                    console.log(`[AudioManager] Loading ${name}...`)
                    const pack = await loadDefaultPack(url, id, name)
                    defaultPacks[id] = pack
                    notifyPacks()
                    markPackLoaded(id, pack.version || '1.0.0')
                    console.log(`[AudioManager] ${name} loaded successfully`)
                } else {
                    console.log(`[AudioManager] ${name} already in cache, reloading...`)
                    // Always reload the pack since data URLs are only in memory
                    const pack = await loadDefaultPack(url, id, name)
                    defaultPacks[id] = pack
                    notifyPacks()
                    console.log(`[AudioManager] ${name} reloaded`)
                }
            } catch (error) {
                console.error(`[AudioManager] Failed to load ${name}:`, error)
            }
        }
        
        console.log('[AudioManager] Default packs ready:', Object.keys(defaultPacks))
    },
    
    /**
     * Register a custom pack in memory (for uploaded ZIPs)
     * @param {object} pack - Pack object with id, name, description, audioFiles (with data URLs)
     */
    registerCustomPack: (pack) => {
        // Store in defaultPacks alongside built-in packs (all use same in-memory approach)
        defaultPacks[pack.id] = pack
        notifyPacks()
        console.log(`[AudioManager] Registered custom pack: ${pack.name}`)
    },
    
    /**
     * Get a default pack by ID
     * @param {string} packId - Pack ID (e.g., 'female_default')
     * @returns {object|null} - Pack object or null
     */
    getDefaultPack: (packId) => {
        return defaultPacks[packId] || null
    },
    /**
     * Get audio file path(s) for a reference
     * @param {string|string[]|object} audioRef - Audio reference
     * @returns {string|string[]|null} - Resolved audio path(s)
     */
    getAudio: (audioRef) => {
        const currentVoiceSelection = getVoiceSelection()
        return resolveAudioReference(audioRef, activeCustomPack, currentVoiceSelection)
    },

    /**
     * Get a single random audio file from a reference (synchronous version for backward compatibility)
     * Note: This doesn't resolve custom content URLs - use getAudioFile() for that
     * @param {string|string[]|object} audioRef - Audio reference
     * @returns {string|null} - Single audio file path
     */
    getAudioFileSync: (audioRef) => {
        const currentVoiceSelection = getVoiceSelection()
        return resolveAudioFile(audioRef, activeCustomPack, currentVoiceSelection)
    },

    /**
     * Get a single random audio file from a reference
     * @param {string|string[]|object} audioRef - Audio reference
     * @returns {Promise<string|null>} - Single audio file path/URL (data URL for default packs)
     */
    getAudioFile: async (audioRef) => {
        const currentVoiceSelection = getVoiceSelection()
        const resolved = resolveAudioFile(audioRef, activeCustomPack, currentVoiceSelection)

        // For default packs, resolved is already a data URL (data:audio/mpeg;base64,...)
        // For custom packs, it might be a custom-content:// URL that needs IndexedDB lookup
        if (resolved && resolved.startsWith('custom-content://')) {
            const url = await audioFileService.getAudioFile(resolved)
            return url || resolved // Fallback to original if not found
        }

        return resolved
    },

    /**
     * Get the string key for an audio path (reverse lookup)
     * @param {string} audioPath - Audio file path
     * @returns {string|null} - String reference like "Category.KEY" or null
     */
    getAudioKey: (audioPath) => {
        return resolveAudioKey(audioPath, activeCustomPack)
    },

    /**
     * Get the default AUDIO object (for backward compatibility)
     */
    getDefaultAudio: () => {
        return AUDIO
    },

    /**
     * Get active custom audio pack
     */
    getActiveCustomPack: () => {
        return activeCustomPack
    },

    /**
     * Set active custom audio pack
     * @param {string|null} packId - Pack ID or null to use default
     */
    setActiveCustomPack: (packId) => {
        if (packId) {
            activeCustomPack = storageService.loadAudioPack(packId)
            storageService.setActiveAudioPack(packId)
            // Update voice selection atom
            try {
                localStorage.setItem('voice_selection', JSON.stringify(packId))
            } catch (e) {
                // Ignore storage errors
            }
        } else {
            activeCustomPack = null
            storageService.setActiveAudioPack(null)
            // Reset to default voice
            try {
                localStorage.setItem('voice_selection', JSON.stringify('female_default'))
            } catch (e) {
                // Ignore storage errors
            }
        }
    },

    /**
     * Get all available audio packs (default + custom)
     */
    getAllPacks: () => {
        const customPacks = storageService.getAllAudioPacks()
        return {
            default: {
                id: 'default',
                name: 'Default Audio Pack',
                isDefault: true
            },
            ...customPacks
        }
    },

    /**
     * Get all available voices (built-in + custom packs)
     * @returns {Array} Array of voice objects with id, name, type, description, sample
     */
    getAllVoices: () => {
        const voices = []
        
        // Add all packs from defaultPacks (includes both built-in and uploaded custom packs)
        for (const [packId, pack] of Object.entries(defaultPacks)) {
            const isBuiltin = packId === 'female_default' || packId === 'male_default'
            voices.push({
                id: pack.id,
                name: pack.name,
                type: isBuiltin ? 'builtin' : 'custom',
                description: pack.description || '',
                sample: pack.audioFiles?.About?.SAMPLE || null
            })
        }

        return voices
    },

    /**
     * Set active voice (built-in or custom pack)
     * @param {string} voiceId - 'female_default', 'male_default', or custom pack ID
     */
    setVoice: (voiceId) => {
        // Check if it's in defaultPacks (includes both built-in and custom uploaded packs)
        if (defaultPacks[voiceId]) {
            try {
                localStorage.setItem('voice_selection', JSON.stringify(voiceId))
            } catch (e) {
                // Ignore storage errors
            }
            // Set as active pack for resolution
            activeCustomPack = defaultPacks[voiceId]
            storageService.setActiveAudioPack(null) // Don't save to active pack storage
        } else {
            // Fallback to old custom pack system (shouldn't happen with new approach)
            audioManager.setActiveCustomPack(voiceId)
        }
        notifyPacks()
    },

    /**
     * Save a custom audio pack
     * @param {object} packData - Pack data with id, name, audioFiles, etc.
     */
    savePack: (packData) => {
        return storageService.saveAudioPack(packData)
    },

    /**
     * Load a custom audio pack
     * @param {string} packId - Pack ID
     */
    loadPack: (packId) => {
        return storageService.loadAudioPack(packId)
    },

    /**
     * Delete a custom audio pack
     * @param {string} packId - Pack ID
     */
    deletePack: async (packId) => {
        // Delete audio files
        await audioFileService.deletePackFiles(packId)

        // Delete pack metadata
        storageService.deleteAudioPack(packId)

        // If this was the active pack, clear it
        if (activeCustomPack && activeCustomPack.id === packId) {
            audioManager.setActiveCustomPack(null)
        }
    }
}
