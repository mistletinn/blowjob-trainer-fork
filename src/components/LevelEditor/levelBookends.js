import { TaskType } from '../Tasks/task'
import { getRandomInt } from '../randomInt'
import { getDefaultTaskAudio } from './taskAudioConfig'

const createBookend = (type) => {
    const task = {
        id: getRandomInt(), type, time: 15, timeLimit: 15,
        ...(type === TaskType.GETREADY && { desc: 'get ready' })
    }
    return { ...task, audio: getDefaultTaskAudio(task) }
}

export const createLevelBookends = () => [
    createBookend(TaskType.GETREADY),
    createBookend(TaskType.FINISH)
]
