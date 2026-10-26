import React from 'react'
import { useAtom } from 'jotai'
import { gridAxisAtom, gridBaseEndAtom } from '../../atoms/gridAtoms'

// One button per axis/direction combination. The arrow points towards the tip
const DIRECTIONS = [
    { axis: 'vertical', baseEnd: 'end', arrow: '↑', label: 'Vertical, tip at top', area: '1 / 2' },
    { axis: 'horizontal', baseEnd: 'end', arrow: '←', label: 'Horizontal, tip at left', area: '2 / 1' },
    { axis: 'horizontal', baseEnd: 'start', arrow: '→', label: 'Horizontal, tip at right', area: '2 / 3' },
    { axis: 'vertical', baseEnd: 'start', arrow: '↓', label: 'Vertical, tip at bottom', area: '3 / 2' },
]

function AxisControls() {
    const [axis, setAxis] = useAtom(gridAxisAtom)
    const [baseEnd, setBaseEnd] = useAtom(gridBaseEndAtom)

    return (
        <div className="axis-picker" role="group" aria-label="Dildo direction">
            {DIRECTIONS.map(direction => {
                const selected = axis === direction.axis && baseEnd === direction.baseEnd
                return (
                    <button
                        key={`${direction.axis}-${direction.baseEnd}`}
                        type="button"
                        className={`button axis-picker-button${selected ? ' button-primary' : ''}`}
                        aria-label={direction.label}
                        aria-pressed={selected}
                        title={direction.label}
                        style={{ gridArea: direction.area }}
                        onClick={() => {
                            setAxis(direction.axis)
                            setBaseEnd(direction.baseEnd)
                        }}>
                        <span aria-hidden="true">{direction.arrow}</span>
                    </button>
                )
            })}
        </div>
    )
}

export default AxisControls
