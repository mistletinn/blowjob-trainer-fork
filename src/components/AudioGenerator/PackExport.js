import React, { useState, useRef } from 'react'
import { useAtom } from 'jotai'
import JSZip from 'jszip'
import { audioManager } from '../../services/audioManager'
import { cacheAudioFile } from '../../services/audioCache'
import { audioPackAtom, voiceIdAtom, levelAudioModeAtom, voiceSelectionAtom } from '../../atoms/moddingAtom'

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

function PackExport() {
    const [audioPack, setAudioPack] = useAtom(audioPackAtom)
    const [voiceId, setVoiceId] = useAtom(voiceIdAtom)
    const [, setLevelAudioMode] = useAtom(levelAudioModeAtom)
    const [, setVoiceSelection] = useAtom(voiceSelectionAtom)
    const [isUsingPack, setIsUsingPack] = useState(false)
    const [usePackMessage, setUsePackMessage] = useState('')
    const [isExporting, setIsExporting] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [packName, setPackName] = useState('')
    const [packDescription, setPackDescription] = useState('')
    const [includeVoiceId, setIncludeVoiceId] = useState(false)
    const fileInputRef = useRef(null)

    // Collect all audio cues that have content
    const getAudioCues = () => {
        const cues = []
        for (const category in audioPack) {
            if (audioPack[category] && typeof audioPack[category] === 'object') {
                for (const key in audioPack[category]) {
                    if (audioPack[category][key] && Array.isArray(audioPack[category][key]) && audioPack[category][key].length > 0) {
                        cues.push({ category, key })
                    }
                }
            }
        }
        return cues
    }

    // Make the current draft available immediately without storing audio in localStorage.
    const handleUsePack = async () => {
        setIsUsingPack(true)
        setUsePackMessage('')
        try {
            const cues = getAudioCues()
            if (!cues.length) throw new Error('Add at least one audio cue first.')
            const id = `custom_${crypto.randomUUID()}`
            const audioFiles = Object.create(null)
            for (const { category, key } of cues) {
                if (!audioFiles[category]) audioFiles[category] = Object.create(null)
                audioFiles[category][key] = await Promise.all(audioPack[category][key].map((blob, index) =>
                    cacheAudioFile(id, `${category}/${key}/${index}`, blob)
                ))
            }
            audioManager.registerCustomPack({ id, name: packName || 'My voice pack', description: packDescription, audioFiles })
            audioManager.setVoice(id)
            setVoiceSelection(id)
            setUsePackMessage('Voice pack selected. Open Edit Levels to assign its custom cues. Export the ZIP to keep a copy.')
        } catch (error) {
            setUsePackMessage(error.message)
        } finally {
            setIsUsingPack(false)
        }
    }

    // Export pack as ZIP
    const handleExportPack = async () => {
        setIsExporting(true)

        const zip = new JSZip()
        const manifest = {
            audioFiles: {}
        }
        const audioCues = getAudioCues()

        if (audioCues.length === 0) {
            setIsExporting(false)
            alert('No audio cues to export')
            return
        }

        // Add name and description if provided
        if (packName) {
            manifest.name = packName
        }
        if (packDescription) {
            manifest.description = packDescription
        }
        if (includeVoiceId && voiceId) {
            manifest.voiceId = voiceId
        }

        // Process each audio cue
        for (const { category, key } of audioCues) {
            const blobs = audioPack[category][key]

            // Initialize manifest structure if needed
            if (!manifest.audioFiles[category]) {
                manifest.audioFiles[category] = {}
            }

            const files = []

            // Determine file paths based on category and key
            const categoryPath = encodeURIComponent(category)
            blobs.forEach((blob, index) => {
                const filename = `${encodeURIComponent(key)}-${index + 1}.mp3`
                const path = `audio/${categoryPath}/${filename}`
                zip.file(path, blob)
                files.push(path)
            })

            manifest.audioFiles[category][key] = files
        }

        // Add manifest JSON
        zip.file('audio-pack.json', JSON.stringify(manifest, null, 2))

        // Generate and download ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const url = URL.createObjectURL(zipBlob)
        const link = document.createElement('a')
        const filename = packName ? `${packName.replace(/\s+/g, '-')}.zip` : 'audio-pack.zip'
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setIsExporting(false)
    }

    // Import pack from ZIP
    const handleImportPack = async (event) => {
        const file = event.target.files[0]
        if (!file) return

        setIsImporting(true)

        try {
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
            if (!manifest.audioFiles || typeof manifest.audioFiles !== 'object') {
                throw new Error('Invalid pack: audioFiles not found')
            }

            // Restore name and description
            if (manifest.name) {
                setPackName(manifest.name)
            }
            if (manifest.description) {
                setPackDescription(manifest.description)
            }

            // Restore voiceId if present
            if (manifest.voiceId) {
                setVoiceId(manifest.voiceId)
            }

            // Extract audio files and rebuild audioPack structure
            const importedPack = {}

            for (const category in manifest.audioFiles) {
                importedPack[category] = {}
                for (const key in manifest.audioFiles[category]) {
                    const filePaths = Array.isArray(manifest.audioFiles[category][key])
                        ? manifest.audioFiles[category][key]
                        : [manifest.audioFiles[category][key]]

                    const blobs = []
                    for (const filePath of filePaths) {
                        const audioFile = zip.file(filePath)
                        if (audioFile) {
                            const arrayBuffer = await audioFile.async('arraybuffer')
                            const type = mimeTypeFromPath(filePath)
                            const blob = new Blob([arrayBuffer], { type })
                            blobs.push(blob)
                        } else {
                            console.warn(`Audio file not found in ZIP: ${filePath}`)
                        }
                    }

                    if (blobs.length > 0) {
                        importedPack[category][key] = blobs
                    }
                }
            }

            // Replace current pack with imported pack
            setAudioPack(importedPack)

            // If Custom is present with at least one key, enable currentLevels mode
            if (importedPack.Custom && Object.keys(importedPack.Custom).length > 0) {
                setLevelAudioMode('custom')
            } else {
                setLevelAudioMode('disabled')
            }

            alert('Pack imported successfully!')
        } catch (error) {
            console.error('Import error:', error)
            alert(`Error importing pack: ${error.message}`)
        } finally {
            setIsImporting(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
            <h3>Pack Status</h3>

            {/* Name and Description Fields */}
            <div className="row" style={{ marginBottom: '1rem', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <label>
                        <div style={{ marginBottom: '0.5rem' }}>Pack Name</div>
                        <input
                            type="text"
                            value={packName}
                            onChange={(e) => setPackName(e.target.value)}
                            placeholder="Enter pack name"
                        />
                    </label>
                </div>
                <div style={{ flex: 3 }}>
                    <label>
                        <div style={{ marginBottom: '0.5rem' }}>Description</div>
                        <input
                            type="text"
                            value={packDescription}
                            onChange={(e) => setPackDescription(e.target.value)}
                            placeholder="Enter pack description"
                        />
                    </label>
                </div>
            </div>

            <button type="button" onClick={handleUsePack} disabled={isUsingPack || isImporting || isExporting}>
                {isUsingPack ? 'Loading voice pack…' : 'Use this voice pack'}
            </button>
            {usePackMessage && <p role="status">{usePackMessage}</p>}

            {/* Export, Voice ID Toggle, and Import Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <button
                    className="button button-primary"
                    onClick={handleExportPack}
                    disabled={isExporting || isImporting}
                >
                    {isExporting ? 'Exporting...' : 'Export Pack as ZIP'}
                </button>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="checkbox"
                        checked={includeVoiceId}
                        onChange={(e) => setIncludeVoiceId(e.target.checked)}
                    />
                    <span>Include Voice ID in export</span>
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleImportPack}
                    style={{ display: 'none' }}
                />
                <button
                    className="button"
                    onClick={handleImportClick}
                    disabled={isImporting || isExporting}
                >
                    {isImporting ? 'Importing...' : 'Import Pack'}
                </button>
            </div>
        </div>
    )
}

export default PackExport
