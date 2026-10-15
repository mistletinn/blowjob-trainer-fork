// Cue names stay symbolic so a level can be paired with different voice packs.
export const normalizeCustomCueName = name => name.trim().replace(/^custom\./i, '').trim()

export const validateCustomCueName = name => {
    const key = normalizeCustomCueName(name)
    if (!key) return 'Enter a name for this cue.'
    if (/[\\/]/.test(key) || [...key].some(char => char.charCodeAt(0) < 32) || ['__proto__', 'constructor', 'prototype'].includes(key)) {
        return 'Use a cue name without slashes or control characters.'
    }
    return ''
}

export const hasAudio = value => typeof value === 'string' ? value.length > 0 :
    Array.isArray(value) && value.some(item => typeof item === 'string' && item.length > 0)

// Older levels stored release cues under custom mode. Recognize their category.
export const getAudioMode = task => {
    if (task.audioMode === 'standard') return 'standard'
    if (task.audioMode === 'release' || /^release\./i.test(task.audio || '')) return 'release'
    if (task.audioMode === 'custom' || /^custom\./i.test(task.audio || '')) return 'custom'
    return 'standard'
}

export const getCustomAudioOptions = pack => Object.entries(pack?.audioFiles?.Custom || {})
    .filter(([, value]) => hasAudio(value))
    .map(([key]) => ({ value: `Custom.${key}`, label: `Custom.${key}` }))
    .sort((a, b) => a.value.localeCompare(b.value))

export const canonicalAudioReference = value => typeof value === 'string' ? value.replace(/^custom\./i, 'Custom.') : value
