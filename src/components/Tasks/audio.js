/**
 * Audio Enum - String references for audio cues
 * Use these for code completion and type safety
 * Actual file paths are resolved at runtime via audioResolver
 */

export const AUDIO = {
    NONE: null,

    // ════════════════════════════════════════════════════════════
    // NON-THEMEABLE - Always use default (not in voice packs)
    // ════════════════════════════════════════════════════════════
    Sfx: {
        TICK: 'Sfx.TICK',
        TOCK: 'Sfx.TOCK',
        QUIET: 'Sfx.QUIET'
    },

    // Calibration feedback
    Calibration: {
        ZERO: 'Calibration.ZERO',
        ONE: 'Calibration.ONE',
        TWO: 'Calibration.TWO',
        THREE: 'Calibration.THREE',
        FOUR: 'Calibration.FOUR'
    },


    // ════════════════════════════════════════════════════════════
    // CORE AUDIO - Required in voice packs
    // ════════════════════════════════════════════════════════════

    // Voice pack intro sample
    About: {
        SAMPLE: 'About.SAMPLE'
    },

    // Generic level start (core)
    LevelStart: {
        GENERIC: 'LevelStart.GENERIC'
    },

    // Hold state sounds
    Hold: {
        ONE: 'Hold.ONE',
        TWO: 'Hold.TWO',
        THREE: 'Hold.THREE',
        FOUR: 'Hold.FOUR',
        // halfway hold continue
        ONE_HALF: 'Hold.ONE_HALF',
        TWO_HALF: 'Hold.TWO_HALF',
        THREE_HALF: 'Hold.THREE_HALF',
        FOUR_HALF: 'Hold.FOUR_HALF',
        // three quarter hold continue
        ONE_3Q: 'Hold.ONE_3Q',
        TWO_3Q: 'Hold.TWO_3Q',
        THREE_3Q: 'Hold.THREE_3Q',
        FOUR_3Q: 'Hold.FOUR_3Q',
    },

    Hit: {
        // ONE: '', (not defined)
        TWO: 'Hit.TWO',
        THREE: 'Hit.THREE',
        FOUR: 'Hit.FOUR',
    },

    UpDown: {
        SLOW: 'UpDown.SLOW',
        MED: 'UpDown.MED',
        FAST: 'UpDown.FAST',
        DEEP: 'UpDown.DEEP',

        // one
        ONE_TWO_FAST: 'UpDown.ONE_TWO_FAST',
        ONE_TWO_MED: 'UpDown.ONE_TWO_MED',
        ONE_TWO_SLOW: 'UpDown.ONE_TWO_SLOW',
        ONE_THREE_FAST: 'UpDown.ONE_THREE_FAST',
        ONE_THREE_MEDIUM: 'UpDown.ONE_THREE_MEDIUM',
        ONE_THREE_SLOW: 'UpDown.ONE_THREE_SLOW',
        ONE_FOUR_FAST: 'UpDown.ONE_FOUR_FAST',
        ONE_FOUR_MEDIUM: 'UpDown.ONE_FOUR_MEDIUM',
        ONE_FOUR_SLOW: 'UpDown.ONE_FOUR_SLOW',

        // two
        TWO_THREE_FAST: 'UpDown.TWO_THREE_FAST',
        TWO_THREE_MED: 'UpDown.TWO_THREE_MED',
        TWO_THREE_SLOW: 'UpDown.TWO_THREE_SLOW',
        TWO_FOUR_FAST: 'UpDown.TWO_FOUR_FAST',
        TWO_FOUR_MED: 'UpDown.TWO_FOUR_MED',
        TWO_FOUR_SLOW: 'UpDown.TWO_FOUR_SLOW',

        // three
        THREE_FOUR_FAST: 'UpDown.THREE_FOUR_FAST',
        THREE_FOUR_MED: 'UpDown.THREE_FOUR_MED',
        THREE_FOUR_SLOW: 'UpDown.THREE_FOUR_SLOW',

    },

    Warmup: {
        HIT_THREE: 'Warmup.HIT_THREE',
        HIT_FOUR: 'Warmup.HIT_FOUR',
    },

    Clap: {
        FACE: 'Clap.FACE',
        BELOW: 'Clap.BELOW',
        KEEPGOING: 'Clap.KEEPGOING',
    },

    Rest: {
        SHORT_REST: 'Rest.SHORT_REST',
        REST: 'Rest.REST',
        REST_BALL: 'Rest.REST_BALL',
    },

    // General feedback
    Feedback: {
        PERFECT: 'Feedback.PERFECT',
        SURFACE_PENALTY: 'Feedback.SURFACE_PENALTY',
        TOO_FAST: 'Feedback.TOO_FAST',
        TOO_SLOW: 'Feedback.TOO_SLOW',
        WAY_TOO_FAST: 'Feedback.WAY_TOO_FAST',
        WAY_TOO_SLOW: 'Feedback.WAY_TOO_SLOW',
        SHALLOW_DESCENT: 'Feedback.SHALLOW_DESCENT',
        DEEP_DESCENT: 'Feedback.DEEP_DESCENT',
        SHALLOW_ASCENT: 'Feedback.SHALLOW_ASCENT',
        DEEP_ASCENT: 'Feedback.DEEP_ASCENT',
    },

    Task: {
        GOOD: 'Task.GOOD',
        BAD: 'Task.BAD',
    },



    Release: {
        PRE_RELEASE: 'Release.PRE_RELEASE',
        PRE_RELEASE_ZERO: 'Release.PRE_RELEASE_ZERO',
        POST_RELEASE: 'Release.POST_RELEASE',
        POST_RELEASE_FOUR: 'Release.POST_RELEASE_FOUR',
        POST_RELEASE_ZERO: 'Release.POST_RELEASE_ZERO',
    },



    Finish: {
        CLEAN: 'Finish.CLEAN',
    },


    Rank: {
        END_BAD: 'Rank.END_BAD',
        END_PASS: 'Rank.END_PASS',
        END_GOOD: 'Rank.END_GOOD',
        END_PERFECT: 'Rank.END_PERFECT',
    },




    // ════════════════════════════════════════════════════════════
    // LEVEL-SPECIFIC - Optional in voice packs (for default levels)
    // ════════════════════════════════════════════════════════════

    Custom: {
        // Level 1 - Beginner Training
        beginner_training_START: 'Custom.beginner_training_START',

        // Level 2 - Quick Blow and Go
        quick_blow_START: 'Custom.quick_blow_START',

        // Level 3 - Suck Basics
        suck_basics__START: 'Custom.suck_basics__START',

        // Level 4 - Cock Worship 101
        cock_worship_START: 'Custom.cock_worship_START',

        // Level 5 - Intermediate Challenge
        intermediate_START: 'Custom.intermediate_START',

        // Level 6 - Endurance Builder
        endurance_START: 'Custom.endurance_START',

        // Level 7 - Deep Focus
        deepfocus_START: 'Custom.deepfocus_START',

        // Level 8 - Face Fucking
        face_fuck_START: 'Custom.face_fuck_START',

        // Level 9 - Cock Devotion
        devotion_START: 'Custom.devotion_START',

        // Level 10 - Deepthroat Master
        deepthroat_START: 'Custom.deepthroat_START',

        // Level 11 - Elite Endurance
        elite_START: 'Custom.elite_START',

        // Level 12 - Blowbang Challenge
        blowbang_START: 'Custom.blowbang_START',
        blowbang_PHASE2: 'Custom.blowbang_PHASE2',
        blowbang_PHASE3: 'Custom.blowbang_PHASE3',
        blowbang_WELLDONE: 'Custom.blowbang_WELLDONE',
    }
}

// Helper function to get an audio file for a given event
// DEPRECATED: Use audioManager.getAudioFile() instead
// Kept for backward compatibility
export const getAudioFile = (audioPath) => {
    // Handle arrays vs single files
    if (Array.isArray(audioPath)) {
        return audioPath[Math.floor(Math.random() * audioPath.length)]
    }
    return audioPath
}

// Helper function to get the category and key name for an audio path
// DEPRECATED: Use audioManager.getAudioKey() instead
// Kept for backward compatibility
// Note: This now works with string references like "Rest.REST" - just returns them as-is
export const getAudioKey = (audioPath) => {
    // If it's already a string reference (Category.KEY format), return it
    if (typeof audioPath === 'string' && audioPath.includes('.')) {
        return audioPath
    }

    // Otherwise, try to find it in voice files (reverse lookup)
    // This is for backward compatibility with direct paths
    // Note: This may not work correctly after refactor - consider removing
    return null
}
