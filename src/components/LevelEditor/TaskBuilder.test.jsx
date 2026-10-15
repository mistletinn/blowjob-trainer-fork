import React, { act } from 'react'
import { createRoot } from 'react-dom/client'
import TaskBuilder from './TaskBuilder'
import { createLevelBookends } from './levelBookends'

jest.mock('./AudioSelector', () => () => null)

let container, root, tasks
beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true
    container = document.createElement('div')
    root = createRoot(container)
})
afterEach(() => act(() => root.unmount()))

function render(initialTasks = createLevelBookends()) {
    function Harness() {
        const [value, setValue] = React.useState(initialTasks)
        tasks = value
        return <TaskBuilder tasks={value} onChange={setValue} />
    }
    act(() => root.render(<Harness />))
}
function click(text) {
    act(() => Array.from(container.querySelectorAll('button')).find(button => button.textContent.trim() === text).click())
}

test('bookends stay fixed while middle tasks are added, reordered and deleted', () => {
    render()
    expect(tasks.map(task => task.type)).toEqual(['get ready', 'finish'])
    expect(container.querySelectorAll('.task-delete-button')).toHaveLength(0)
    expect(Array.from(container.querySelectorAll('.task-editor-type select')).every(select => select.disabled)).toBe(true)
    click('+ Hold')
    click('+ Rest')
    expect(tasks.map(task => task.type)).toEqual(['get ready', 'hold', 'rest', 'finish'])
    const up = container.querySelectorAll('[aria-label="Move task up"]')
    const down = container.querySelectorAll('[aria-label="Move task down"]')
    expect(up[0].disabled).toBe(true)
    expect(down[1].disabled).toBe(true)
    act(() => up[1].click())
    expect(tasks.map(task => task.type)).toEqual(['get ready', 'rest', 'hold', 'finish'])
    act(() => container.querySelector('.task-delete-button').click())
    act(() => container.querySelector('.task-delete-button').click())
    expect(tasks.map(task => task.type)).toEqual(['get ready', 'finish'])
})

test('existing tasks stay in order without adding missing bookends', () => {
    const original = [{ type: 'rest', timeLimit: 12 }, { type: 'hold', repeat: 5 }]
    render(original)
    expect(tasks).toEqual(original)
    expect(container.querySelectorAll('.task-delete-button')).toHaveLength(2)
    click('+ Clap')
    expect(tasks.map(task => task.type)).toEqual(['rest', 'hold', 'clap'])
    act(() => container.querySelectorAll('[aria-label="Move task up"]')[1].click())
    expect(tasks.map(task => task.type)).toEqual(['hold', 'rest', 'clap'])
})

test('an empty imported level accepts tasks without adding bookends', () => {
    render([])
    click('+ Rest')
    expect(tasks.map(task => task.type)).toEqual(['rest'])
    act(() => container.querySelector('.task-delete-button').click())
    expect(tasks).toEqual([])
})
