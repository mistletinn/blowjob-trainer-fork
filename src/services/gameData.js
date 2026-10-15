const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value)
const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
const count = value => number(value) && Number.isSafeInteger(value)
const date = value => typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value))
const record = (value, validate) => isObject(value) && Object.entries(value).every(([key, entry]) =>
    !['__proto__', 'constructor', 'prototype'].includes(key) && validate(entry))
const fields = (value, validators) => isObject(value) && Object.entries(validators).every(([key, validate]) => validate(value[key]))
const depths = validate => value => fields(value, { 1: validate, 2: validate, 3: validate, 4: validate })

export const validateGameData = data => {
    const valid = fields(data, {
        timeStats: value => fields(value, { totalPlayTime: number, holdTimeByDepth: depths(number) }),
        diveStats: value => fields(value, {
            divesByDepth: depths(count),
            perfectTaskExecutions: value => fields(value, { HOLDPOSITION: count, UPANDDOWN: count, HITDEPTH: count })
        }),
        sessionStats: value => fields(value, {
            lastPlayDate: value => value === null || date(value),
            playDates: value => Array.isArray(value) && value.every(date),
            levelsCompletedToday: count,
            levelScores: value => record(value, entry => fields(entry, {
                rank: value => Number.isInteger(value) && [-1, 1, 2, 3, 4].includes(value),
                bestScore: Number.isFinite, attempts: count, lastScore: Number.isFinite, surfacePenalties: number
            }))
        }),
        achievements: value => fields(value, {
            unlockedAchievements: value => Array.isArray(value) && value.every(id => typeof id === 'string' && id.length > 0),
            achievementProgress: value => record(value, progress => typeof progress === 'boolean' || number(progress))
        })
    })
    if (!valid) throw new Error('This file contains missing or invalid game statistics. Your saved data has not been changed.')
    // Only import player statistics, never unrelated settings or credentials.
    return { timeStats: data.timeStats, diveStats: data.diveStats, sessionStats: data.sessionStats, achievements: data.achievements }
}

export const exportGameData = data => JSON.stringify({
    format: 'game-data-v1',
    exportedAt: new Date().toISOString(),
    data: validateGameData(data)
}, null, 2)

export const parseGameData = text => {
    let backup
    try { backup = JSON.parse(text) } catch {
        throw new Error('This file is not valid JSON. Your saved data has not been changed.')
    }
    if (backup?.format !== 'game-data-v1') {
        throw new Error('Choose a supported game data export (game-data-v1). Your saved data has not been changed.')
    }
    return validateGameData(backup.data)
}
