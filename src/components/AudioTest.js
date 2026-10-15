import React, { useState } from 'react'
import { AUDIO, getAudioFile, getAudioKey } from './Tasks/audio'

function AudioTest() {
    const [fileStatus, setFileStatus] = useState(null)

    const checkFiles = async () => {
        const results = []

        // Helper function to check if file exists
        const checkFileExists = async (filepath) => {
            try {
                // Remove leading slash if present
                const normalizedPath = filepath.startsWith('/') ? filepath.slice(1) : filepath
                // Construct the full path relative to the public directory
                const fullPath = `${window.location.origin}/${normalizedPath}`

                const response = await fetch(fullPath)
                if (!response.ok) {
                    console.log(`File not found: ${fullPath}`)
                    return false
                }

                const blob = await response.blob()
                // Check if we got an audio file (checking mime type)
                if (!blob.type.startsWith('audio/')) {
                    console.log(`Not an audio file: ${fullPath}, type: ${blob.type}`)
                    return false
                }

                // Additional check: make sure we got some content
                if (blob.size === 0) {
                    console.log(`Empty file: ${fullPath}`)
                    return false
                }

                console.log(`Valid audio file: ${fullPath}, type: ${blob.type}, size: ${blob.size}`)
                return true
            } catch (error) {
                console.log(`Error checking ${filepath}:`, error)
                return false
            }
        }

        // Process all categories and their audio files
        for (const category in AUDIO) {
            if (typeof AUDIO[category] === 'object' && AUDIO[category] !== null) {
                // Special handling for Custom which has nested sub-objects (legacy pack format)
                if (category === 'Custom') {
                    for (const levelKey in AUDIO[category]) {
                        const levelObject = AUDIO[category][levelKey]
                        if (typeof levelObject === 'object' && levelObject !== null) {
                            for (const key in levelObject) {
                                const audioValue = levelObject[key]
                                
                                if (audioValue === null || audioValue === '' || audioValue === 'non') {
                                    // Skip null, empty, or 'non' entries
                                    results.push({
                                        key: `${category}.${levelKey}.${key}`,
                                        type: 'skipped',
                                        reason: audioValue === null ? 'null' : audioValue === '' ? 'empty' : 'non',
                                    })
                                    continue
                                } else if (Array.isArray(audioValue)) {
                                    // Handle arrays of files
                                    const arrayResults = await Promise.all(audioValue.map(async filepath => {
                                        const exists = await checkFileExists(filepath)
                                        console.log(`Array file ${filepath}: ${exists ? 'exists' : 'missing'}`)
                                        return {
                                            path: filepath,
                                            exists,
                                        }
                                    }))

                                    results.push({
                                        key: `${category}.${levelKey}.${key}`,
                                        type: 'array',
                                        files: arrayResults,
                                    })
                                } else {
                                    // Handle single files
                                    const exists = await checkFileExists(audioValue)
                                    console.log(`Single file ${audioValue}: ${exists ? 'exists' : 'missing'}`)
                                    results.push({
                                        key: `${category}.${levelKey}.${key}`,
                                        type: 'single',
                                        path: audioValue,
                                        exists,
                                    })
                                }
                            }
                        }
                    }
                } else {
                    // Regular categories
                    for (const key in AUDIO[category]) {
                        const audioValue = AUDIO[category][key]

                        if (audioValue === null || audioValue === '' || audioValue === 'non') {
                            // Skip null, empty, or 'non' entries
                            results.push({
                                key: `${category}.${key}`,
                                type: 'skipped',
                                reason: audioValue === null ? 'null' : audioValue === '' ? 'empty' : 'non',
                            })
                            continue
                        } else if (Array.isArray(audioValue)) {
                            // Handle arrays of files
                            const arrayResults = await Promise.all(audioValue.map(async filepath => {
                                const exists = await checkFileExists(filepath)
                                console.log(`Array file ${filepath}: ${exists ? 'exists' : 'missing'}`)
                                return {
                                    path: filepath,
                                    exists,
                                }
                            }))

                            results.push({
                                key: `${category}.${key}`,
                                type: 'array',
                                files: arrayResults,
                            })
                        } else {
                            // Handle single files
                            const exists = await checkFileExists(audioValue)
                            console.log(`Single file ${audioValue}: ${exists ? 'exists' : 'missing'}`)
                            results.push({
                                key: `${category}.${key}`,
                                type: 'single',
                                path: audioValue,
                                exists,
                            })
                        }
                    }
                }
            }
        }

        setFileStatus(results)
    }

    return (
        <div>
            <button className="button padding-x" onClick={checkFiles}>
                Check Audio Files
            </button>

            {fileStatus && (
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Audio Type</th>
                                <th>Status</th>
                                <th>File Path</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fileStatus.map((item) => (
                                item.type === 'skipped' ? (
                                    <tr key={item.key}>
                                        <td>{item.key}</td>
                                        <td>
                                            <span style={{ color: '#999' }}>
                                                -
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: '#999', fontStyle: 'italic' }}>
                                                Skipped ({item.reason})
                                            </span>
                                        </td>
                                    </tr>
                                ) : item.type === 'single' ? (
                                    <tr key={item.key}>
                                        <td>{item.key}</td>
                                        <td>
                                            <span>
                                                {item.exists ? 'O' : 'X'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                textDecoration: item.exists ? 'none' : 'line-through'
                                            }}>
                                                {item.path}
                                            </span>
                                        </td>
                                    </tr>
                                ) : (
                                    item.files.map((file, fileIndex) => (
                                        <tr key={`${item.key}-${fileIndex}`}>
                                            <td>{fileIndex === 0 ? item.key : ''}</td>
                                            <td>
                                                <span>
                                                    {file.exists ? 'O' : 'X'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    textDecoration: file.exists ? 'none' : 'line-through'
                                                }}>
                                                    {file.path}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ))}
                        </tbody>
                    </table>

                    <div>
                        <p>Legend: O = File exists, X = File missing, - = Skipped (null/empty/non)</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AudioTest 