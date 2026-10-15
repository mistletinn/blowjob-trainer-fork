/**
 * Audio Shared - Non-modded audio categories that are the same for all voices
 * These categories (Sfx, Calibration) always resolve from this shared object
 * regardless of voice selection
 */

export const AUDIO_SHARED = {
    NONE: null,

    // ════════════════════════════════════════════════════════════
    // NON-THEMEABLE - Always use default (not in voice packs)
    // ════════════════════════════════════════════════════════════
    Sfx: {
        TICK: 'audio/sfx/metronome hi.mp3',
        TOCK: 'audio/sfx/metronome low.mp3',
        QUIET: 'audio/sfx/metronome quiet.mp3'
    },

    // Calibration feedback
    Calibration: {
        ZERO: 'audio/calibration/cal_0.mp3',
        ONE: 'audio/calibration/cal_1.mp3',
        TWO: ['audio/calibration/cal_2a.mp3', 'audio/calibration/cal_2b.mp3'],
        THREE: 'audio/calibration/cal_3.mp3',
        FOUR: 'audio/calibration/cal_4.mp3'
    }
}
