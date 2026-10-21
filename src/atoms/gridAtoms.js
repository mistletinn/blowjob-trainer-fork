import { atom } from 'jotai'

// Sampled grid colors are SUMS over a SAMPLE_WIDTH x SAMPLE_HEIGHT pixel area
export const SAMPLE_WIDTH = 5
export const SAMPLE_HEIGHT = 5
export const SAMPLE_PIXELS = SAMPLE_WIDTH * SAMPLE_HEIGHT
export const SAMPLE_PIXELS_RECIPROCAL = 1 / SAMPLE_PIXELS

// Atom to store the array of selected grid squares
export const gridSquaresAtom = atom([])
// Derived bounds of the grid squares. Recomputed when gridSquaresAtom changes
export const gridBoundsAtom = atom(get => {
    const squares = get(gridSquaresAtom)
    const bounds = { x_min: Infinity, y_min: Infinity, x_max: -Infinity, y_max: -Infinity }
    for (const { x, y } of squares) {
        if (x < bounds.x_min) bounds.x_min = x
        if (x > bounds.x_max) bounds.x_max = x
        if (y < bounds.y_min) bounds.y_min = y
        if (y > bounds.y_max) bounds.y_max = y
    }
    return bounds
})
// Atom to store the grid colors: { 'x,y': [r,g,b] }
export const gridColorsAtom = atom({})

// Atom to store the brush mode: true for add, false for delete
export const brushAddModeAtom = atom(true)

// -- colors --
// current average color across grid
export const gridAverageColorAtom = atom({ r: 0, g: 0, b: 0 })
// base color to compare to
export const gridBaseColorAtom = atom({ r: 200 * SAMPLE_PIXELS, g: 10 * SAMPLE_PIXELS, b: 10 * SAMPLE_PIXELS });
// Default sensitivity values
export const gridSensitivityAtom = atom({ r: 30 * SAMPLE_PIXELS, g: 30 * SAMPLE_PIXELS, b: 30 * SAMPLE_PIXELS });

// -- percentages --
export const gridShaftPercentAtom = atom(0)
export const gridDepthPercentAtom = atom([50, 40, 30, 20])
export const percentHysterisisAtom = atom(5)
