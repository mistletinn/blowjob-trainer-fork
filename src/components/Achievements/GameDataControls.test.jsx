import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Simulate } from 'react-dom/test-utils'
import { createStore, Provider } from 'jotai'
import GameDataControls from './GameDataControls'
import { timeStatsAtom, diveStatsAtom, sessionStatsAtom, achievementsStoredAtom } from '../../atoms/playerAtom'
import { exportGameData } from '../../services/gameData'

let container, root, store
beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true
    localStorage.clear()
    store = createStore()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    act(() => root.render(<Provider store={store}><GameDataControls /></Provider>))
})
afterEach(() => { act(() => root.unmount()); container.remove() })
const button = text => [...container.querySelectorAll('button')].find(element => element.textContent === text)
const backup = () => exportGameData({
    timeStats: { ...store.get(timeStatsAtom), totalPlayTime: 3600 },
    diveStats: store.get(diveStatsAtom),
    sessionStats: store.get(sessionStatsAtom),
    achievements: { unlockedAchievements: ['good_dive'], achievementProgress: { dozen: 5 } }
})
async function choose(text) {
    await act(async () => Simulate.change(container.querySelector('input'), {
        target: { files: [{ name: 'backup.json', size: text.length, text: async () => text }], value: 'backup.json' }
    }))
}

test('preview and cancellation do not write; confirmation restores atoms and browser storage', async () => {
    const json = backup()
    await choose(json)
    expect(button('Replace saved data')).toBeDefined()
    expect(store.get(timeStatsAtom).totalPlayTime).toBe(0)
    act(() => button('Cancel').click())
    expect(button('Replace saved data')).toBeUndefined()
    expect(store.get(timeStatsAtom).totalPlayTime).toBe(0)
    await choose(json)
    act(() => button('Replace saved data').click())
    expect(store.get(timeStatsAtom).totalPlayTime).toBe(3600)
    expect(store.get(achievementsStoredAtom).achievementProgress.dozen).toBe(5)
    expect(JSON.parse(localStorage.getItem('timeStats')).totalPlayTime).toBe(3600)
    expect(container.textContent).toContain('Game data imported')
})

test('invalid import displays an error and preserves existing stats', async () => {
    await choose('{')
    expect(container.textContent).toContain('not valid JSON')
    expect(button('Replace saved data')).toBeUndefined()
    expect(store.get(timeStatsAtom).totalPlayTime).toBe(0)
})
