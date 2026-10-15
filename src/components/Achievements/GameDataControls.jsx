import React, { useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { timeStatsAtom, diveStatsAtom, sessionStatsAtom, achievementsStoredAtom } from '../../atoms/playerAtom'
import { exportGameData, parseGameData } from '../../services/gameData'
import { formatTime } from '../../constants/helpers'

export default function GameDataControls({ disabled }) {
    const [timeStats, setTimeStats] = useAtom(timeStatsAtom)
    const [diveStats, setDiveStats] = useAtom(diveStatsAtom)
    const [sessionStats, setSessionStats] = useAtom(sessionStatsAtom)
    const [achievements, setAchievements] = useAtom(achievementsStoredAtom)
    const fileInput = useRef(null)
    const [pending, setPending] = useState(null)
    const [message, setMessage] = useState('')
    const [reading, setReading] = useState(false)

    const handleExport = () => {
        try {
            const json = exportGameData({ timeStats, diveStats, sessionStats, achievements })
            const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
            const link = document.createElement('a')
            link.href = url
            link.download = `game-data-${new Date().toISOString().slice(0, 10)}.json`
            document.body.appendChild(link)
            link.click()
            link.remove()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
            setMessage('Game data export downloaded.')
        } catch (error) {
            setMessage(error.message)
        }
    }

    const handleFile = async event => {
        const file = event.target.files[0]
        event.target.value = ''
        if (!file) return
        setPending(null)
        setMessage('')
        setReading(true)
        try {
            if (file.size > 10 * 1024 * 1024) throw new Error('Choose a game data file smaller than 10 MB.')
            setPending({ name: file.name, data: parseGameData(await file.text()) })
        } catch (error) {
            setMessage(error.message)
        } finally {
            setReading(false)
        }
    }

    const handleImport = () => {
        const data = pending.data
        setTimeStats(data.timeStats)
        setDiveStats(data.diveStats)
        setSessionStats(data.sessionStats)
        setAchievements(data.achievements)
        setPending(null)
        setMessage('Game data imported. Your achievements and statistics have been updated.')
    }

    return (
        <section className="card margin-y-lg" aria-label="Game data backup">
            <h3>Game data backup</h3>
            <p>Save or restore your achievements, playtime, and session statistics as JSON. Everything stays on your device; no account or upload is needed.</p>
            <p>Importing replaces your saved achievements and statistics. Export first if you want to keep a copy. Settings, custom levels, and voice packs are not included.</p>
            <button type="button" onClick={handleExport}>Export game data</button>
            <button type="button" disabled={disabled || reading} onClick={() => fileInput.current.click()}>
                {reading ? 'Reading game data…' : 'Import game data'}
            </button>
            <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={handleFile} />
            {pending && (
                <div>
                    <p><strong>{pending.name}</strong>: {formatTime(pending.data.timeStats.totalPlayTime)} playtime, {pending.data.achievements.unlockedAchievements.length} unlocked achievements, and {pending.data.sessionStats.playDates.length} recorded completions.</p>
                    <button type="button" disabled={disabled} onClick={handleImport}>Replace saved data</button>
                    <button type="button" onClick={() => setPending(null)}>Cancel</button>
                </div>
            )}
            {message && <p role="status">{message}</p>}
        </section>
    )
}
