const controls = [
    { mode: 'exposureMode', value: 'exposureTime', extra: 'iso', label: 'Exposure' },
    { mode: 'whiteBalanceMode', value: 'colorTemperature', label: 'White balance' },
]

const usableValue = (capability, value) => capability && Number.isFinite(value)
    && value >= capability.min && value <= capability.max

// Keep the stream's resolution/device constraints when changing camera controls.
const withControls = (original, values) => ({
    ...original,
    advanced: [
        ...(original.advanced || []),
        // Independent sets let white balance work even if exposure is ignored.
        ...controls.filter(({ mode }) => mode in values).map(({ mode, value, extra }) =>
            Object.fromEntries([mode, value, extra]
                .filter(key => key && key in values)
                .map(key => [key, values[key]]))),
    ],
})

export async function lockCamera(track) {
    if (!track?.getCapabilities || !track.getSettings || !track.applyConstraints) {
        return { message: 'Camera locking is not supported by this browser.' }
    }
    const capabilities = track.getCapabilities()
    const settings = track.getSettings()
    const original = track.getConstraints()
    const applied = {}
    const restore = {}
    const results = []

    for (const { mode, value, extra, label } of controls) {
        const modes = capabilities[mode] || []
        // Require a known original mode so the user can undo every change.
        if (!modes.includes(settings[mode])) continue
        const requested = {}
        if (modes.includes('manual') && usableValue(capabilities[value], settings[value])) {
            requested[mode] = 'manual'
            requested[value] = settings[value]
            if (extra && usableValue(capabilities[extra], settings[extra])) requested[extra] = settings[extra]
        } else if (modes.includes('single-shot')) {
            // One-shot metering is safer than guessing a manual exposure value.
            requested[mode] = 'single-shot'
        } else {
            continue
        }

        try {
            await track.applyConstraints(withControls(original, { ...applied, ...requested }))
            Object.assign(applied, requested)
            for (const key of Object.keys(requested)) restore[key] = settings[key]
            const actual = track.getSettings()
            results.push(actual[mode] === requested[mode]
                ? `${label}: ${requested[mode] === 'manual' ? 'manual mode' : 'one-shot adjustment'}.`
                : `${label}: lock not confirmed by camera.`)
        } catch {
            results.push(`${label}: camera rejected the lock.`)
        }
    }

    return {
        message: results.length ? results.join(' ') : 'Exposure and white balance locking are not available on this camera/browser.',
        // Even an unconfirmed request gets an undo action: drivers can partially comply.
        restore: Object.keys(applied).length ? async () => {
            await track.applyConstraints(withControls(original, restore))
            const actual = track.getSettings()
            if (controls.some(({ mode }) => mode in restore && actual[mode] !== restore[mode])) {
                throw new Error('Camera did not confirm restored settings')
            }
        } : null,
    }
}
