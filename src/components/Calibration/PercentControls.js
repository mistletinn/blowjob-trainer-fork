import React, { useState, useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import NumberControl from "../NumberControl";
import { gridDepthPercentAtom, percentHysterisisAtom } from "../../atoms/gridAtoms";
import { STR } from "../../constants/stringsreplace";

function PercentControls() {
    const [percent, setPercent] = useAtom(gridDepthPercentAtom);
    const hysterisis = useAtomValue(percentHysterisisAtom)

    // Local state for depth states
    const [p0, setP0] = useState(percent[0] ?? 0);
    const [p1, setP1] = useState(percent[1] ?? 0);
    const [p2, setP2] = useState(percent[2] ?? 0);
    const [p3, setP3] = useState(percent[3] ?? 0);

    const [error, setError] = useState("");

    // Update atom whenever local state changes
    useEffect(() => {
        setPercent([p0, p1, p2, p3]);
    }, [p0, p1, p2, p3, setPercent]);

    // Update local state if atom changes externally
    useEffect(() => {
        setP0(percent[0] ?? 0);
        setP1(percent[1] ?? 0);
        setP2(percent[2] ?? 0);
        setP3(percent[3] ?? 0);
    }, [percent[0], percent[1], percent[2], percent[3]]);

    // Check for overlap error
    useEffect(() => {
        if (p0 <= p1) {
            setError(`Error: Value ${STR.Depth[1]} must be greater than value ${STR.Depth[2]}.`);
        } else if (p1 <= p2) {
            setError(`Error: Value ${STR.Depth[2]} must be greater than value ${STR.Depth[3]}.`);
        } else if (p2 <= p3) {
            setError(`Error: Value ${STR.Depth[3]} must be greater than value ${STR.Depth[4]}.`);
        } else {
            setError("");
        }
        if (p3 - hysterisis < 0) {
            setError(`Error: Value ${STR.Depth[4]} minus buffer cannot be negative.`);
        }
    }, [p0, p1, p2, p3, hysterisis]);

    return (
        <React.Fragment>
            <div className="row-centered margin-y-top">
                <h5>Depth based on visible (%)</h5>
            </div>
            <div className="row-centered flex-wrap">
                <NumberControl label={STR.Depth[1]} value={p0} setValue={setP0} min={0} max={100} />
                <NumberControl label={STR.Depth[2]} value={p1} setValue={setP1} min={0} max={100} />
                <NumberControl label={STR.Depth[3]} value={p2} setValue={setP2} min={0} max={100} />
                <NumberControl label={STR.Depth[4]} value={p3} setValue={setP3} min={0} max={100} />
            </div>
            <div style={{ color: 'red' }}>{error}</div>
        </React.Fragment>
    );
}

export default PercentControls;
