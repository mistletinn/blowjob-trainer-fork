import React from 'react'
import { TaskType } from '../Tasks/task'
import TaskForm from './TaskForm'
import { getDefaultTaskAudio } from './taskAudioConfig'
import { getRandomInt } from '../randomInt'

/**
 * TaskBuilder - Component for building and managing task list
 */
const TaskBuilder = ({ tasks, onChange }) => {
    const hasReady = tasks[0]?.type === TaskType.GETREADY
    const hasFinish = tasks[tasks.length - 1]?.type === TaskType.FINISH
    const firstMovable = hasReady ? 1 : 0
    const lastMovable = tasks.length - (hasFinish ? 2 : 1)
    const isFixed = (index) => (index === 0 && hasReady) || (index === tasks.length - 1 && hasFinish)

    const addTask = (taskType) => {
        const newTask = {
            id: getRandomInt(),
            type: taskType,
            // Set defaults based on task type
            ...(taskType === TaskType.GETREADY && { time: 15, timeLimit: 15, desc: 'get ready' }),
            ...(taskType === TaskType.HOLDPOSITION && { targetDepth: 1, time: 10, repeat: 1, timeLimit: 0 }),
            ...(taskType === TaskType.UPANDDOWN && { minDepth: 1, maxDepth: 2, tempo: 30, timeLimit: 30 }),
            ...(taskType === TaskType.HITDEPTH && { targetDepth: 4, repeat: 1 }),
            ...(taskType === TaskType.CLAP && { repeat: 3, timeLimit: 30 }),
            ...(taskType === TaskType.REST && { timeLimit: 10 }),
            ...(taskType === TaskType.REST_BALL && { timeLimit: 10 }),
            ...(taskType === TaskType.FINISH && { time: 15, timeLimit: 15 }),
            ...(taskType === TaskType.ENDLESS && { timeLimit: 999 })
        }
        newTask.audio = getDefaultTaskAudio(newTask)
        const insertionIndex = hasFinish ? tasks.length - 1 : tasks.length
        onChange([...tasks.slice(0, insertionIndex), newTask, ...tasks.slice(insertionIndex)])
    }

    const updateTask = (index, updatedTask) => {
        if (isFixed(index) && updatedTask.type !== tasks[index].type) return
        const newTasks = [...tasks]
        newTasks[index] = updatedTask
        onChange(newTasks)
    }

    const deleteTask = (index) => {
        if (isFixed(index)) return
        const newTasks = tasks.filter((_, i) => i !== index)
        onChange(newTasks)
    }

    const moveTask = (index, direction) => {
        const destination = index + (direction === 'up' ? -1 : 1)
        if (isFixed(index) || destination < firstMovable || destination > lastMovable) return

        const newTasks = [...tasks]
        newTasks[index] = tasks[destination]
        newTasks[destination] = tasks[index]
        onChange(newTasks)
    }

    return (
        <div>
            <div style={{ marginBottom: '16px' }}>
                <h4>Tasks</h4>
                <p>New levels include Get Ready and Finish. New tasks are added before Finish when it is present.</p>
                <details className="task-help-notes">
                    <summary>Helpful notes</summary>
                    <div className="task-help-notes-content">
                        <strong>Task overview</strong>
                        <p>Tasks run in order from top to bottom. Choose a task type, adjust its settings, and select the audio cue to play when it starts.</p>
                        <ul>
                            <li><strong>Get Ready:</strong> a timed preparation period at the start of the level.</li>
                            <li><strong>Hold:</strong> Take the cock to the target depth and hold it there for required time. Use Repeat for multiple holds.  Good for a tease the tip, down to holding a deepthroat.</li>
                            <li><strong>Up/Down:</strong> This is the main cocksucking task.  move between the minimum and maximum depths at the selected tempo, for the task’s time limit.</li>
                            <li><strong>Hit Depth:</strong> reach a target depth the specified number of times, with no hold time requirement.  Useful as an early throat warmup.</li>
                            <li><strong>Clap:</strong> use the microphone to detect slaps.  above = slap face, below = slapass. requested number of claps within the time limit.</li>
                            <li><strong>Rest:</strong> a timed break between active tasks. Rest Ball is the same thing but with its own audio cue to lick balls.</li>
                            <li><strong>Finish:</strong> a timed closing period at the end of the level.</li>
                            {/* <li><strong>Endless:</strong> a free-form movement task without a prescribed depth range or tempo.</li> */}
                        </ul>
                        <p>The task type dropdown includes additional options such as Rest Ball and Endless. Audio mode changes the cue selection; it does not change what the task asks you to do.</p>
                        <strong>Tips for cumming.</strong>
                        <p>Near the end of your level, to build to the cumshot, best approach is to add the same task three times in a row with specific audio cues. Keep the same task settings but tweak the timing.  For example, use three Up/Down tasks with the same depth range and tempo.  Here's a an example where you want the player to suck fast to simulate getting the cock off.</p>
                        <ol>
                            <li><strong>Up/Down as normal:</strong> This is setting the task for the player to follow to get to a cumshot, so the player knows to suck 'fast' between depths 1 and 3 as an example.  This might be 30s long.</li>
                            <li><strong>Up/Down with pre release audio:</strong> same task again, so the player just keeps going, but this time the audio cue will be a Release.PRE_RELEASE so they'll here something like 'you're going to make me cum'.  Set the Time Limit to 10–15 seconds.</li>
                            <li><strong>Up/Down with post release audio:</strong> same task again or you could switch to a hit or hold maybe, crucially should be somewhat similar to the task they've been doing.  Again, set the audio cue to Release.POST_RELEASE so they'll hear something like 'i'm cumming, swallow it.'  Set for 10-15s again.  </li>
                        </ol>
                        <p>Each cue plays when its task starts, so the pre-release task’s duration sets the gap before the post-release cue.</p>
                    </div>
                </details>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    <button type="button" onClick={() => addTask(TaskType.HOLDPOSITION)} style={{ padding: '6px 12px' }}>
                        + Hold
                    </button>
                    <button type="button" onClick={() => addTask(TaskType.UPANDDOWN)} style={{ padding: '6px 12px' }}>
                        + Up/Down
                    </button>
                    <button type="button" onClick={() => addTask(TaskType.HITDEPTH)} style={{ padding: '6px 12px' }}>
                        + Hit Depth
                    </button>
                    <button type="button" onClick={() => addTask(TaskType.CLAP)} style={{ padding: '6px 12px' }}>
                        + Clap
                    </button>
                    <button type="button" onClick={() => addTask(TaskType.REST)} style={{ padding: '6px 12px' }}>
                        + Rest
                    </button>
                </div>
            </div>

            <div>
                {tasks.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        No tasks yet. Add a task to get started.
                    </div>
                ) : (
                    tasks.map((task, index) => (
                        <div key={task.id || index} className={isFixed(index) ? 'task-bookend' : ''} style={{ position: 'relative' }}>
                            {hasReady && hasFinish && index === tasks.length - 1 && tasks.length === 2 && (
                                <p className="task-middle-empty">Add a task above to build the middle of your level.</p>
                            )}
                            {isFixed(index) && (
                                <div className="task-bookend-label">{task.type === TaskType.GETREADY ? 'Level start · Get Ready' : 'Level end · Finish'} <span>Required · Fixed position</span></div>
                            )}
                            {!isFixed(index) && <div style={{
                                position: 'absolute',
                                left: '-30px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                            }}>
                                <button
                                    type="button"
                                    aria-label="Move task up"
                                    onClick={() => moveTask(index, 'up')}
                                    disabled={index === firstMovable}
                                    style={{
                                        padding: '2px 6px',
                                        fontSize: '12px',
                                        opacity: index === firstMovable ? 0.3 : 1
                                    }}
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    aria-label="Move task down"
                                    onClick={() => moveTask(index, 'down')}
                                    disabled={index === lastMovable}
                                    style={{
                                        padding: '2px 6px',
                                        fontSize: '12px',
                                        opacity: index === lastMovable ? 0.3 : 1
                                    }}
                                >
                                    ↓
                                </button>
                            </div>}
                            <TaskForm
                                fixed={isFixed(index)}
                                task={task}
                                onChange={(updatedTask) => updateTask(index, updatedTask)}
                                onDelete={() => deleteTask(index)}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default TaskBuilder
