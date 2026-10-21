import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
// import { sensitivityAtom } from "../../atoms/markersAtoms";
import { gridSensitivityAtom, SAMPLE_PIXELS, SAMPLE_PIXELS_RECIPROCAL } from "../../atoms/gridAtoms";
import NumberControl from "../NumberControl";

function SensitivityControls() {
    const [sensitivity, setSensitivity] = useAtom(gridSensitivityAtom);

    // Local state for r, g, b
    const [r, setR] = useState(Math.round((sensitivity.r ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
    const [g, setG] = useState(Math.round((sensitivity.g ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
    const [b, setB] = useState(Math.round((sensitivity.b ?? 0) * SAMPLE_PIXELS_RECIPROCAL));

    // Update atom whenever local state changes
    useEffect(() => {
        setSensitivity({ r: r * SAMPLE_PIXELS, g: g * SAMPLE_PIXELS, b: b * SAMPLE_PIXELS });
    }, [r, g, b, setSensitivity]);

    // Update local state if atom changes externally
    useEffect(() => {
        setR(Math.round((sensitivity.r ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
        setG(Math.round((sensitivity.g ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
        setB(Math.round((sensitivity.b ?? 0) * SAMPLE_PIXELS_RECIPROCAL));
    }, [sensitivity.r, sensitivity.g, sensitivity.b]);

    return (
        <React.Fragment>
            <div className="row-centered margin-y-top">
                <h5>Sensitivity (red, green, blue)</h5>
            </div>
            <div className="row-centered flex-wrap">
                <NumberControl label="Red" value={r} setValue={setR} min={0} max={255} />
                <NumberControl label="Green" value={g} setValue={setG} min={0} max={255} />
                <NumberControl label="Blue" value={b} setValue={setB} min={0} max={255} />
                <div>
                    <div>&nbsp;</div>
                    <button className="button "
                        onClick={() => { setSensitivity({ r: 40 * SAMPLE_PIXELS, g: 40 * SAMPLE_PIXELS, b: 40 * SAMPLE_PIXELS }) }}>
                        Reset Sensitivity
                    </button>
                </div>
            </div>
        </React.Fragment>
    );
}

export default SensitivityControls;
