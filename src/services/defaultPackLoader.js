/**
 * Default Pack Loader - Loads default female/male voice packs from ZIP files
 * Caches audio files in memory (not IndexedDB) for itch.io compatibility
 */

import JSZip from 'jszip'
import { cacheAudioFile } from './audioCache'

/** Get MIME type from file path so blobs from ZIP play correctly (JSZip returns blob with no type). */
function mimeTypeFromPath(filePath) {
    const ext = (filePath || '').split('.').pop()?.toLowerCase()
    const map = {
        mp3: 'audio/mpeg',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        m4a: 'audio/mp4',
        webm: 'audio/webm',
        aac: 'audio/aac'
    }
    return map[ext] || 'application/octet-stream'
}

/**
 * Load a default pack from a ZIP file
 * @param {string} zipUrl - URL to the ZIP file in public folder
 * @param {string} packId - Unique ID for this pack (e.g., 'female_default')
 * @param {string} packName - Display name for this pack
 * @returns {Promise<object>} Pack metadata with manifest (audioFiles paths converted to custom-content:// URLs)
 */
export const loadDefaultPack = async (zipUrl, packId, packName) => {
    console.log(`[DefaultPackLoader] Loading pack: ${packName} from ${zipUrl}`)
    
    try {
        // Fetch the ZIP file (use relative path for itch.io compatibility)
        console.log(`[DefaultPackLoader] Fetching from: ${zipUrl}`)
        const response = await fetch(zipUrl)
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${zipUrl}: ${response.status} ${response.statusText}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        const zip = await JSZip.loadAsync(arrayBuffer)
        
        // Extract audio-pack.json
        const manifestFile = zip.file('audio-pack.json')
        if (!manifestFile) {
            throw new Error(`No audio-pack.json found in ${zipUrl}`)
        }
        
        const manifestText = await manifestFile.async('text')
        const manifest = JSON.parse(manifestText)
        
        console.log(`[DefaultPackLoader] Manifest loaded for ${packName}`)
        
        // Convert manifest audioFiles to use direct data URLs (cached in memory)
        const convertedAudioFiles = {}
        let fileCount = 0
        
        for (const [category, keys] of Object.entries(manifest.audioFiles || {})) {
            convertedAudioFiles[category] = {}
            
            for (const [key, paths] of Object.entries(keys)) {
                if (Array.isArray(paths)) {
                    // Handle array of file paths
                    const dataUrls = []
                    for (const path of paths) {
                        const file = zip.file(path)
                        if (file) {
                            const blob = await file.async('blob')
                            // Set correct MIME type
                            const mimeType = mimeTypeFromPath(path)
                            const typedBlob = new Blob([blob], { type: mimeType })
                            
                            // Cache in memory and get data URL
                            const dataUrl = await cacheAudioFile(packId, path, typedBlob)
                            dataUrls.push(dataUrl)
                            fileCount++
                        } else {
                            console.warn(`[DefaultPackLoader] File not found in ZIP: ${path}`)
                        }
                    }
                    convertedAudioFiles[category][key] = dataUrls
                } else if (typeof paths === 'string') {
                    // Handle single file path
                    const file = zip.file(paths)
                    if (file) {
                        const blob = await file.async('blob')
                        const mimeType = mimeTypeFromPath(paths)
                        const typedBlob = new Blob([blob], { type: mimeType })
                        
                        // Cache in memory and get data URL
                        const dataUrl = await cacheAudioFile(packId, paths, typedBlob)
                        convertedAudioFiles[category][key] = dataUrl
                        fileCount++
                    } else {
                        console.warn(`[DefaultPackLoader] File not found in ZIP: ${paths}`)
                    }
                }
            }
        }
        
        console.log(`[DefaultPackLoader] Cached ${fileCount} audio files for ${packName} in memory`)
        
        // Return pack metadata with data URLs
        return {
            id: packId,
            name: packName,
            description: manifest.description || '',
            audioFiles: convertedAudioFiles, // Now contains direct data URLs
            version: manifest.version || '1.0.0'
        }
    } catch (error) {
        console.error(`[DefaultPackLoader] Failed to load pack ${packName}:`, error)
        throw error
    }
}

/**
 * Check if a default pack needs to be loaded from scratch
 * Note: Since we cache in memory, we always reload on page refresh
 * This function just checks if we should skip the version flag update
 * @param {string} packId - Pack ID to check
 * @param {string} expectedVersion - Expected version from manifest
 * @returns {boolean} True if this is a new version
 */
export const shouldLoadPack = (packId, expectedVersion = '1.0.0') => {
    const storedVersion = localStorage.getItem(`default_pack_version_${packId}`)
    return !storedVersion || storedVersion !== expectedVersion
}

/**
 * Mark a pack as loaded with its version
 * @param {string} packId - Pack ID
 * @param {string} version - Pack version
 */
export const markPackLoaded = (packId, version) => {
    localStorage.setItem(`default_pack_version_${packId}`, version)
    localStorage.setItem(`default_pack_loaded_${packId}`, 'true')
}
