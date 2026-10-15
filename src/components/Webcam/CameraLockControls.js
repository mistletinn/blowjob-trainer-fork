import React, { useEffect, useRef, useState } from 'react'
import { lockCamera } from '../../services/cameraLock'

export default function CameraLockControls({ track }) {
    const [busy, setBusy] = useState(false)
    const [ended, setEnded] = useState(false)
    const [message, setMessage] = useState('')
    const restoreRef = useRef(null)
    const active = useRef(true)

    useEffect(() => {
        active.current = true
        const onEnded = () => setEnded(true)
        track?.addEventListener('ended', onEnded)
        return () => {
            active.current = false
            track?.removeEventListener('ended', onEnded)
        }
    }, [track])

    async function toggleLock() {
        setBusy(true)
        try {
            if (restoreRef.current) {
                await restoreRef.current()
                if (!active.current) return
                restoreRef.current = null
                setMessage('Previous camera settings restored.')
            } else {
                const result = await lockCamera(track)
                if (!active.current) return
                restoreRef.current = result.restore
                setMessage(result.message)
            }
        } catch {
            if (active.current) setMessage('Camera settings could not be changed. Try again or restart the camera.')
        } finally {
            if (active.current) setBusy(false)
        }
    }

    return (
        <div className="camera-lock-controls">
            <button type="button" className="button padding-x-sm" onClick={toggleLock}
                disabled={busy || ended || !track || track.readyState !== 'live'}>
                {busy ? 'Updating camera…' : restoreRef.current ? 'Unlock camera' : 'Lock camera settings'}
            </button>
            <small>Experimental — may not work with all cameras. Lock before calibrating.</small>
            <small role="status">{ended ? 'Camera stopped. Restart it to use camera controls.' : message}</small>
        </div>
    )
}
