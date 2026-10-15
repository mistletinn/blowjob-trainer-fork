import JSZip from 'jszip'
import { cacheAudioFile } from './audioCache'

// Helper to get MIME type from file path
const mimeTypeFromPath = (filePath) => {
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

export const importVoicePack = async file => {
    // Read ZIP file
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)

    // Extract manifest
    const manifestFile = zip.file('audio-pack.json')
    if (!manifestFile) {
        throw new Error('Invalid pack: audio-pack.json not found')
    }

    const manifestJson = await manifestFile.async('string')
    const manifest = JSON.parse(manifestJson)

    // Validate structure
    if (!manifest.audioFiles || typeof manifest.audioFiles !== 'object' || Array.isArray(manifest.audioFiles)) {
        throw new Error('Invalid pack: audioFiles not found')
    }

    // Generate unique pack ID
    const packId = `custom_${crypto.randomUUID()}`
    const packName = manifest.name || file.name.replace('.zip', '')

    // Convert audio files to data URLs and cache in memory
    const convertedAudioFiles = Object.create(null)
    let fileCount = 0

    for (const [sourceCategory, keys] of Object.entries(manifest.audioFiles)) {
        const category = sourceCategory.toLowerCase() === 'custom' ? 'Custom' : sourceCategory
        if (!keys || typeof keys !== 'object' || Array.isArray(keys)) throw new Error('Invalid cue category')
        convertedAudioFiles[category] = convertedAudioFiles[category] || Object.create(null)

        for (const [key, paths] of Object.entries(keys)) {
            const filePaths = Array.isArray(paths) ? paths : [paths]
            const dataUrls = []

            for (const filePath of filePaths) {
                if (typeof filePath !== 'string') throw new Error('Invalid audio file path')
                const audioFile = zip.file(filePath)
                if (audioFile) {
                    const arrayBuffer = await audioFile.async('arraybuffer')
                    const mimeType = mimeTypeFromPath(filePath)
                    const blob = new Blob([arrayBuffer], { type: mimeType })

                    // Cache in memory and get data URL
                    const dataUrl = await cacheAudioFile(packId, filePath, blob)
                    dataUrls.push(dataUrl)
                    fileCount++
                } else {
                    console.warn(`Audio file not found in ZIP: ${filePath}`)
                }
            }

            if (dataUrls.length > 0) {
                convertedAudioFiles[category][key] = dataUrls.length === 1 ? dataUrls[0] : dataUrls
            }
        }
    }

    // Create pack object with data URLs
    const pack = {
        id: packId,
        name: packName,
        description: manifest.description || 'Custom voice pack',
        audioFiles: convertedAudioFiles
    }

    if (!fileCount) throw new Error('This pack contains no playable audio files')
    return { pack, fileCount }
}
