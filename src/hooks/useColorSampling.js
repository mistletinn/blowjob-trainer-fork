import { useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { gridBoundsAtom, SAMPLE_WIDTH, SAMPLE_HEIGHT } from '../atoms/gridAtoms'

function useColorSampling() {

    const gridBounds = useAtomValue(gridBoundsAtom)
    // Returns per-cell color SUMS
    const sampleGridSquares = useCallback((squares, canvas, context) => {
        if (!squares.length) return {}
        if (gridBounds.x_min === Infinity) return {}

        const colors = {}

        const canvasWidth = canvas.width
        const canvasHeight = canvas.height

        const startX = canvasWidth - gridBounds.x_max
        const startY = gridBounds.y_min
        const readWidth = Math.min(canvasWidth, canvasWidth - gridBounds.x_min + SAMPLE_WIDTH) - startX
        const readHeight = Math.min(canvasHeight, gridBounds.y_max + SAMPLE_HEIGHT) - startY

        const data = context.getImageData(startX, startY, readWidth, readHeight).data
        const rowStride = readWidth * 4

        for (const { x, y } of squares) {
            // Ensure we're within canvas bounds
            if (x > canvasWidth || x <= SAMPLE_WIDTH || y < 0 || y >= canvasHeight - SAMPLE_HEIGHT) {
                continue
            }

            const col = canvasWidth - x
            let baseIndex = (y - startY) * rowStride + (col - startX) * 4

            let sumRed = 0
            let sumGreen = 0
            let sumBlue = 0

            for (let y_i = 0; y_i < SAMPLE_HEIGHT; y_i++) {
                let index = baseIndex
                for (let x_i = 0; x_i < SAMPLE_WIDTH; x_i++) {
                    sumRed += data[index]
                    sumGreen += data[index + 1]
                    sumBlue += data[index + 2]
                    index += 4
                }
                baseIndex += rowStride
            }

            colors[`${x},${y}`] = [
                sumRed,
                sumGreen,
                sumBlue
            ]
        }

        return colors
    }, [gridBounds])

    return {
        sampleGridSquares
    }
}

export default useColorSampling
