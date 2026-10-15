import { lockCamera } from './cameraLock'

function camera(capabilities, initial, apply) {
    let settings = { ...initial }
    return {
        getCapabilities: () => capabilities,
        getSettings: () => ({ ...settings }),
        getConstraints: () => ({ width: { ideal: 640 }, deviceId: { exact: 'camera-1' } }),
        applyConstraints: jest.fn(async constraints => {
            const values = Object.assign({}, ...constraints.advanced)
            if (apply) apply(values)
            settings = { ...settings, ...values }
        }),
    }
}

const capabilities = {
    exposureMode: ['continuous', 'manual'], exposureTime: { min: 1, max: 1000 },
    iso: { min: 50, max: 800 },
    whiteBalanceMode: ['continuous', 'manual'], colorTemperature: { min: 2000, max: 8000 },
}
const initial = {
    exposureMode: 'continuous', exposureTime: 100, iso: 200,
    whiteBalanceMode: 'continuous', colorTemperature: 4500,
}

test('locks current values, preserves stream constraints and restores original modes', async () => {
    const track = camera(capabilities, initial)
    const result = await lockCamera(track)
    expect(track.getSettings()).toEqual({ ...initial, exposureMode: 'manual', whiteBalanceMode: 'manual' })
    expect(track.applyConstraints.mock.calls[1][0]).toMatchObject({ width: { ideal: 640 }, deviceId: { exact: 'camera-1' } })
    await result.restore()
    expect(track.getSettings()).toEqual(initial)
})

test('does not invent exposure values when only one-shot adjustment is available', async () => {
    const track = camera({ exposureMode: ['continuous', 'single-shot', 'manual'] }, { exposureMode: 'continuous' })
    const result = await lockCamera(track)
    expect(track.getSettings()).toEqual({ exposureMode: 'single-shot' })
    expect(result.message).toContain('one-shot')
})

test('unsupported devices are left untouched', async () => {
    const track = camera({}, {})
    expect((await lockCamera(track)).restore).toBeNull()
    expect(track.applyConstraints).not.toHaveBeenCalled()
    expect((await lockCamera({})).message).toContain('not supported')
})

test('white balance can still be locked when exposure is rejected', async () => {
    const track = camera(capabilities, initial, values => {
        if (values.exposureMode === 'manual') throw new Error('Unsupported exposure')
    })
    const result = await lockCamera(track)
    expect(result.message).toContain('Exposure: camera rejected')
    expect(track.getSettings().whiteBalanceMode).toBe('manual')
    await result.restore()
    expect(track.getSettings()).toEqual(initial)
})

test('silently ignored requests are not reported as successful and failed restoration is detected', async () => {
    const track = camera(capabilities, initial)
    track.applyConstraints = jest.fn(async () => {})
    const result = await lockCamera(track)
    expect(result.message).toContain('lock not confirmed')
    expect(result.message).not.toContain('manual mode')
    track.getSettings = () => ({ exposureMode: 'manual', whiteBalanceMode: 'manual' })
    await expect(result.restore()).rejects.toThrow('did not confirm')
})
