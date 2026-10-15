/**
 * Audio Paths - Maps Category.KEY to actual file paths
 * This is used by the audio resolver to look up actual file paths
 * when resolving string references like "Rest.REST"
 */

export const AUDIO_PATHS = {
    NONE: null,

    // ════════════════════════════════════════════════════════════
    // NON-THEMEABLE - Always use default (not in voice packs)
    // ════════════════════════════════════════════════════════════
    Sfx: {
        TICK: 'audio/sfx/metronome hi.mp3',
        TOCK: 'audio/sfx/metronome low.mp3',
        QUIET: 'audio/sfx/metronome quiet.mp3'
    },

    // Voice pack intro sample
    About: {
        SAMPLE: ''
    },

    // ════════════════════════════════════════════════════════════
    // CORE AUDIO - Required in voice packs
    // ════════════════════════════════════════════════════════════

    // Calibration feedback
    Calibration: {
        ZERO: 'audio/calibration/cal_0.mp3',
        ONE: 'audio/calibration/cal_1.mp3',
        TWO: ['audio/calibration/cal_2a.mp3', 'audio/calibration/cal_2b.mp3'],
        THREE: 'audio/calibration/cal_3.mp3',
        FOUR: 'audio/calibration/cal_4.mp3'
    },

    // General feedback
    Feedback: {
        PERFECT: [
            'audio/feedback/perfect 0.mp3',
            'audio/feedback/perfect 1.mp3',
            'audio/feedback/perfect 2.mp3',
            'audio/feedback/perfect 3.mp3',
            'audio/feedback/perfect 4.mp3'
        ],
        SURFACE_PENALTY: [
            'audio/feedback/surface penalty hard a.mp3',
            'audio/feedback/surface penalty hard b.mp3',
            'audio/feedback/surface penalty hard c.mp3',
            'audio/feedback/surface penalty hard d.mp3',
            'audio/feedback/surface penalty hard e.mp3',
            'audio/feedback/surface penalty hard f.mp3',
            'audio/feedback/surface penalty hard g.mp3',
            'audio/feedback/surface penalty hard h.mp3'],
        TOO_FAST: [
            'audio/feedback/too fast 1.mp3',
            'audio/feedback/too fast 2.mp3',
            'audio/feedback/too fast 3.mp3'
        ],
        TOO_SLOW: [
            'audio/feedback/too slow 1.mp3',
            'audio/feedback/too slow 2.mp3',
            'audio/feedback/too slow 3.mp3'
        ],
        WAY_TOO_FAST: [
            'audio/feedback/way too fast a.mp3',
            'audio/feedback/way too fast b.mp3',
        ],
        WAY_TOO_SLOW: [
            'audio/feedback/way too slow a.mp3',
            'audio/feedback/way too slow b.mp3',
            'audio/feedback/way too slow c.mp3'
        ],
        SHALLOW_DESCENT: [
            'audio/feedback/too shallow 1.mp3',
            'audio/feedback/too shallow 2.mp3',
            'audio/feedback/too shallow 3.mp3',
            'audio/feedback/too shallow 4.mp3',
            'audio/feedback/too shallow 5.mp3'
        ],
        DEEP_DESCENT: [
            'audio/feedback/deep descent a.mp3',
            'audio/feedback/deep descent b.mp3',
            'audio/feedback/deep descent c.mp3',
            'audio/feedback/deep descent d.mp3',
        ],
        SHALLOW_ASCENT: [
            'audio/feedback/shallow ascent a.mp3',
            'audio/feedback/shallow ascent b.mp3',
            'audio/feedback/shallow ascent c.mp3',
            'audio/feedback/shallow ascent d.mp3',
            'audio/feedback/shallow ascent e.mp3',
        ],
        DEEP_ASCENT: [
            'audio/feedback/deep ascent a.mp3',
            'audio/feedback/deep ascent b.mp3',
            'audio/feedback/deep ascent c.mp3',
            'audio/feedback/deep ascent d.mp3',
        ],
    },

    // Hold state sounds
    Hold: {
        ONE: ['audio/hold/hold 1 a.mp3', 'audio/hold/hold 1 b.mp3', 'audio/hold/hold 1 c.mp3'],
        TWO: ['audio/hold/hold 2a.mp3', 'audio/hold/hold 2b.mp3', 'audio/hold/hold 2c.mp3', 'audio/hold/hold 2d.mp3'],
        THREE: ['audio/hold/hold 3a.mp3', 'audio/hold/hold 3b.mp3', 'audio/hold/hold 3c.mp3', 'audio/hold/hold 3d.mp3', 'audio/hold/hold 3e.mp3'],
        FOUR: ['audio/hold/hold 4a.mp3', 'audio/hold/hold 4b.mp3', 'audio/hold/hold 4c.mp3', 'audio/hold/hold 4d.mp3', 'audio/hold/hold 4e.mp3', 'audio/hold/hold 4f.mp3', 'audio/hold/hold 4g.mp3'],
        // halfway hold continue
        ONE_HALF: ['audio/hold/halfway 1 a.mp3', 'audio/hold/halfway 1 b.mp3', 'audio/hold/halfway 1 c.mp3', 'audio/hold/halfway 1 d.mp3'],
        TWO_HALF: ['audio/hold/halfway 2 a.mp3', 'audio/hold/halfway 2 b.mp3', 'audio/hold/halfway 2 c.mp3'],
        THREE_HALF: ['audio/hold/halfway 3 a.mp3', 'audio/hold/halfway 3 b.mp3', 'audio/hold/halfway 3 c.mp3'],
        FOUR_HALF: ['audio/hold/halfway 4 a.mp3', 'audio/hold/halfway 4 b.mp3', 'audio/hold/halfway 4 c.mp3', 'audio/hold/halfway 4 d.mp3', 'audio/hold/halfway 4 e.mp3'],
        // three quarter hold continue
        ONE_3Q: ['audio/hold/threequarters 1 a.mp3', 'audio/hold/threequarters 1 b.mp3', 'audio/hold/threequarters 1 c.mp3'],
        TWO_3Q: ['audio/hold/threequarters 2 a.mp3', 'audio/hold/threequarters 2 b.mp3'],
        THREE_3Q: ['audio/hold/threequarters 3 a.mp3', 'audio/hold/threequarters 3 b.mp3', 'audio/hold/threequarters 3 c.mp3'],
        FOUR_3Q: ['audio/hold/threequarters 4 a.mp3', 'audio/hold/threequarters 4 b.mp3', 'audio/hold/threequarters 4 c.mp3',],
    },

    UpDown: {
        SLOW: ['audio/updown/slow a.mp3', 'audio/updown/slow b.mp3'],
        MED: ['audio/updown/med a.mp3', 'audio/updown/med b.mp3', 'audio/updown/med c.mp3'],
        FAST: ['audio/updown/fast a.mp3', 'audio/updown/fast b.mp3'],
        DEEP: ['audio/updown/deep a.mp3', 'audio/updown/deep b.mp3', 'audio/updown/deep c.mp3', 'audio/updown/deep d.mp3'],

        // one
        ONE_TWO_FAST: ['audio/updown/1to2 fast a.mp3', 'audio/updown/1to2 fast b.mp3', 'audio/updown/1to2 fast c.mp3'],
        ONE_TWO_MED: ['audio/updown/1to2 med a.mp3', 'audio/updown/1to2 med b.mp3'],
        ONE_TWO_SLOW: ['audio/updown/1to2 slow a.mp3', 'audio/updown/1to2 slow b.mp3'],
        ONE_THREE_FAST: ['audio/updown/1to3 fast a.mp3', 'audio/updown/1to3 fast b.mp3', 'audio/updown/1to3 fast c.mp3'],
        ONE_THREE_MEDIUM: ['audio/updown/1to3 med a.mp3', 'audio/updown/1to3 med b.mp3'],
        ONE_THREE_SLOW: ['audio/updown/1to3 slow a.mp3', 'audio/updown/1to3 slow b.mp3', 'audio/updown/1to3 slow c.mp3'],
        ONE_FOUR_FAST: ['audio/updown/1to4 fast a.mp3', 'audio/updown/1to4 fast b.mp3', 'audio/updown/1to4 fast c.mp3'],
        ONE_FOUR_MEDIUM: ['audio/updown/1to4 med a.mp3'],
        ONE_FOUR_SLOW: ['audio/updown/1to4 slow a.mp3'],

        // two
        TWO_THREE_FAST: ['audio/updown/2to3 fast a.mp3', 'audio/updown/2to3 fast b.mp3'],
        TWO_THREE_MED: ['audio/updown/2to3 med a.mp3'],
        TWO_THREE_SLOW: ['audio/updown/2to3 slow a.mp3', 'audio/updown/2to3 slow b.mp3'],
        TWO_FOUR_FAST: ['audio/updown/2to4 fast a.mp3', 'audio/updown/2to4 fast b.mp3'],
        TWO_FOUR_MED: ['audio/updown/2to4 med a.mp3', 'audio/updown/2to4 med b.mp3'],
        TWO_FOUR_SLOW: ['audio/updown/2to4 slow a.mp3', 'audio/updown/2to4 slow b.mp3'],

        // three
        THREE_FOUR_FAST: ['audio/updown/3to4 slow a.mp3'],
        THREE_FOUR_MED: ['audio/updown/3to4 slow a.mp3'],
        THREE_FOUR_SLOW: ['audio/updown/3to4 slow a.mp3', 'audio/updown/3to4 slow b.mp3'],

    },

    Hit: {
        // ONE: '',
        TWO: ['audio/hit/hit 2 a.mp3', 'audio/hit/hit 2 b.mp3'],
        THREE: ['audio/hit/hit 3 a.mp3', 'audio/hit/hit 3 b.mp3'],
        FOUR: ['audio/hit/hit 4 a.mp3', 'audio/hit/hit 4 b.mp3', 'audio/hit/hit 4 c.mp3'],
    },

    Clap: {
        FACE: [
            'audio/clap/clap a.mp3',
            'audio/clap/clap b.mp3',
            'audio/clap/clap c.mp3'
        ],
        BELOW: [
            'audio/clap/clap below a.mp3',
            'audio/clap/clap below b.mp3',
            'audio/clap/clap below c.mp3',
            'audio/clap/clap below d.mp3',
            'audio/clap/clap below e.mp3',
            'audio/clap/clap below f.mp3',
        ],
        KEEPGOING: [
            "audio/clap/continue a.mp3",
            "audio/clap/continue b.mp3",
            "audio/clap/continue c.mp3",
            "audio/clap/continue d.mp3",
            "audio/clap/continue e.mp3",
            "audio/clap/continue f.mp3",
        ],
    },

    Rest: {
        SHORT_REST: [
            'audio/rest/breath 1 a.mp3',
            'audio/rest/breath 1 b.mp3',
            'audio/rest/breath 1 c.mp3'
        ],
        REST: [
            'audio/rest/rest a.mp3',
            'audio/rest/rest b.mp3',
            'audio/rest/rest c.mp3',
            'audio/rest/rest d.mp3',
            'audio/rest/rest e.mp3',
        ],
        REST_BALL: [
            'audio/rest/rest balls a.mp3',
            'audio/rest/rest balls b.mp3',
            'audio/rest/rest balls c.mp3',
            'audio/rest/rest balls d.mp3',
            'audio/rest/rest balls e.mp3',
        ],
    },

    Task: {
        GOOD: [
            'audio/task/good a.mp3',
            'audio/task/good b.mp3',
            'audio/task/good c.mp3',
            'audio/task/good d.mp3',
            'audio/task/good e.mp3',
            'audio/task/good f.mp3',
            'audio/task/good g.mp3',
            'audio/task/good h.mp3',
            'audio/task/good i.mp3',
        ],
        BAD: [
            'audio/task/bad a.mp3',
            'audio/task/bad b.mp3',
            'audio/task/bad c.mp3',
            'audio/task/bad d.mp3',
            'audio/task/bad e.mp3',
            'audio/task/bad f.mp3',
            'audio/task/bad g.mp3',
            'audio/task/bad h.mp3',
        ],
    },

    Finish: {
        CLEAN: [
            'audio/finish/finish a.mp3',
            'audio/finish/finish b.mp3',
            'audio/finish/finish c.mp3',
            'audio/finish/finish d.mp3',
            'audio/finish/finish e.mp3',
            'audio/finish/finish f.mp3',
            'audio/finish/finish g.mp3',
            'audio/finish/finish h.mp3',
            'audio/finish/finish i.mp3',
            'audio/finish/finish j.mp3',
        ]
    },

    Release: {
        PRE_RELEASE: [
            'audio/release/pre a.mp3',
            'audio/release/pre b.mp3',
            'audio/release/pre c.mp3',
            'audio/release/pre d.mp3',
            'audio/release/pre e.mp3',
            'audio/release/pre f.mp3',
            'audio/release/pre g.mp3',
        ],
        PRE_RELEASE_ZERO: [],
        POST_RELEASE: [
            'audio/release/post a.mp3',
            'audio/release/post b.mp3',
            'audio/release/post c.mp3',
            'audio/release/post d.mp3',
            'audio/release/post e.mp3',
            'audio/release/post f.mp3',
            'audio/release/post g.mp3',
            'audio/release/post h.mp3',
            'audio/release/post i.mp3',
        ],
        POST_RELEASE_FOUR: [
            'audio/release/post 4 a.mp3',
            'audio/release/post 4 b.mp3',
            'audio/release/post 4 c.mp3',
        ],
        POST_RELEASE_ZERO: [
            'audio/release/post 0 a.mp3',
            'audio/release/post 0 b.mp3',
            'audio/release/post 0 c.mp3',
            'audio/release/post 0 d.mp3',
            'audio/release/post 0 e.mp3',
        ],
    },

    Warmup: {
        HIT_THREE: ['audio/warmup/hit 3 a.mp3', 'audio/warmup/hit 3 b.mp3'],
        HIT_FOUR: ['audio/warmup/hit 4 a.mp3'],
    },

    Rank: {
        END_BAD: [
            'audio/rank/bad a.mp3',
            'audio/rank/bad b.mp3',
            'audio/rank/bad c.mp3',
            'audio/rank/bad d.mp3',
            'audio/rank/bad e.mp3',
        ],
        END_PASS: [
            'audio/rank/pass a.mp3',
            'audio/rank/pass b.mp3',
            'audio/rank/pass c.mp3',
            'audio/rank/pass d.mp3',
            'audio/rank/pass e.mp3',
            'audio/rank/pass f.mp3',
            'audio/rank/pass g.mp3',
        ],
        END_GOOD: [
            'audio/rank/good a.mp3',
            'audio/rank/good b.mp3',
            'audio/rank/good c.mp3',
            'audio/rank/good d.mp3',
            'audio/rank/good e.mp3',
        ],
        END_PERFECT: [
            'audio/rank/perfect hard a.mp3',
            'audio/rank/perfect hard b.mp3',
            'audio/rank/perfect hard c.mp3',
            'audio/rank/perfect hard d.mp3',
            'audio/rank/perfect hard e.mp3',
        ],
    },

    // Generic level start (core)
    LevelStart: {
        GENERIC: ['audio/lvl/0 start a.mp3', 'audio/lvl/0 start b.mp3']
    },


    // ════════════════════════════════════════════════════════════
    // CUSTOM - Optional in voice packs (built-in level cues + user-defined)
    // ════════════════════════════════════════════════════════════

    Custom: {
        // Level 1 - Beginner Training
        beginner_training_START: ['audio/lvl/begint/1 start a.mp3', 'audio/lvl/begint/1 start b.mp3'],

        // Level 2 - Quick Blow and Go
        quick_blow_START: 'audio/lvl/quickbg/2 start.mp3',

        // Level 3 - Suck Basics
        suck_basics__START: ['audio/lvl/basicr/3 start.mp3', 'audio/lvl/basicr/3 start b.mp3'],

        // Level 4 - Cock Worship 101
        cock_worship_START: 'audio/lvl/cockw/start.mp3',

        // Level 5 - Intermediate Challenge
        intermediate_START: ['audio/lvl/5 intmed a.mp3'],

        // Level 6 - Endurance Builder
        endurance_START: ['audio/lvl/6 endurance a.mp3'],

        // Level 7 - Deep Focus
        deepfocus_START: ['audio/lvl/7 deepfocus a.mp3'],

        // Level 8 - Face Fucking
        face_fuck_START: ['audio/lvl/8 speed a.mp3'],

        // Level 9 - Cock Devotion
        devotion_START: ['audio/lvl/9 devotion a.mp3'],

        // Level 10 - Deepthroat Master
        deepthroat_START: ['audio/lvl/10 maxdepth a.mp3'],

        // Level 11 - Elite Endurance
        elite_START: ['audio/lvl/11 elite a.mp3'],

        // Level 12 - Blowbang Challenge
        blowbang_START: ['audio/lvl/12 manyload a.mp3'],
        blowbang_PHASE2: ['audio/lvl/12 manyload phase2.mp3'],
        blowbang_PHASE3: ['audio/lvl/12 manyload phase3 a.mp3', 'audio/lvl/12 manyload phase3 b.mp3'],
        blowbang_WELLDONE: ['audio/lvl/12 manyload finale a.mp3', 'audio/lvl/12 manyload finale b.mp3'],
    }
}
