import React, { useState } from 'react'
import { useAtom } from 'jotai'
import { audioUnlockedAtom } from '../atoms/audioAtom'
import { AUDIO } from './Tasks/audio'
import { audioManager } from '../services/audioManager'
import { playAudioUrl, unlockAudio } from '../services/audioPlayback'

function AudioUnlockControls({ alwaysShow = false, compact = false }) {
    const [audioUnlocked, setAudioUnlocked] = useAtom(audioUnlockedAtom)
    const [unlockError, setUnlockError] = useState('')

    const allowAudio = async () => {
        setUnlockError('')
        const audioPath = audioManager.getAudioFileSync(AUDIO.Calibration.ONE)
        const unlocked = await unlockAudio(audioPath)
        setAudioUnlocked(unlocked)
        if (!unlocked) {
            setUnlockError('Audio was blocked. Tap again, and check iPad silent mode or Safari site settings.')
        }
    }

    const testAudio = async (audioRef) => {
        setUnlockError('')
        const audioPath = audioManager.getAudioFileSync(audioRef)
        if (!audioPath) return

        try {
            await playAudioUrl(audioPath, { context: 'test', markUnlocked: true })
            setAudioUnlocked(true)
        } catch (error) {
            setAudioUnlocked(false)
            setUnlockError('Audio was blocked. Tap Allow Audio first.')
        }
    }

    if (!alwaysShow && audioUnlocked) return null

    return (
        <div className="column-centered margin-y-sm">
            <div className="row-centered flex-wrap" style={{ gap: '0.5rem' }}>
                <button
                    className={`button padding-x ${audioUnlocked ? 'button-primary' : ''}`}
                    onClick={allowAudio}
                >
                    {audioUnlocked ? 'Audio Allowed' : 'Allow Audio'}
                </button>
                {alwaysShow && (
                    <React.Fragment>
                        <button className="button padding-x-sm" onClick={() => testAudio(AUDIO.Calibration.ONE)}>Test 1</button>
                        <button className="button padding-x-sm" onClick={() => testAudio(AUDIO.Calibration.TWO)}>Test 2</button>
                        <button className="button padding-x-sm" onClick={() => testAudio(AUDIO.Calibration.THREE)}>Test 3</button>
                        <button className="button padding-x-sm" onClick={() => testAudio(AUDIO.Calibration.FOUR)}>Test 4</button>
                    </React.Fragment>
                )}
                {!alwaysShow && compact && (
                    <button className="button padding-x-sm" onClick={() => testAudio(AUDIO.Calibration.ONE)}>
                        Test Audio
                    </button>
                )}
            </div>
            {unlockError && <p className="margin-y-sm">{unlockError}</p>}
        </div>
    )
}

export default AudioUnlockControls
