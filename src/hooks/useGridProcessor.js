import { useAtomValue, useSetAtom, useAtom } from 'jotai'
import { useEffect, useRef, useState } from 'react'
import {
    shaftMapAtom,
    gridSquaresAtom,
    gridShaftPercentAtom,
    gridExtentPercentAtom,
    gridDepthPercentAtom,
    gridAxisAtom,
    gridBaseEndAtom,
    percentHysterisisAtom,
} from '../atoms/gridAtoms'

// A slice (row/column across the axis) counts as covered when its match ratio
// is above zero and at least this fraction of the best ratio seen so far from
// the base side, so coverage adapts to the shaft without depending on how wide
// the shaft is or how much margin was painted.
const SLICE_VOTE_RATIO = 0.5
// EMA weight for the temporal filter on the raw extent
const EXTENT_SMOOTHING = 0.5

function useGridProcessor() {
    const shaftMap = useAtomValue(shaftMapAtom)
    const gridSquares = useAtomValue(gridSquaresAtom)
    const setPercentShaft = useSetAtom(gridShaftPercentAtom)
    const [extent, setExtent] = useAtom(gridExtentPercentAtom)
    const axis = useAtomValue(gridAxisAtom)
    const baseEnd = useAtomValue(gridBaseEndAtom)
    const depthPercents = useAtomValue(gridDepthPercentAtom)
    const hysteresis = useAtomValue(percentHysterisisAtom)
    const [currentState, setCurrentState] = useState(0)
    const smoothedRef = useRef(null)
    const prevSquaresRef = useRef(null)
    const prevAxisRef = useRef(null)
    const prevBaseEndRef = useRef(null)

    // Single pass over the grid: fill ratio for display, and the visible
    // extent along the insertion axis for the depth signal.
    useEffect(() => {
        let shaftCount = 0
        // Per-slice tallies keyed by the coordinate across the axis
        const slices = new Map()
        for (const { x, y } of gridSquares) {
            const isCellShaft = shaftMap.get(`${x},${y}`)
            if (isCellShaft) shaftCount++

            const coord = axis === 'vertical' ? y : x
            let entry = slices.get(coord)
            if (!entry) {
                entry = { shaft: 0, total: 0 }
                slices.set(coord, entry)
            }
            entry.total++
            if (isCellShaft) entry.shaft++
        }

        const total = gridSquares.length
        setPercentShaft(total > 0 ? (shaftCount / total) * 100 : 0)

        // Count covered slices starting from the base end and stop at the
        // first gap after the run began, so matches elsewhere in the grid
        // (e.g. skin color) can never become the reading. The coverage
        // reference is the best ratio seen so far from the base side, so a
        // better-matching patch elsewhere cannot set the threshold either.
        // Leading empty slices are skipped: the grid may extend past the base
        // (or the mount hardware may cover the shaft there).
        const coords = [...slices.keys()].sort((a, b) => a - b)
        let raw = 0
        if (coords.length > 0) {
            const ratios = coords.map(coord => {
                const { shaft, total: sliceTotal } = slices.get(coord)
                return shaft / sliceTotal
            })
            if (baseEnd === 'end') ratios.reverse()

            let run = 0
            let reference = 0
            let started = false
            for (const ratio of ratios) {
                if (ratio > 0 && ratio >= reference * SLICE_VOTE_RATIO) {
                    started = true
                    run++
                    reference = Math.max(reference, ratio)
                } else if (started) {
                    break // first gap after the shaft began = the tip
                }
            }
            raw = (run / ratios.length) * 100
        }

        // Reset the smoother whenever the measurement basis changes (grid
        // edits, axis or base-end switch); otherwise a static frame would keep
        // serving a stale smoothed value.
        if (prevSquaresRef.current !== gridSquares
            || prevAxisRef.current !== axis
            || prevBaseEndRef.current !== baseEnd) {
            prevSquaresRef.current = gridSquares
            prevAxisRef.current = axis
            prevBaseEndRef.current = baseEnd
            smoothedRef.current = null
        }
        smoothedRef.current = smoothedRef.current === null
            ? raw
            : smoothedRef.current + EXTENT_SMOOTHING * (raw - smoothedRef.current)
        setExtent(smoothedRef.current)
    }, [gridSquares, shaftMap, axis, baseEnd, setPercentShaft, setExtent])

    // 2. Determine the desired state (no hysteresis)
    function getDesiredState(extent, depthPercents) {
        for (let i = depthPercents.length - 1; i >= 0; i--) {
            if (extent < depthPercents[i]) {
                return i + 1
            }
        }
        return 0 // default to surface
    }

    const isDescending = arr => arr.every((v, i, a) => i === 0 || a[i - 1] > v)
    // Discrete states derived from the continuous extent
    useEffect(() => {
        // Check all values are numeric and in descending order
        if (!depthPercents.every(p => typeof p === 'number') || !isDescending(depthPercents)) return;

        const desiredState = getDesiredState(extent, depthPercents)
        if (desiredState === currentState) return

        if ((desiredState > currentState && extent <= depthPercents[currentState]) ||
            (desiredState < currentState && extent >= depthPercents[currentState - 1] + hysteresis)) {
            setCurrentState(desiredState)
        }

    }, [extent, depthPercents, currentState, setCurrentState, hysteresis])

    return currentState
}

export default useGridProcessor
