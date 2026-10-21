import React, { useState } from 'react'
import { useStore } from 'jotai'
import {
    gridSquaresAtom,
    gridBaseColorAtom,
    gridSensitivityAtom,
    gridDepthPercentAtom,
    percentHysterisisAtom,
    SAMPLE_PIXELS,
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
const isColor = value => value && ['r', 'g', 'b'].every(key => inRange(value[key], 255 * SAMPLE_PIXELS))
const isDepthPercent = value => Array.isArray(value)
    ? value.length === 4 && value.every(v => inRange(v, 100))
    : value && [1, 2, 3, 4].every(key => inRange(value[key], 100))
const isPreset = preset => preset && (preset.version === 1 || preset.version === 2)
    && Array.isArray(preset.gridSquares)
    && preset.gridSquares.every(square => square
    && inRange(square.x, Number.MAX_SAFE_INTEGER)
    && inRange(square.y, Number.MAX_SAFE_INTEGER))
    && isColor(preset.baseColor)
    && isColor(preset.sensitivity)
    && isDepthPercent(preset.depthPercent)
    && inRange(preset.buffer, 20)

// Version 1 presets stored baseColor/sensitivity in 0-255
const toSumSpace = color => ({
    r: color.r * SAMPLE_PIXELS,
    g: color.g * SAMPLE_PIXELS,
    b: color.b * SAMPLE_PIXELS,
})

function CalibrationPresetControls({ children }) {
    const store = useStore()
    const [message, setMessage] = useState('')

    function saveCalibration() {
        try {
            const preset = { version: 2 }
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
            const values = { ...preset }
            if (preset.version === 1) {
                values.baseColor = toSumSpace(preset.baseColor)
                values.sensitivity = toSumSpace(preset.sensitivity)
            }
            if (!Array.isArray(values.depthPercent)) {
                values.depthPercent = [1, 2, 3, 4].map(key => preset.depthPercent[key])
            }
            Object.entries(presetAtoms).forEach(([key, atom]) => {
                store.set(atom, values[key])
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
