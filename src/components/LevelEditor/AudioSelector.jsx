import React from 'react'
import { audioManager } from '../../services/audioManager'
import { useAtomValue } from 'jotai'
import { voiceSelectionAtom } from '../../atoms/moddingAtom'
import { canonicalAudioReference, getCustomAudioOptions, hasAudio } from '../../services/customAudio'
import { RELEASE_AUDIO } from './taskAudioConfig'
import { playAudioUrl } from '../../services/audioPlayback'

/**
 * AudioSelector - Dropdown for selecting audio from available packs
 * @param {string} value - Current selected audio value (e.g., "Hold.ONE")
 * @param {function} onChange - Callback when audio selection changes
 * @param {string} label - Label for the selector
 * @param {Array} allowedOptions - Optional array of allowed audio options. If provided, only these options will be shown.
 *                                 Format: [{ value: "Hold.ONE", label: "Hold.ONE" }, ...]
 */
const AudioSelector = ({ value, onChange, label = "Audio", allowedOptions = null, mode = 'standard', onModeChange }) => {
    const selectId = React.useId()
    const modeId = React.useId()
    React.useSyncExternalStore(audioManager.subscribe, audioManager.getPackRevision)
    // Subscribe to the shared voice selection as well as asynchronous pack loading.
    useAtomValue(voiceSelectionAtom)
    const pack = audioManager.getSelectedPack()
    const customOptions = getCustomAudioOptions(pack)
    const audioOptions = mode === 'custom' ? customOptions : mode === 'release' ? RELEASE_AUDIO : (allowedOptions || [])
    const selectedValue = canonicalAudioReference(value)
    const missingOption = selectedValue && !audioOptions.some(option => option.value === selectedValue)
    const separator = typeof selectedValue === 'string' ? selectedValue.indexOf('.') : -1
    const available = typeof selectedValue === 'string' && separator > 0 && hasAudio(
        pack?.audioFiles?.[selectedValue.slice(0, separator)]?.[selectedValue.slice(separator + 1)]
    )

    const [previewError, setPreviewError] = React.useState('')
    React.useEffect(() => setPreviewError(''), [value, pack])
    const handlePreview = async () => {
        setPreviewError('')
        try {
            const audioUrl = await audioManager.getAudioFile(selectedValue)
            if (audioUrl) await playAudioUrl(audioUrl, { context: 'editor-preview', markUnlocked: true })
        } catch (err) {
            setPreviewError('Preview could not play. Try again.')
        }
    }

    return (
        <div className="task-audio-selector">
            <label htmlFor={modeId}>Audio mode:</label>
            <select
                id={modeId}
                className="task-audio-mode"
                value={mode}
                onChange={event => {
                    const nextMode = event.target.value
                    const options = nextMode === 'release' ? RELEASE_AUDIO : customOptions
                    onModeChange(nextMode, options[0]?.value || null)
                }}
            >
                <option value="standard">Task</option>
                <option value="release">Release</option>
                <option value="custom">Custom</option>
            </select>
            <label htmlFor={selectId}>{label}:</label>
            <select
                id={selectId}
                className="task-audio-cue"
                value={selectedValue || ''}
                onChange={(e) => onChange(e.target.value || null)}
            >
                <option value="">{mode === 'custom' && !customOptions.length ? 'No custom cues in this pack' : 'None'}</option>
                {missingOption && <option value={selectedValue}>{selectedValue} (not available in this list)</option>}
                {audioOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {value && (
                <button
                    type="button"
                    onClick={handlePreview}
                    disabled={!available}
                    className="task-audio-preview"
                >
                    ▶ Preview
                </button>
            )}
            {value && !available && <small className="task-audio-notice" role="status">Cue unavailable in this voice pack. Import the matching pack.</small>}
            {previewError && <small className="task-audio-notice" role="alert">{previewError}</small>}
        </div>
    )
}

export default AudioSelector
