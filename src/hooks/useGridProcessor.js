import { useAtomValue, useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import {
    gridColorsAtom,
    gridSquaresAtom,
    gridShaftPercentAtom,
    gridDepthPercentAtom,
    percentHysterisisAtom,
} from '../atoms/gridAtoms'

function useGridProcessor() {
    const gridColors = useAtomValue(gridColorsAtom)
    const gridSquares = useAtomValue(gridSquaresAtom)
    const [percentShaft, setPercentShaft] = useAtom(gridShaftPercentAtom)
    const depthPercents = useAtomValue(gridDepthPercentAtom)
    const hysteresis = useAtomValue(percentHysterisisAtom)
    const [currentState, setCurrentState] = useState(0)

    // Calculate and set percentShaft when gridSquares or gridColors change
    useEffect(() => {
        const total = gridSquares.length
        let shaftCount = 0
        for (const { x, y } of gridSquares) {
            if (gridColors[`${x},${y}`]?.shaft) shaftCount++
        }
        const percent = total > 0 ? (shaftCount / total) * 100 : 0
        setPercentShaft(percent)
    }, [gridSquares, gridColors, setPercentShaft])

    // 2. Determine the desired state (no hysteresis)
    function getDesiredState(percentShaft, depthPercents) {
        for (let i = depthPercents.length - 1; i >= 0; i--) {
            if (percentShaft < depthPercents[i]) {
                return i + 1
            }
        }
        return 0 // default to surface
    }

    const isDescending = arr => arr.every((v, i, a) => i === 0 || a[i - 1] > v)
    // State logic using percentShaft atom value and thresholds
    useEffect(() => {
        // Check all values are numeric and in descending order
        if (!depthPercents.every(p => typeof p === 'number') || !isDescending(depthPercents)) return;

        const desiredState = getDesiredState(percentShaft, depthPercents)
        if (desiredState === currentState) return

        if ((desiredState > currentState && percentShaft <= depthPercents[currentState]) ||
				(desiredState < currentState && percentShaft >= depthPercents[currentState - 1] + hysteresis)) {
            setCurrentState(desiredState)
        }

    }, [percentShaft, depthPercents, currentState, setCurrentState, hysteresis])

    return currentState
}

export default useGridProcessor
