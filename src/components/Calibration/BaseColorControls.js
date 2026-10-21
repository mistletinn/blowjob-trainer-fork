import React, { useState, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import NumberControl from "../NumberControl";
import { gridBaseColorAtom, gridAverageColorAtom, SAMPLE_PIXELS, SAMPLE_PIXELS_RECIPROCAL } from "../../atoms/gridAtoms";

function BaseColorControls() {
    const [baseColor, setBaseColor] = useAtom(gridBaseColorAtom);
    const averageColor = useAtomValue(gridAverageColorAtom);

    // Initialize local state from atom
    const [r, setR] = useState(Math.round((baseColor.r ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
    const [g, setG] = useState(Math.round((baseColor.g ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
    const [b, setB] = useState(Math.round((baseColor.b ?? 0) * SAMPLE_PIXELS_RECIPROCAL));

    // Update atom whenever local state changes
    useEffect(() => {
        setBaseColor({ r: r * SAMPLE_PIXELS, g: g * SAMPLE_PIXELS, b: b * SAMPLE_PIXELS });
    }, [r, g, b, setBaseColor]);

    // Optionally, update local state if atom changes externally
    useEffect(() => {
        setR(Math.round((baseColor.r ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
        setG(Math.round((baseColor.g ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
        setB(Math.round((baseColor.b ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
    }, [baseColor.r, baseColor.g, baseColor.b]);

    return (
        <React.Fragment>
            <div className="row-centered margin-y-top">
                <h5>Dildo color</h5>
            </div>
            <div className="">
                <div className='row-centered flex-wrap'>
                    <NumberControl label="Red" value={r} setValue={setR} min={0} max={255} />
                    <NumberControl label="Green" value={g} setValue={setG} min={0} max={255} />
                    <NumberControl label="Blue" value={b} setValue={setB} min={0} max={255} />

                    <div>
                        <div>&nbsp;</div>
                        <button className="button "
                            onClick={() => { setBaseColor(averageColor) }}>
                            Capture current average
                        </button>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

export default BaseColorControls;
