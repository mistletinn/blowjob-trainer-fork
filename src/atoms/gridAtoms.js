import { atom } from 'jotai'

// Atom to store the array of selected grid squares
export const gridSquaresAtom = atom([])
// Derived bounds of the grid squares, so pixel sampling can read a minimal
// region. Recomputed only when gridSquaresAtom changes (i.e. while drawing),
// never per sampling frame.
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
export const gridBaseColorAtom = atom({ r: 200, g: 10, b: 10 });
// Default sensitivity values
export const gridSensitivityAtom = atom({ r: 30, g: 30, b: 30 });

// -- percentages --
export const gridShaftPercentAtom = atom(0)
export const gridDepthPercentAtom = atom({ 1: 50, 2: 40, 3: 30, 4: 20 })
export const percentHysterisisAtom = atom(5)
