import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import { Simulate } from 'react-dom/test-utils'
import TaskForm from './TaskForm'
import { audioManager } from '../../services/audioManager'

jest.mock('../../services/audioManager', () => ({ audioManager: {
    subscribe: jest.fn(() => () => {}), getPackRevision: () => 0, getSelectedPack: jest.fn(), getAudioFile: jest.fn()
} }))
jest.mock('../../services/audioPlayback', () => ({ playAudioUrl: jest.fn() }))

let container, root, currentTask
beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    audioManager.getSelectedPack.mockReturnValue({ audioFiles: { Custom: { 'hello world': 'data:audio/mpeg;base64,A', bye: 'data:audio/mpeg;base64,B' }, Hold: { ONE: 'one', TWO: 'two' } } })
})
afterEach(() => { act(() => root.unmount()); container.remove() })
function render(task) {
    function Harness() {
        const [value, setValue] = React.useState(task)
        currentTask = value
        return <TaskForm task={value} onChange={setValue} onDelete={() => {}} />
    }
    act(() => root.render(<Harness />))
}
function select(index, value) { act(() => Simulate.change(container.querySelectorAll('select')[index], { target: { value } })) }
function mode(value) { act(() => Simulate.change(container.querySelector('.task-audio-mode'), { target: { value } })) }

test('custom mode selects pack cues, keeps assignments on edits and restores automatic standard cues', () => {
    render({ type: 'hold', targetDepth: 1, audio: 'Hold.ONE' })
    mode('custom')
    expect(currentTask.audioMode).toBe('custom')
    select(2, 'Custom.hello world')
    const plus = container.querySelector('.number-control-btn.plus')
    act(() => { Simulate.mouseDown(plus); Simulate.mouseUp(plus) })
    expect(currentTask.targetDepth).toBe(2)
    expect(currentTask.audio).toBe('Custom.hello world')
    select(0, 'clap')
    expect(currentTask.audio).toBe('Custom.hello world')
    expect(JSON.parse(JSON.stringify(currentTask)).audioMode).toBe('custom')
    mode('standard')
    expect(currentTask.audio).toBe('Clap.FACE')
    expect(currentTask.audioMode).toBe('standard')
})

test('imported custom reference is selected; unavailable pack preserves assignment and disables preview', () => {
    audioManager.getSelectedPack.mockReturnValue({ audioFiles: {} })
    render({ type: 'hold', audio: 'custom.hello world', targetDepth: 2 })
    expect(container.querySelector('.task-audio-mode').value).toBe('custom')
    expect(container.querySelector('.task-audio-cue').value).toBe('Custom.hello world')
    expect(container.textContent).toContain('Cue unavailable')
    expect(container.querySelector('.task-audio-preview').disabled).toBe(true)
    expect(currentTask.audio).toBe('custom.hello world')
    mode('standard')
    expect(currentTask.audio).toBe('Hold.TWO')
})

test('empty pack allows custom mode without inventing a cue', () => {
    audioManager.getSelectedPack.mockReturnValue(null)
    render({ type: 'clap', audio: 'Clap.FACE' })
    mode('custom')
    expect(currentTask).toMatchObject({ audioMode: 'custom', audio: null })
    expect(container.textContent).toContain('No custom cues in this pack')
})

test('release mode lists standard release cues, preserves choice through edits, and restores task audio', () => {
    render({ type: 'hold', targetDepth: 1, audio: 'Hold.ONE' })
    mode('release')
    expect(currentTask).toMatchObject({ audioMode: 'release', audio: 'Release.PRE_RELEASE' })
    const values = Array.from(container.querySelector('.task-audio-cue').options).map(option => option.value)
    expect(values).toHaveLength(6)
    expect(values).toContain('Release.POST_RELEASE_FOUR')
    expect(values).not.toContain('Custom.hello world')
    select(2, 'Release.POST_RELEASE_FOUR')
    const plus = container.querySelector('.number-control-btn.plus')
    act(() => { Simulate.mouseDown(plus); Simulate.mouseUp(plus) })
    expect(currentTask.targetDepth).toBe(2)
    expect(currentTask.audio).toBe('Release.POST_RELEASE_FOUR')
    select(0, 'rest')
    expect(currentTask.audio).toBe('Release.POST_RELEASE_FOUR')
    mode('standard')
    expect(currentTask.audio).toBe('Rest.REST')
})

test('legacy release assignments display Release mode without changing the saved task', () => {
    const task = { type: 'hold', audioMode: 'custom', audio: 'Release.POST_RELEASE', targetDepth: 2 }
    render(task)
    expect(container.querySelector('.task-audio-mode').value).toBe('release')
    expect(container.querySelector('.task-audio-cue').value).toBe(task.audio)
    expect(currentTask).toEqual(task)
    expect(container.querySelector('.task-audio-preview').disabled).toBe(true)
    mode('custom')
    expect(Array.from(container.querySelector('.task-audio-cue').options).some(option => option.value.startsWith('Release.'))).toBe(false)
})
