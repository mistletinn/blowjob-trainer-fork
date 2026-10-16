import { useCallback } from 'react'

function useColorSampling() {

    const sampleGridSquares = useCallback((squares, canvas, context) => {
        if (!squares.length) return {}

        const colors = {}

        // Sample area
        const WIDTH = 5;
				const HEIGHT = 5;
				const numPixels = WIDTH * HEIGHT;
				const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        for (const { x, y } of squares) {
            // Ensure we're within canvas bounds
            if (x > canvas.width || x <= WIDTH || y < 0 || y >= canvas.height - HEIGHT) {
                continue
            }

						let sumRed = 0;
						let sumGreen = 0;
						let sumBlue = 0;
						// const xMirror = canvas.width - x;
						let baseIndex = (canvas.width - x + y * canvas.width) * 4;

					for (let y_i = 0; y_i < HEIGHT; y_i++) {
							let index = baseIndex;
							for (let x_i = 0; x_i < WIDTH; x_i++) {
								sumRed += data[index]
                sumGreen += data[index + 1]
								sumBlue += data[index + 2]
								index += 4;
							}
							baseIndex += canvas.width * 4
						}

            colors[`${x},${y}`] = [
                sumRed / numPixels,
                sumGreen / numPixels,
                sumBlue / numPixels
            ]
        }

        return colors
    }, [])

    return {
        sampleGridSquares
    }
}

export default useColorSampling
