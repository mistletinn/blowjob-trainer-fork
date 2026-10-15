import JSZip from 'jszip'
import { importVoicePack } from './voicePackImport'
import { audioManager } from './audioManager'

beforeAll(() => { global.crypto = { randomUUID: () => 'import-test' } })
afterEach(() => localStorage.clear())

async function zipFile(audioFiles, files = {}) {
    const zip = new JSZip()
    zip.file('audio-pack.json', JSON.stringify({ name: 'Test voice', audioFiles }))
    Object.entries(files).forEach(([path, contents]) => zip.file(path, contents))
    const bytes = await zip.generateAsync({ type: 'arraybuffer' })
    return { name: 'test.zip', arrayBuffer: async () => bytes }
}

test('ZIP import discovers arbitrary cue names, arrays and lowercase custom categories as in-memory data URLs', async () => {
    const file = await zipFile({ custom: { 'hello world': ['audio/one.wav', 'audio/two.wav'], 'phase.two': 'audio/three.mp3' } }, {
        'audio/one.wav': 'one', 'audio/two.wav': 'two', 'audio/three.mp3': 'three'
    })
    const { pack, fileCount } = await importVoicePack(file)
    expect(fileCount).toBe(3)
    expect(pack.audioFiles.Custom['hello world']).toHaveLength(2)
    expect(pack.audioFiles.Custom['hello world'][0]).toMatch(/^data:audio\/wav;base64,/)
    expect(pack.audioFiles.Custom['phase.two']).toMatch(/^data:audio\/mpeg;base64,/)
    audioManager.registerCustomPack(pack)
    audioManager.setVoice(pack.id)
    expect(JSON.parse(localStorage.getItem('voice_selection'))).toBe(pack.id)
    expect(audioManager.getSelectedPack()).toBe(pack)
    expect(audioManager.getAudioFileSync('custom.phase.two')).toBe(pack.audioFiles.Custom['phase.two'])
    localStorage.setItem('voice_selection', pack.id) // Older versions wrote unquoted strings.
    expect(audioManager.getSelectedPack()).toBe(pack)
})

test('invalid or empty manifests fail instead of registering a broken voice pack', async () => {
    await expect(importVoicePack(await zipFile({}))).rejects.toThrow('no playable audio')
    await expect(importVoicePack(await zipFile({ Custom: { BAD: [42] } }))).rejects.toThrow('Invalid audio file path')
})
