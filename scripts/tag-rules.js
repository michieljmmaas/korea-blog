// @ts-check

/**
 * @typedef {Object} Stats
 * @property {number} kimbap
 * @property {number} commits
 * @property {number} worked
 * @property {number} cultural
 * @property {number} steps
 */

/**
 * @typedef {Object} Coordinates
 * @property {number|null} lat
 * @property {number|null} lng
 */

/**
 * @typedef {Object} DayPostFrontmatter
 * @property {string}      title
 * @property {string}      date
 * @property {number}      day
 * @property {string}      icon
 * @property {'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday'|'Sunday'} dayOfWeek
 * @property {string}      location
 * @property {string[]}    photos
 * @property {string}      description
 * @property {Stats}       stats
 * @property {string[]}    tags
 * @property {string}      thumbnail
 * @property {boolean}     draft
 * @property {Coordinates} coordinates
 * @property {boolean}     work
 */

/**
 * @typedef {Object} RuleContext
 * @property {DayPostFrontmatter|null} prevDay
 * @property {DayPostFrontmatter|null} nextDay
 */

/**
 * @typedef {Object} TagRule
 * @property {string} name
 * @property {(fm: DayPostFrontmatter, context?: RuleContext) => string[]} apply
 */

/** @type {TagRule[]} */
const TAG_RULES = [
    // Work days
    {
        name: 'work days',
        apply: (fm) => fm.work === true ? ['work'] : ['adventure'],
    },

    {
        name: 'high steps',
        apply: (fm) => fm.stats?.steps >= 29000 ? ['30k-day'] : [],
    },

    {
        name: 'kpop',
        apply: (fm) => fm.icon === "music" ? ['k-pop'] : [],
    },

    {
        name: 'map',
        apply: (fm) => fm.day > 55 ? ['map'] : [],
    },

    {
        name: 'twice',
        apply: (fm) => {
            let seed = [2, 21, 23, 24, 25, 27];

            if (seed.includes(fm.day) === true) {
                return ['twice'];
            } else {
                return [];
            }
        },
    },

    {
        name: 'mama',
        apply: (fm) => {
            let seed = [64, 65];

            if (seed.includes(fm.day) === true) {
                return ['mama'];
            } else {
                return [];
            }
        },
    },

    {
        name: 'social',
        apply: (fm) => {
            let seed = [14, 16, 20, 26, 31, 32, 34, 36, 38, 40, 50, 54];

            if (seed.includes(fm.day) === true) {
                return ['social'];
            } else {
                return [];
            }
        },
    },

        {
        name: 'short',
        apply: (fm) => fm.photos.length <= 3 ? ['short'] : [],
    },

    // Location tags (normalised to lowercase kebab-case)
    {
        name: 'location tag',
        apply: (fm) => {
            if (!fm.location || fm.location.trim() === '') return [];
            return [fm.location.trim().toLowerCase().replace(/\s+/g, '-')];
        },
    },

    // Travel day — moving to a different location the next day
    {
        name: 'travel day',
        apply: (fm, { nextDay } = { prevDay: null, nextDay: null }) => {
            if (!nextDay) return [];
            if (!fm.location || !nextDay.location) return [];
            const current = fm.location.trim().toLowerCase();
            const next = nextDay.location.trim().toLowerCase();
            return current !== next ? ['travel'] : [];
        },
    },
];

module.exports = { TAG_RULES };