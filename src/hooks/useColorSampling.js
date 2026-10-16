import { useCallback } from 'react'

const SAMPLE_WIDTH = 5
const SAMPLE_HEIGHT = 5
const SAMPLE_PIXELS = SAMPLE_WIDTH * SAMPLE_HEIGHT

function useColorSampling() {

    const sampleGridSquares = useCallback((squares, canvas, context) => {
        if (!squares.length) return {}

        const colors = {}

        const canvasWidth = canvas.width
        const canvasHeight = canvas.height

        // find bounding box
        let minCol = Infinity
        let minRow = Infinity
        let maxCol = -Infinity
        let maxRow = -Infinity
        for (const { x, y } of squares) {
            const col = canvasWidth - x
            if (col < minCol) minCol = col
            if (col > maxCol) maxCol = col
            if (y < minRow) minRow = y
            if (y > maxRow) maxRow = y
        }

        // Nothing valid to sample.
        if (minCol === Infinity) return colors

        const startX = minCol
        const startY = minRow
        const readWidth = Math.min(canvasWidth, maxCol + SAMPLE_WIDTH) - startX
        const readHeight = Math.min(canvasHeight, maxRow + SAMPLE_HEIGHT) - startY

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
                sumRed / SAMPLE_PIXELS,
                sumGreen / SAMPLE_PIXELS,
                sumBlue / SAMPLE_PIXELS
            ]
        }

        return colors
    }, [])

    return {
        sampleGridSquares
    }
}

export default useColorSampling
