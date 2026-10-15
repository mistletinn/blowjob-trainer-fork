import React, { useState } from 'react'
import { useStore } from 'jotai'
import {
    gridSquaresAtom,
    gridBaseColorAtom,
    gridSensitivityAtom,
    gridDepthPercentAtom,
    percentHysterisisAtom,
} from '../../atoms/gridAtoms'

const STORAGE_KEY = 'saved-calibration-v1'
const presetAtoms = {
    gridSquares: gridSquaresAtom,
    baseColor: gridBaseColorAtom,
    sensitivity: gridSensitivityAtom,
    depthPercent: gridDepthPercentAtom,
    buffer: percentHysterisisAtom,
}

const inRange = (value, max) => Number.isFinite(value) && value >= 0 && value <= max
const isColor = value => value && ['r', 'g', 'b'].every(key => inRange(value[key], 255))
const isPreset = preset => preset && preset.version === 1
    && Array.isArray(preset.gridSquares)
    && preset.gridSquares.every(square => square
        && inRange(square.x, Number.MAX_SAFE_INTEGER)
        && inRange(square.y, Number.MAX_SAFE_INTEGER))
    && isColor(preset.baseColor)
    && isColor(preset.sensitivity)
    && preset.depthPercent && [1, 2, 3, 4].every(key => inRange(preset.depthPercent[key], 100))
    && inRange(preset.buffer, 20)

function CalibrationPresetControls({ children }) {
    const store = useStore()
    const [message, setMessage] = useState('')

    function saveCalibration() {
        try {
            const preset = { version: 1 }
            Object.entries(presetAtoms).forEach(([key, atom]) => {
                preset[key] = store.get(atom)
            })
            localStorage.setItem(STORAGE_KEY, JSON.stringify(preset))
            setMessage('Calibration saved in this browser.')
        } catch {
            setMessage('Could not save calibration. Browser storage may be unavailable or full.')
        }
    }

    function loadCalibration() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved === null) {
                setMessage('No saved calibration yet. Save your current calibration first.')
                return
            }
            const preset = JSON.parse(saved)
            if (!isPreset(preset)) throw new Error('Invalid calibration')
            Object.entries(presetAtoms).forEach(([key, atom]) => {
                store.set(atom, preset[key])
            })
            setMessage('Saved calibration loaded.')
        } catch {
            setMessage('Could not load the saved calibration. It may be damaged or browser storage may be unavailable.')
        }
    }

    return (
        <div className="margin-y-sm">
            <div style={{ overflowX: 'auto' }}>
                <div className="row-centered" style={{ gap: '24px', width: 'max-content', minWidth: '100%' }}>
                <div className="row-centered" style={{ width: 'auto' }}>{children}</div>
                <div className="row-centered" style={{ width: 'auto' }}>
                    <button type="button" className="button padding-x-sm" onClick={saveCalibration}>Save calibration</button>
                    <button type="button" className="button padding-x-sm" onClick={loadCalibration}>Load calibration</button>
                </div>
                </div>
            </div>
            <p className="help" role="status">{message}</p>
        </div>
    )
}

export default CalibrationPresetControls
