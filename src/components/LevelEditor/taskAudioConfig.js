import { AUDIO } from '../Tasks/audio'

export const RELEASE_AUDIO = Object.values(AUDIO.Release).map(value => ({ value, label: value }))

// Hold Position audio - based on targetDepth
export const HOLD_AUDIO = [
    { value: 'Hold.ONE', label: 'Hold.ONE' },
    { value: 'Hold.TWO', label: 'Hold.TWO' },
    { value: 'Hold.THREE', label: 'Hold.THREE' },
    { value: 'Hold.FOUR', label: 'Hold.FOUR' },
]

// Up and Down audio - based on minDepth, maxDepth, and tempo
export const UPANDDOWN_AUDIO = [
    // Generic tempo-based
    { value: 'UpDown.SLOW', label: 'UpDown.SLOW' },
    { value: 'UpDown.MED', label: 'UpDown.MED' },
    { value: 'UpDown.FAST', label: 'UpDown.FAST' },
    { value: 'UpDown.DEEP', label: 'UpDown.DEEP' },
    // 1 to 2
    { value: 'UpDown.ONE_TWO_SLOW', label: 'UpDown.ONE_TWO_SLOW' },
    { value: 'UpDown.ONE_TWO_MED', label: 'UpDown.ONE_TWO_MED' },
    { value: 'UpDown.ONE_TWO_FAST', label: 'UpDown.ONE_TWO_FAST' },
    // 1 to 3
    { value: 'UpDown.ONE_THREE_SLOW', label: 'UpDown.ONE_THREE_SLOW' },
    { value: 'UpDown.ONE_THREE_MEDIUM', label: 'UpDown.ONE_THREE_MEDIUM' },
    { value: 'UpDown.ONE_THREE_FAST', label: 'UpDown.ONE_THREE_FAST' },
    // 1 to 4
    { value: 'UpDown.ONE_FOUR_SLOW', label: 'UpDown.ONE_FOUR_SLOW' },
    { value: 'UpDown.ONE_FOUR_MEDIUM', label: 'UpDown.ONE_FOUR_MEDIUM' },
    { value: 'UpDown.ONE_FOUR_FAST', label: 'UpDown.ONE_FOUR_FAST' },
    // 2 to 3
    { value: 'UpDown.TWO_THREE_SLOW', label: 'UpDown.TWO_THREE_SLOW' },
    { value: 'UpDown.TWO_THREE_MED', label: 'UpDown.TWO_THREE_MED' },
    { value: 'UpDown.TWO_THREE_FAST', label: 'UpDown.TWO_THREE_FAST' },
    // 2 to 4
    { value: 'UpDown.TWO_FOUR_SLOW', label: 'UpDown.TWO_FOUR_SLOW' },
    { value: 'UpDown.TWO_FOUR_MED', label: 'UpDown.TWO_FOUR_MED' },
    { value: 'UpDown.TWO_FOUR_FAST', label: 'UpDown.TWO_FOUR_FAST' },
    // 3 to 4
    { value: 'UpDown.THREE_FOUR_SLOW', label: 'UpDown.THREE_FOUR_SLOW' },
    { value: 'UpDown.THREE_FOUR_MED', label: 'UpDown.THREE_FOUR_MED' },
    { value: 'UpDown.THREE_FOUR_FAST', label: 'UpDown.THREE_FOUR_FAST' },
]

// Hit Depth audio - based on targetDepth
export const HIT_AUDIO = [
    { value: 'Hit.TWO', label: 'Hit.TWO' },
    { value: 'Hit.THREE', label: 'Hit.THREE' },
    { value: 'Hit.FOUR', label: 'Hit.FOUR' },
]

// Clap audio
export const CLAP_AUDIO = [
    { value: 'Clap.FACE', label: 'Clap.FACE' },
    { value: 'Clap.BELOW', label: 'Clap.BELOW' },
]

// Rest audio
export const REST_AUDIO = [
    { value: 'Rest.SHORT_REST', label: 'Rest.SHORT_REST' },
    { value: 'Rest.REST', label: 'Rest.REST' },
    { value: 'Rest.REST_BALL', label: 'Rest.REST_BALL' },
]

