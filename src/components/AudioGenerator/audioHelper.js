export const AUDIO_HELPER = {
    NONE: null,

    // ════════════════════════════════════════════════════════════
    // NON-THEMEABLE - Always use default (not in voice packs)
    // ════════════════════════════════════════════════════════════
    Sfx: {
        TICK: {
            description: 'Metronome tick sound (high)',
            defaultText: 'Tick'
        },
        TOCK: {
            description: 'Metronome tock sound (low)',
            defaultText: 'Tock'
        },
        QUIET: {
            description: 'Quiet metronome sound',
            defaultText: 'Tick'
        }
    },

    // Voice pack intro sample
    About: {
        desc: 'Voice pack intro sample for users to preview the audio',
        SAMPLE: {
            description: 'Short intro sample for the voice pack',
            defaultText: 'This is a sample of the voice pack'
        }
    },

    // ════════════════════════════════════════════════════════════
    // CORE AUDIO - Required in voice packs
    // ════════════════════════════════════════════════════════════

    // General feedback
    Feedback: {
        desc: 'General performance feedback during exercises. (3+ variations)',
        PERFECT: {
            description: 'Perfect performance feedback',
            defaultText: 'Perfect'
        },
        SURFACE_PENALTY: {
            description: 'Stopped sucking without permission',
            defaultText: 'Back to work.'
        },
        TOO_FAST: {
            description: 'Too fast feedback',
            defaultText: 'Not so fast'
        },
        TOO_SLOW: {
            description: 'Too slow feedback',
            defaultText: 'Too slow'
        },
        WAY_TOO_FAST: {
            description: 'Way too fast feedback',
            defaultText: 'Way too fast'
        },
        WAY_TOO_SLOW: {
            description: 'Way too slow feedback',
            defaultText: 'Way too slow'
        },
        SHALLOW_DESCENT: {
            description: 'Didn\'t suck deep enough',
            defaultText: 'Go deeper'
        },
        DEEP_DESCENT: {
            description: 'Sucked too deep',
            defaultText: 'Too deep'
        },
        SHALLOW_ASCENT: {
            description: 'Shallow ascent feedback',
            defaultText: 'Not so high, fill your mouth'
        },
        DEEP_ASCENT: {
            description: 'Deep ascent feedback',
            defaultText: 'Come further up'
        }
    },

    // Hold state sounds
    Hold: {
        desc: 'Hold position and encouragement. For long holds (>5s) you get encouragement at halfway.  For extra long holds (>12s) you get encouragement at three quarters too.',
        ONE: {
            description: 'Hold position one',
            defaultText: 'Hold'
        },
        TWO: {
            description: 'Hold position two',
            defaultText: 'Hold'
        },
        THREE: {
            description: 'Hold position three',
            defaultText: 'Hold'
        },
        FOUR: {
            description: 'Hold position four',
            defaultText: 'Hold'
        },
        ONE_HALF: {
            description: 'Halfway through hold position one',
            defaultText: 'Keep going'
        },
        TWO_HALF: {
            description: 'Halfway through hold position two',
            defaultText: 'Keep going'
        },
        THREE_HALF: {
            description: 'Halfway through hold position three',
            defaultText: 'Keep going'
        },
        FOUR_HALF: {
            description: 'Halfway through hold position four',
            defaultText: 'Keep going'
        },
        ONE_3Q: {
            description: 'Three quarters through hold position one',
            defaultText: 'Almost there'
        },
        TWO_3Q: {
            description: 'Three quarters through hold position two',
            defaultText: 'Almost there'
        },
        THREE_3Q: {
            description: 'Three quarters through hold position three',
            defaultText: 'Almost there'
        },
        FOUR_3Q: {
            description: 'Three quarters through hold position four',
            defaultText: 'Almost there'
        },
    },

    UpDown: {
        desc: 'Up and down movement feedback and transitions',
        SLOW: {
            description: 'Slow up and down movement',
            defaultText: 'Slow'
        },
        MED: {
            description: 'Medium speed up and down movement',
            defaultText: 'Medium'
        },
        FAST: {
            description: 'Fast up and down movement',
            defaultText: 'Fast'
        },
        DEEP: {
            description: 'Deep up and down movement',
            defaultText: 'Deep'
        },
        ONE_TWO_FAST: {
            description: 'Fast transition from position one to two',
            defaultText: 'One to two'
        },
        ONE_TWO_MED: {
            description: 'Medium speed transition from position one to two',
            defaultText: 'One to two'
        },
        ONE_TWO_SLOW: {
            description: 'Slow transition from position one to two',
            defaultText: 'One to two'
        },
        ONE_THREE_FAST: {
            description: 'Fast transition from position one to three',
            defaultText: 'One to three'
        },
        ONE_THREE_MEDIUM: {
            description: 'Medium speed transition from position one to three',
            defaultText: 'One to three'
        },
        ONE_THREE_SLOW: {
            description: 'Slow transition from position one to three',
            defaultText: 'One to three'
        },
        ONE_FOUR_FAST: {
            description: 'Fast transition from position one to four',
            defaultText: 'One to four'
        },
        ONE_FOUR_MEDIUM: {
            description: 'Medium speed transition from position one to four',
            defaultText: 'One to four'
        },
        ONE_FOUR_SLOW: {
            description: 'Slow transition from position one to four',
            defaultText: 'One to four'
        },
        TWO_THREE_FAST: {
            description: 'Fast transition from position two to three',
            defaultText: 'Two to three'
        },
        TWO_THREE_MED: {
            description: 'Medium speed transition from position two to three',
            defaultText: 'Two to three'
        },
        TWO_THREE_SLOW: {
            description: 'Slow transition from position two to three',
            defaultText: 'Two to three'
        },
        TWO_FOUR_FAST: {
            description: 'Fast transition from position two to four',
            defaultText: 'Two to four'
        },
        TWO_FOUR_MED: {
            description: 'Medium speed transition from position two to four',
            defaultText: 'Two to four'
        },
        TWO_FOUR_SLOW: {
            description: 'Slow transition from position two to four',
            defaultText: 'Two to four'
        },
        THREE_FOUR_FAST: {
            description: 'Fast transition from position three to four',
            defaultText: 'Three to four'
        },
        THREE_FOUR_MED: {
            description: 'Medium speed transition from position three to four',
            defaultText: 'Three to four'
        },
        THREE_FOUR_SLOW: {
            description: 'Slow transition from position three to four',
            defaultText: 'Three to four'
        }
    },

    Hit: {
        desc: 'Hit position sounds',
        // ONE: {
        //     description: 'Hit position one',
        //     defaultText: ''
        // },
        TWO: {
            description: 'Hit position two',
            defaultText: 'Hit'
        },
        THREE: {
            description: 'Hit position three',
            defaultText: 'Hit'
        },
        FOUR: {
            description: 'Hit position four',
            defaultText: 'Hit'
        }
    },

    Clap: {
        desc: 'Clap sounds and encouragement',
        FACE: {
            description: 'Clap on face',
            defaultText: 'Clap'
        },
        BELOW: {
            description: 'Clap below',
            defaultText: 'Clap below'
        },
        KEEPGOING: {
            description: 'Keep going encouragement',
            defaultText: 'Keep going'
        }
    },

    Rest: {
        desc: 'Rest period and breathing sounds',
        SHORT_REST: {
            description: 'Short rest or breath',
            defaultText: 'Breathe'
        },
        REST: {
            description: 'Rest period',
            defaultText: 'Rest'
        },
        REST_BALL: {
            description: 'Rest with balls',
            defaultText: 'Rest'
        }
    },

    Task: {
        desc: 'Task completion feedback',
        GOOD: {
            description: 'Good task completion',
            defaultText: 'Good'
        },
        BAD: {
            description: 'Bad task completion',
            defaultText: 'Bad'
        }
    },

    Finish: {
        desc: 'Finish and completion sounds',
        CLEAN: {
            description: 'Clean finish',
            defaultText: 'Finish'
        }
    },

    Release: {
        desc: 'Pre and post-release instructions and feedback',
        PRE_RELEASE: {
            description: 'Pre-release instruction',
            defaultText: 'Get ready'
        },
        PRE_RELEASE_ZERO: {
            description: 'Pre-release instruction at position zero',
            defaultText: 'Get ready'
        },
        POST_RELEASE: {
            description: 'Post-release feedback',
            defaultText: 'Well done'
        },
        POST_RELEASE_FOUR: {
            description: 'Post-release feedback for position four',
            defaultText: 'Well done'
        },
        POST_RELEASE_ZERO: {
            description: 'Post-release feedback for position zero',
            defaultText: 'Well done'
        }
    },

    Warmup: {
        desc: 'Warmup exercise sounds',
        HIT_THREE: {
            description: 'Warmup hit position three',
            defaultText: 'Hit three'
        },
        HIT_FOUR: {
            description: 'Warmup hit position four',
            defaultText: 'Hit four'
        }
    },

    Rank: {
        desc: 'End of exercise ranking and evaluation feedback',
        END_BAD: {
            description: 'End ranking: bad',
            defaultText: 'Bad'
        },
        END_PASS: {
            description: 'End ranking: pass',
            defaultText: 'Pass'
        },
        END_GOOD: {
            description: 'End ranking: good',
            defaultText: 'Good'
        },
        END_PERFECT: {
            description: 'End ranking: perfect',
            defaultText: 'Perfect'
        }
    },

    // Generic level start (core)
    LevelStart: {
        desc: 'Generic level start sounds',
        GENERIC: {
            description: 'Generic level start',
            defaultText: 'Begin'
        }
    },



    // ════════════════════════════════════════════════════════════
    // CUSTOM - Optional in voice packs (built-in level cues + user-defined)
    // ════════════════════════════════════════════════════════════

    Custom: {
        desc: 'Optional cues for built-in levels or your custom levels',
        // Level 1 - Beginner Training
        beginner_training_START: {
            description: 'Level 1 start',
            defaultText: 'Welcome to beginner training'
        },

        // Level 2 - Quick Blow and Go
        quick_blow_START: {
            description: 'Level 2 start',
            defaultText: 'Quick blow and go'
        },

        // Level 3 - Suck Basics
        suck_basics__START: {
            description: 'Level 3 start',
            defaultText: 'Suck basics'
        },

        // Level 4 - Cock Worship 101
        cock_worship_START: {
            description: 'Level 4 start',
            defaultText: 'Cock worship 101'
        },

        // Level 5 - Intermediate Challenge
        intermediate_START: {
            description: 'Level 5 start',
            defaultText: 'Intermediate challenge'
        },

        // Level 6 - Endurance Builder
        endurance_START: {
            description: 'Level 6 start',
            defaultText: 'Endurance builder'
        },

        // Level 7 - Deep Focus
        deepfocus_START: {
            description: 'Level 7 start',
            defaultText: 'Deep focus'
        },

        // Level 8 - Face Fucking
        face_fuck_START: {
            description: 'Level 8 start',
            defaultText: 'Face fucking'
        },

        // Level 9 - Cock Devotion
        devotion_START: {
            description: 'Level 9 start',
            defaultText: 'Cock devotion'
        },

        // Level 10 - Deepthroat Master
        deepthroat_START: {
            description: 'Level 10 start',
            defaultText: 'Deepthroat master'
        },

        // Level 11 - Elite Endurance
        elite_START: {
            description: 'Level 11 start',
            defaultText: 'Elite endurance'
        },

        // Level 12 - Blowbang Challenge
        blowbang_START: {
            description: 'Level 12 start',
            defaultText: 'Blowbang challenge'
        },
        blowbang_PHASE2: {
            description: 'Level 12 phase 2',
            defaultText: 'Phase two'
        },
        blowbang_PHASE3: {
            description: 'Level 12 phase 3',
            defaultText: 'Phase three'
        },
        blowbang_WELLDONE: {
            description: 'Level 12 well done',
            defaultText: 'Well done'
        }
    }
}
