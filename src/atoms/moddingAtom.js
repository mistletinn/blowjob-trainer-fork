import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { AUDIO } from '../components/Tasks/audio'

// API configuration for Eleven Labs
export const apiKeyAtom = atomWithStorage('elevenlabs_api_key', '')
export const voiceIdAtom = atomWithStorage('elevenlabs_voice_id', '')
export const speedAtom = atom(90) // 70 to 120, default 100 (becomes 1.0 when divided by 100)
export const stabilityAtom = atom(50) // 0 to 100, default 50
export const similarityAtom = atom(50) // 0 to 100, default 50

// Voice selection - can be 'female_default', 'male_default', or a custom pack ID
export const voiceSelectionAtom = atomWithStorage('voice_selection', 'female_default')

// Current text input for audio generation
export const textToSpeechAtom = atom('')

// Selected category and audio key for audio generation
export const selectedCategoryAtom = atom('')
export const selectedAudioKeyAtom = atom('')

// Initialize audioPack with all core categories
const initializeAudioPack = () => {
    const pack = {}
    for (const category in AUDIO) {
        if (category !== 'NONE' && category !== 'Sfx' && category !== 'Custom') {
            if (typeof AUDIO[category] === 'object' && AUDIO[category] !== null) {
                pack[category] = {}
                for (const key in AUDIO[category]) {
                    if (AUDIO[category][key] !== null && AUDIO[category][key] !== 'non') {
                        pack[category][key] = [] // Array of Blob objects
                    }
                }
            }
        }
    }
    return pack
}

// Initialize Custom cues in audioPack from AUDIO.Custom
export const initializeCustom = () => {
    const custom = {}
    if (AUDIO.Custom && typeof AUDIO.Custom === 'object') {
        for (const key in AUDIO.Custom) {
            if (AUDIO.Custom[key] !== null && AUDIO.Custom[key] !== 'non' && key !== 'desc') {
                custom[key] = [] // Array of Blob objects
            }
        }
    }
    return custom
}

// Audio pack storage (not using atomWithStorage since Blobs can't be serialized)
export const audioPackAtom = atom(initializeAudioPack())

// Level audio mode: 'disabled' | 'currentLevels' | 'custom'
export const levelAudioModeAtom = atom('disabled')