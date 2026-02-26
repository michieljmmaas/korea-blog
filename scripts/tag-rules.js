/**
 * Tag Rules Configuration
 *
 * Each rule is a function that receives the frontmatter object
 * and returns an array of tags to add (or empty array for none).
 *
 * Rules are applied in order, and all matching tags are merged.
 */

const TAG_RULES = [
  // Work days
  {
    name: 'work days',
    apply: (fm) => fm.work === true ? ['work'] : [],
  },

  // Adventure / exploration days
  {
    name: 'adventure days',
    apply: (fm) => fm.work === false ? ['adventure'] : [],
  },

  // Location tags (normalised to lowercase kebab-case)
  {
    name: 'location tag',
    apply: (fm) => {
      if (!fm.location || fm.location.trim() === '') return [];
      return [fm.location.trim().toLowerCase().replace(/\s+/g, '-')];
    },
  },

  // High step days
  {
    name: 'high steps',
    apply: (fm) => fm.stats?.steps >= 8000 ? ['active'] : [],
  },

  // Lazy / low step days
  {
    name: 'low steps',
    apply: (fm) => fm.stats?.steps < 3000 ? ['lazy-day'] : [],
  },

  // Productive work days (many commits)
  {
    name: 'productive',
    apply: (fm) => fm.stats?.commits >= 5 ? ['productive'] : [],
  },

  // Cultural activities
  {
    name: 'cultural',
    apply: (fm) => fm.stats?.cultural >= 3 ? ['cultural'] : [],
  },

  // Photos present
  {
    name: 'has photos',
    apply: (fm) => (Array.isArray(fm.photos) && fm.photos.length > 0) ? ['photos'] : [],
  },

  // Weekend days
  {
    name: 'weekend',
    apply: (fm) => ['Saturday', 'Sunday'].includes(fm.dayOfWeek) ? ['weekend'] : [],
  },
];

module.exports = { TAG_RULES };