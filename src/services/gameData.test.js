import { exportGameData, parseGameData } from './gameData'

const saved = () => ({
    timeStats: { totalPlayTime: 123.5, holdTimeByDepth: { 1: 5, 2: 10, 3: 15, 4: 20 } },
    diveStats: { divesByDepth: { 1: 1, 2: 2, 3: 3, 4: 4 }, perfectTaskExecutions: { HOLDPOSITION: 2, UPANDDOWN: 3, HITDEPTH: 4 } },
    sessionStats: { lastPlayDate: '2026-09-16', playDates: ['2026-09-16', '2026-09-16'], levelsCompletedToday: 2,
        levelScores: { customLevel: { rank: 4, bestScore: 100, attempts: 2, lastScore: 90, surfacePenalties: 0 } } },
    achievements: { unlockedAchievements: ['good_dive'], achievementProgress: { good_dive: true, dozen: 2, training_dedication: 123.5 } }
})

const file = data => JSON.stringify({ format: 'game-data-v1', data })

test('round trips all player statistics, custom level records, and duplicate play dates', () => {
    expect(parseGameData(exportGameData(saved()))).toEqual(saved())
})

test('supports a fresh player with no progress', () => {
    const data = saved()
    data.sessionStats = { lastPlayDate: null, playDates: [], levelsCompletedToday: 0, levelScores: {} }
    data.achievements = { unlockedAchievements: [], achievementProgress: {} }
    expect(parseGameData(file(data))).toEqual(data)
})

test.each([
    data => { delete data.timeStats },
    data => { data.timeStats.totalPlayTime = -1 },
    data => { data.diveStats.divesByDepth[1] = '2' },
    data => { data.sessionStats.playDates = ['invalid'] },
    data => { data.sessionStats.levelScores.customLevel.rank = 99 },
    data => { data.achievements.achievementProgress.dozen = null },
    data => { data.achievements.unlockedAchievements = [12] }
])('rejects malformed statistics before returning importable data', mutate => {
    const data = saved()
    mutate(data)
    expect(() => parseGameData(file(data))).toThrow('invalid game statistics')
})

test('rejects invalid JSON, unrelated files, and unsupported versions', () => {
    for (const text of ['{', 'null', '{}', '{"format":"game-data-v2"}']) {
        expect(() => parseGameData(text)).toThrow()
    }
})

test('does not include unrelated settings or credentials', () => {
    const data = { ...saved(), apiKey: 'private', customLevels: [] }
    expect(parseGameData(exportGameData(data))).toEqual(saved())
})
