import React from 'react'
import { useAtom } from 'jotai'
import { voiceSelectionAtom } from '../../atoms/moddingAtom'
import { audioManager } from '../../services/audioManager'
import { importVoicePack } from '../../services/voicePackImport'

export default function VoicePackSelector() {
    const [voice, setVoice] = useAtom(voiceSelectionAtom)
    const [importing, setImporting] = React.useState(false)
    const [error, setError] = React.useState('')
    const input = React.useRef(null)
    const selectId = React.useId()
    React.useSyncExternalStore(audioManager.subscribe, audioManager.getPackRevision)
    const voices = audioManager.getAllVoices()
    const selectVoice = id => {
        audioManager.setVoice(id)
        setVoice(id)
    }
    const handleImport = async event => {
        const file = event.target.files[0]
        if (!file) return
        setImporting(true)
        setError('')
        try {
            const { pack } = await importVoicePack(file)
            audioManager.registerCustomPack(pack)
            selectVoice(pack.id)
        } catch (err) {
            setError(err.message)
        } finally {
            setImporting(false)
            if (input.current) input.current.value = ''
        }
    }
    return (
        <div className="margin-y-sm">
            <label htmlFor={selectId}>Voice pack</label>
            <div className="row flex-wrap" style={{ gap: '8px', alignItems: 'center' }}>
                <select id={selectId} value={voice} onChange={event => selectVoice(event.target.value)} disabled={importing}>
                    {!voices.some(pack => pack.id === voice) && <option value={voice}>Selected pack unavailable — import it again</option>}
                    {voices.map(pack => <option key={pack.id} value={pack.id}>{pack.name}</option>)}
                </select>
                <button type="button" onClick={() => input.current?.click()} disabled={importing}>
                    {importing ? 'Importing…' : 'Import voice pack'}
                </button>
                <input ref={input} type="file" accept=".zip" onChange={handleImport} hidden />
            </div>
            <small>Used for cue choices, previews and playback. Export levels and voice packs separately; reimport voice packs after a refresh.</small>
            {error && <p role="alert">{error}</p>}
        </div>
    )
}
