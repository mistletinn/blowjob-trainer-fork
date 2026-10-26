import { useCallback, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { gridBoundsAtom, SAMPLE_WIDTH, SAMPLE_HEIGHT } from '../atoms/gridAtoms'

// ImageData uses four components per pixel regardless of pixel format.
const channelsPerPixel = 4

function useColorSampling() {
    const gridBounds = useAtomValue(gridBoundsAtom)
    // Reused between frames so the hot sampling path does not allocate a map.
    const colorsRef = useRef(new Map())

    // Returns per-cell color SUMS as a Map keyed by 'x,y', plus their average.
    const sampleGridSquares = useCallback((squares, canvas, context) => {
        const colors = colorsRef.current
        colors.clear() // Reset colors for each call

        if (!squares.length || gridBounds.x_min === Infinity) {
            return { colors, average: { r: 0, g: 0, b: 0 } }
        }

        const canvasWidth = canvas.width
        const canvasHeight = canvas.height

        const startX = canvasWidth - gridBounds.x_max
        const startY = gridBounds.y_min
        const readWidth = Math.min(canvasWidth, canvasWidth - gridBounds.x_min + SAMPLE_WIDTH) - startX
        const readHeight = Math.min(canvasHeight, gridBounds.y_max + SAMPLE_HEIGHT) - startY

        const { data, width } = context.getImageData(
            startX, startY, readWidth, readHeight,
            {
                colorSpace: 'srgb',
                pixelFormat: 'rgba-unorm8',
                willReadFrequently: true
            }
        )
        const rowStride = width * channelsPerPixel
        let totalRed = 0, totalGreen = 0, totalBlue = 0

        for (const { x, y } of squares) {
            let baseIndex = (y - startY) * rowStride + (canvasWidth - x - startX) * channelsPerPixel
            let sumRed = 0, sumGreen = 0, sumBlue = 0

            for (let y_i = 0; y_i < SAMPLE_HEIGHT; y_i++) {
                let index = baseIndex

                for (let x_i = 0; x_i < SAMPLE_WIDTH; x_i++) {
                    sumRed += data[index]
                    sumGreen += data[index + 1]
                    sumBlue += data[index + 2]
                    index += channelsPerPixel
                }

                baseIndex += rowStride
            }

            colors.set(`${x},${y}`, [sumRed, sumGreen, sumBlue])
            totalRed += sumRed
            totalGreen += sumGreen
            totalBlue += sumBlue
        }

        const count = squares.length
        const average = {
            r: Math.round(totalRed / count),
            g: Math.round(totalGreen / count),
            b: Math.round(totalBlue / count)
        }

        return { colors, average }
    }, [gridBounds])

    return { sampleGridSquares }
}

export default useColorSampling
