import React from 'react'
import { TaskType, Tempo } from '../Tasks/task'
import AudioSelector from './AudioSelector'
import NumberControl from '../NumberControl'
import { getAudioMode } from '../../services/customAudio'
import {
    getAudioOptionsForTaskType,
    getDefaultTaskAudio,
} from './taskAudioConfig'

/**
 * TaskForm - Form for editing task-specific properties
 */
const TaskForm = ({ task, onChange, onDelete, fixed = false }) => {
    // Use ref to track current task to avoid stale closures
    const taskRef = React.useRef(task)
    React.useEffect(() => {
        taskRef.current = task
    }, [task])

    // Helper function to calculate timeLimit for HOLDPOSITION tasks
    const calculateHoldTimeLimit = (targetDepth, time, repeat) => {
        return 10 + repeat * (time + 5)
    }

    const updateTask = (updates) => {
        const updatedTask = { ...taskRef.current, ...updates }
        const taskTypeChanged = 'type' in updates && updates.type !== taskRef.current.type

        // Auto-calculate timeLimit for HOLDPOSITION when depth, time, or repeat changes
        if (updatedTask.type === TaskType.HOLDPOSITION) {
            const hasDepthChange = 'targetDepth' in updates
            const hasTimeChange = 'time' in updates
            const hasRepeatChange = 'repeat' in updates

            // If any of these changed and timeLimit is 0 or undefined, calculate it
            if ((hasDepthChange || hasTimeChange || hasRepeatChange)) {
                const targetDepth = updatedTask.targetDepth || 1
                const time = updatedTask.time || 10
                const repeat = updatedTask.repeat || 1
                updatedTask.timeLimit = calculateHoldTimeLimit(targetDepth, time, repeat)
            }

        }

        const cueSettingsChanged = taskTypeChanged || (
            [TaskType.HOLDPOSITION, TaskType.HITDEPTH].includes(updatedTask.type) && 'targetDepth' in updates
        ) || (
            updatedTask.type === TaskType.UPANDDOWN &&
            ['minDepth', 'maxDepth', 'tempo'].some(key => key in updates)
        )
        if (cueSettingsChanged && getAudioMode(updatedTask) === 'standard') {
            updatedTask.audio = getDefaultTaskAudio(updatedTask)
        }

        taskRef.current = updatedTask
        onChange(updatedTask)
    }

    const renderTaskFields = () => {
        switch (task.type) {
            case TaskType.GETREADY:
                return (
                    <>
                        <div>
                            <NumberControl
                                label="Time "
                                value={task.time || 15}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.time || 15
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ time: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Time Limit "
                                value={task.timeLimit || 15}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.timeLimit || 15
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ timeLimit: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                        <div>
                            <div style={{ textAlign: 'center' }}>Description</div>
                            {/* <p className='margin-x-sm margin-y-sm'>Description:</p> */}
                            <input
                                type="text"
                                value={task.desc || 'get ready'}
                                onChange={(e) => updateTask({ desc: e.target.value })}
                            />
                        </div>
                    </>
                )

            case TaskType.HOLDPOSITION:
                return (
                    <>
                        <div>
                            <NumberControl
                                label="Target Depth (1-4)"
                                value={task.targetDepth || 1}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.targetDepth || 1
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    const validatedDepth = Math.max(1, Math.min(4, newValue))
                                    updateTask({ targetDepth: validatedDepth })
                                }}
                                min={1}
                                max={4}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Hold Time "
                                value={task.time || 10}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.time || 10
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ time: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Repeat"
                                value={task.repeat || 1}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.repeat || 1
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ repeat: newValue })
                                }}
                                min={1}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Time Limit "
                                value={task.timeLimit || 0}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.timeLimit || 0
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ timeLimit: newValue > 0 ? newValue : undefined })
                                }}
                                min={0}
                                step={1}
                            />
                            {/* <small style={{ color: '#666', display: 'block', marginTop: '4px', textAlign: 'center' }}>Leave at 0 for Auto</small> */}
                        </div>
                    </>
                )

            case TaskType.UPANDDOWN:
                return (
                    <>
                        <div>
                            <NumberControl
                                label="Min Depth (1-3)"
                                value={task.minDepth || 1}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.minDepth || 1
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    // Ensure min is never 0 or 4, and is between 1-3
                                    const validatedMin = Math.max(1, Math.min(3, newValue === 0 ? 1 : newValue === 4 ? 3 : newValue))
                                    const currentMax = taskRef.current.maxDepth || 2
                                    // Ensure max is at least 1 more than min
                                    const validatedMax = Math.max(validatedMin + 1, currentMax)
                                    const finalMax = validatedMax > 4 ? 4 : validatedMax
                                    updateTask({
                                        minDepth: validatedMin,
                                        maxDepth: finalMax
                                    })
                                }}
                                min={1}
                                max={3}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Max Depth (1-4)"
                                value={task.maxDepth || 2}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.maxDepth || 2
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    const currentMin = taskRef.current.minDepth || 1
                                    // Ensure max is at least 1 more than min, and never less than 2
                                    const validatedMax = Math.max(currentMin + 1, Math.min(4, newValue))
                                    updateTask({ maxDepth: validatedMax })
                                }}
                                min={2}
                                max={4}
                                step={1}
                            />
                        </div>
                        <div>
                            <label>Tempo:</label>
                            <select
                                value={task.tempo || Tempo.SLOW}
                                onChange={(e) => {
                                    const newTempo = parseInt(e.target.value)
                                    updateTask({ tempo: newTempo })
                                }}
                            >
                                <option value={Tempo.SLOW}>Slow (30 BPM)</option>
                                <option value={Tempo.MEDIUM}>Medium (60 BPM)</option>
                                <option value={Tempo.FAST}>Fast (90 BPM)</option>
                            </select>
                        </div>
                        <div>
                            <NumberControl
                                label="Time Limit "
                                value={task.timeLimit || 30}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.timeLimit || 30
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ timeLimit: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                    </>
                )

            case TaskType.HITDEPTH:
                return (
                    <>
                        <div>
                            <NumberControl
                                label="Target Depth (1-4)"
                                value={task.targetDepth || 4}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.targetDepth || 4
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    const validatedDepth = Math.max(1, Math.min(4, newValue))
                                    updateTask({ targetDepth: validatedDepth })
                                }}
                                min={1}
                                max={4}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Repeat"
                                value={task.repeat || 1}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.repeat || 1
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ repeat: newValue })
                                }}
                                min={1}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Time Limit "
                                value={task.timeLimit || 0}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.timeLimit || 0
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ timeLimit: newValue > 0 ? newValue : undefined })
                                }}
                                min={0}
                                step={1}
                            />
                            <small style={{ color: '#666', display: 'block', marginTop: '4px', textAlign: 'center' }}>Leave at 0 for Auto</small>
                        </div>
                    </>
                )

            case TaskType.CLAP:
                return (
                    <>
                        <div>
                            <NumberControl
                                label="Repeat (number of claps)"
                                value={task.repeat || 3}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.repeat || 3
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ repeat: newValue })
                                }}
                                min={1}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Time Limit "
                                value={task.timeLimit || 30}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.timeLimit || 30
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ timeLimit: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                    </>
                )

            case TaskType.REST:
            case TaskType.REST_BALL:
                return (
                    <>
                        <div>
                            <NumberControl
                                label="Time Limit "
                                value={task.timeLimit || 10}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.timeLimit || 10
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ timeLimit: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                    </>
                )

            case TaskType.FINISH:
                return (
                    <>
                        <div>
                            <NumberControl
                                label="Time "
                                value={task.time || 15}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.time || 15
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ time: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                        <div>
                            <NumberControl
                                label="Time Limit "
                                value={task.timeLimit || 15}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.timeLimit || 15
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ timeLimit: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                    </>
                )

            case TaskType.ENDLESS:
                return (
                    <>
                        <div>
                            <NumberControl
                                label="Time Limit "
                                value={task.timeLimit || 999}
                                setValue={(fn) => {
                                    const currentValue = taskRef.current.timeLimit || 999
                                    const newValue = typeof fn === 'function' ? fn(currentValue) : fn
                                    updateTask({ timeLimit: newValue })
                                }}
                                min={0}
                                step={1}
                            />
                        </div>
                    </>
                )

            default:
                return <div>No specific fields for this task type</div>
        }
    }

    return (
        <div className="task-editor-card">
            <div className="task-editor-header">
                <div className="task-editor-selectors">
                    <label className="task-editor-type">
                        <span>Task type:</span>
                        <select
                            disabled={fixed}
                            value={task.type}
                            onChange={(e) => updateTask({ type: e.target.value })}
                        >
                            <option value={TaskType.GETREADY}>Get Ready</option>
                            <option value={TaskType.HOLDPOSITION}>Hold Position</option>
                            <option value={TaskType.UPANDDOWN}>Up and Down</option>
                            <option value={TaskType.HITDEPTH}>Hit Depth</option>
                            <option value={TaskType.CLAP}>Clap</option>
                            <option value={TaskType.REST}>Rest</option>
                            <option value={TaskType.REST_BALL}>Rest Ball</option>
                            <option value={TaskType.FINISH}>Finish</option>
                            <option value={TaskType.ENDLESS}>Endless</option>
                        </select>
                    </label>
                    <AudioSelector
                        label="Audio cue"
                        mode={getAudioMode(task)}
                        onModeChange={(mode, firstCue) => updateTask({
                            audioMode: mode,
                            audio: mode === 'standard' ? getDefaultTaskAudio(taskRef.current) : firstCue
                        })}
                        value={task.audio || null}
                        onChange={(audio) => updateTask({ audio })}
                        allowedOptions={getAudioOptionsForTaskType(task.type)}
                    />
                </div>
                {!fixed && <button
                    className="task-delete-button"
                    aria-label="Delete task"
                    title="Delete task"
                    onClick={onDelete}
                    type="button"
                >
                    <span aria-hidden="true">×</span>
                </button>}
            </div>
            <div className="task-editor-fields">
                {renderTaskFields()}
            </div>
        </div>
    )
}

export default TaskForm
