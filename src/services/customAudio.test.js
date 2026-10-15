import { normalizeCustomCueName, validateCustomCueName, getAudioMode, getCustomAudioOptions } from './customAudio'
import { resolveAudioReference, setAudioManagerRef } from './audioResolver'

const pack = { id: 'test-pack', audioFiles: { Custom: { 'hello world': 'data:audio/mpeg;base64,A', 'phase.two': ['data:audio/mpeg;base64,B'], empty: [] }, Release: { POST_RELEASE: 'end' }, Hold: { TWO: 'hold' }, LevelStart: { GENERIC: 'intro' } } }

beforeEach(() => setAudioManagerRef({ getDefaultPack: id => id === pack.id ? pack : null }))

test('names accept the Custom prefix, spaces and periods without changing key identity', () => {
    expect(normalizeCustomCueName(' custom.hello world ')).toBe('hello world')
    expect(validateCustomCueName('Custom.phase.two')).toBe('')
    expect(validateCustomCueName('Custom.')).toBeTruthy()
    expect(validateCustomCueName('../escape')).toBeTruthy()
    expect(validateCustomCueName('__proto__')).toBeTruthy()
})

test('custom picker lists only playable custom cues from this pack', () => {
    expect(getCustomAudioOptions(pack).map(option => option.value)).toEqual(['Custom.hello world', 'Custom.phase.two'])
    expect(getCustomAudioOptions(null)).toEqual([])
})

test('infers separate audio modes and migrates legacy release selections', () => {
    expect(getAudioMode({ audio: 'custom.hello world' })).toBe('custom')
    expect(getAudioMode({ audio: 'Release.POST_RELEASE' })).toBe('release')
    expect(getAudioMode({ audioMode: 'custom', audio: 'Release.POST_RELEASE' })).toBe('release')
    expect(getAudioMode({ audioMode: 'custom', audio: null })).toBe('custom')
    expect(getAudioMode({ audioMode: 'release', audio: null })).toBe('release')
    expect(getAudioMode({ audioMode: 'standard', audio: 'Custom.hello world' })).toBe('standard')
})

test('resolver uses the selected pack, preserves dotted names and skips missing cues without an intro fallback', () => {
    expect(resolveAudioReference('custom.hello world', null, pack.id)).toBe(pack.audioFiles.Custom['hello world'])
    expect(resolveAudioReference('Custom.phase.two', null, pack.id)).toEqual(pack.audioFiles.Custom['phase.two'])
    expect(resolveAudioReference('Custom.missing_END', null, pack.id)).toBeNull()
    expect(resolveAudioReference('Custom.empty', null, pack.id)).toBeNull()
    expect(resolveAudioReference('Hold.TWO', null, pack.id)).toBe('hold')
    const other = { id: 'other', audioFiles: { Custom: { 'hello world': 'wrong voice' } } }
    expect(resolveAudioReference('Custom.hello world', other, pack.id)).toBe(pack.audioFiles.Custom['hello world'])
})
