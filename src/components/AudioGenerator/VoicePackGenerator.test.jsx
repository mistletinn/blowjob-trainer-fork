import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Simulate } from 'react-dom/test-utils'
import { Provider, createStore } from 'jotai'
import VoicePackGenerator from './VoicePackGenerator'
import { audioPackAtom, levelAudioModeAtom } from '../../atoms/moddingAtom'
import { audioManager } from '../../services/audioManager'
import { importVoicePack } from '../../services/voicePackImport'

// Exercise the authoring flow without making paid text-to-speech requests.
jest.mock('./AudioGeneration', () => function AudioGeneration({ onAudioGenerated }) {
    const [text, setText] = require('react').useState('')
    return <div><textarea aria-label="Spoken text" value={text} onChange={e => setText(e.target.value)} />
        <button onClick={() => onAudioGenerated(new Blob([text], { type: 'audio/mpeg' }))}>Generate test audio</button></div>
})
jest.mock('./AudioKeyGenerator', () => () => null)
jest.mock('./CoreAudioCues', () => () => null)

const readBytes = blob => new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsArrayBuffer(blob)
})

test('create named cue from text, preserve it when enabling built-ins, use draft and round-trip exported ZIP', async () => {
    global.IS_REACT_ACT_ENVIRONMENT = true
    global.crypto = { randomUUID: () => 'generator-test' }
    let exportedBlob
    URL.createObjectURL = blob => { exportedBlob = blob; return 'blob:test' }
    URL.revokeObjectURL = jest.fn()
    const download = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const store = createStore()
    store.set(audioPackAtom, {})
    store.set(levelAudioModeAtom, 'disabled')
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)
    const button = text => [...container.querySelectorAll('button')].find(el => el.textContent === text)
    const settle = async predicate => {
        for (let i = 0; i < 100 && !predicate(); i++) await act(async () => { await new Promise(resolve => setTimeout(resolve, 5)) })
        expect(predicate()).toBe(true)
    }
    try {
        act(() => root.render(<Provider store={store}><VoicePackGenerator /></Provider>))
        act(() => {
            Simulate.change(container.querySelector('input[placeholder*="hello world"]'), { target: { value: 'custom.hello world' } })
            Simulate.change(container.querySelector('textarea'), { target: { value: 'Welcome to my level.' } })
        })
        act(() => button('Generate test audio').click())
        act(() => button('Add Cue').click())
        const original = store.get(audioPackAtom).Custom['hello world'][0]
        expect(original.size).toBe(20)
        act(() => button('Enable Current Levels').click())
        expect(store.get(audioPackAtom).Custom['hello world'][0]).toBe(original)
        expect(container.textContent).toContain('hello world')
        act(() => button('Use this voice pack').click())
        await settle(() => container.textContent.includes('Voice pack selected.'))
        expect(audioManager.getSelectedPack().audioFiles.Custom['hello world'][0]).toMatch(/^data:audio\/mpeg;base64,/)
        expect(audioManager.getAudioFileSync('Custom.hello world')).toBe(audioManager.getSelectedPack().audioFiles.Custom['hello world'][0])
        act(() => button('Export Pack as ZIP').click())
        await settle(() => !!exportedBlob)
        const bytes = await readBytes(exportedBlob)
        const { pack } = await importVoicePack({ name: 'roundtrip.zip', arrayBuffer: async () => bytes })
        expect(pack.audioFiles.Custom['hello world']).toBe(audioManager.getAudioFileSync('Custom.hello world'))
    } finally {
        act(() => root.unmount())
        container.remove()
        download.mockRestore()
        localStorage.clear()
    }
})
