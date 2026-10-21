import React from "react";
import { SAMPLE_PIXELS_RECIPROCAL } from "../atoms/gridAtoms";

/**
 * ColorReading component
 * @param {string} label - The label to display above the color box
 * @param {{r: number, g: number, b: number}} color - The color in sum-space (max 255 * SAMPLE_PIXELS); scaled to 0-255 for display
 * @param {string} [className] - Optional extra className for the root
 */
function ColorReading({ label = "Color", color = { r: 0, g: 0, b: 0 } }) {
    // Colors arrive in sum-space; only the display is scaled to 0-255
    const r = Math.round(color.r * SAMPLE_PIXELS_RECIPROCAL);
    const g = Math.round(color.g * SAMPLE_PIXELS_RECIPROCAL);
    const b = Math.round(color.b * SAMPLE_PIXELS_RECIPROCAL);
    return (
        <div className={"column-centered margin-y-sm width-lg"}>
            <div style={{ marginTop: 2 }}>{label}</div>
            <div
                className="colorreading-box round border-grey"
                style={{
                    background: `rgb(${r},${g},${b})`,
                    width: 64,
                    height: 38,
                    margin: '0 auto',
                    marginBottom: 6,
                    border: '1px solid #bbb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            />
            <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#333', marginTop: 2 }}>
                rgb({r}, {g}, {b})
            </div>
        </div >
    );
}

export default ColorReading;