// Get Ready audio
export const GETREADY_AUDIO = [
    { value: 'LevelStart.GENERIC', label: 'LevelStart.GENERIC' },
]

// Finish audio
export const FINISH_AUDIO = [
    { value: 'Finish.CLEAN', label: 'Finish.CLEAN' },
]

// Endless audio
export const ENDLESS_AUDIO = [
    { value: 'LevelStart.GENERIC', label: 'LevelStart.GENERIC' },
]

/**
 * Get the appropriate audio options for a task type
 */
export function getAudioOptionsForTaskType(taskType) {
    switch (taskType) {
        case 'hold':
            return HOLD_AUDIO
        case 'updown':
            return UPANDDOWN_AUDIO
        case 'hitdepth':
            return HIT_AUDIO
        case 'clap':
            return CLAP_AUDIO
        case 'rest':
        case 'rest ball':
            return REST_AUDIO
        case 'get ready':
            return GETREADY_AUDIO
        case 'finish':
            return FINISH_AUDIO
        case 'endless':
            return ENDLESS_AUDIO
        default:
            return []
    }
}

/**
 * Get the default audio for a Hold task based on targetDepth
 */
export function getDefaultHoldAudio(targetDepth) {
    const depthMap = {
        1: 'Hold.ONE',
        2: 'Hold.TWO',
        3: 'Hold.THREE',
        4: 'Hold.FOUR',
    }
    return depthMap[targetDepth] || 'Hold.ONE'
}

/**
 * Get the default audio for an UpAndDown task based on minDepth, maxDepth, and tempo
 */
export function getDefaultUpAndDownAudio(minDepth, maxDepth, tempo) {
    const depthWords = {
        1: 'ONE',
        2: 'TWO',
        3: 'THREE',
        4: 'FOUR',
    }
    const tempoMap = {
        30: 'SLOW',
        60: 'MEDIUM', // Note: AUDIO uses MEDIUM for 60 BPM, not MED
        90: 'FAST',
    }

    const startWord = depthWords[minDepth] || 'ONE'
    const endWord = depthWords[maxDepth] || 'TWO'
    const tempoWord = tempoMap[tempo] || 'SLOW'

    // Try specific range first (e.g., ONE_TWO_SLOW)
    // Note: For MEDIUM tempo, the key might be MEDIUM or MED depending on the range
    let specificKey = `${startWord}_${endWord}_${tempoWord}`
    if (AUDIO.UpDown[specificKey]) {
        return `UpDown.${specificKey}`
    }

    // Try with MED instead of MEDIUM for some ranges
    if (tempoWord === 'MEDIUM') {
        specificKey = `${startWord}_${endWord}_MED`
        if (AUDIO.UpDown[specificKey]) {
            return `UpDown.${specificKey}`
        }
    }

    // Fallback to generic tempo (MED for medium)
    const genericTempo = tempoWord === 'MEDIUM' ? 'MED' : tempoWord
    if (AUDIO.UpDown[genericTempo]) {
        return `UpDown.${genericTempo}`
    }

    // Final fallback
    return 'UpDown.MED'
}

/**
 * Get the default audio for a Hit task based on targetDepth
 */
export function getDefaultHitAudio(targetDepth) {
    const depthMap = {
        1: null, // No depth-one hit cue exists in the default voice packs
        2: 'Hit.TWO',
        3: 'Hit.THREE',
        4: 'Hit.FOUR',
    }
    return targetDepth === 1 ? null : depthMap[targetDepth] || 'Hit.FOUR'
}


// Choose a cue from the task's own category whenever its settings change.
export function getDefaultTaskAudio(task) {
    switch (task.type) {
        case 'hold':
            return getDefaultHoldAudio(task.targetDepth || 1)
        case 'updown':
            return getDefaultUpAndDownAudio(task.minDepth || 1, task.maxDepth || 2, task.tempo || 30)
        case 'hitdepth':
            return getDefaultHitAudio(task.targetDepth || 4)
        case 'rest':
            return 'Rest.REST'
        case 'rest ball':
            return 'Rest.REST_BALL'
        default:
            return getAudioOptionsForTaskType(task.type)[0]?.value || null
    }
}
