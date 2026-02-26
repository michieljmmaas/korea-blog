#!/usr/bin/env node

/**
 * add-tags.js
 *
 * Applies tag rules (from tag-rules.js) and manual seed tags (from tag-seed.json)
 * to all existing markdown blog posts in the content/days directory.
 *
 * Usage:
 *   node add-tags.js           # apply rules + seed
 *   node add-tags.js --dry-run # preview changes without writing
 *   node add-tags.js --reset   # clear all tags first, then re-apply
 */

const fs = require('fs');
const path = require('path');
const { TAG_RULES } = require('./tag-rules');

// ── Config ────────────────────────────────────────────────────────────────────

const CONFIG = {
  contentDir: path.join(__dirname, '..', 'content/days'),
  tagSeedFile: path.join(__dirname, 'tag-seed.json'),
};

const DRY_RUN = process.argv.includes('--dry-run');
const RESET   = process.argv.includes('--reset');

// ── Frontmatter parser (no external deps) ─────────────────────────────────────

/**
 * Splits a markdown file into { frontmatter: string, body: string }.
 * Works with both quoted and unquoted YAML values.
 */
function splitMarkdown(raw) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (!match) return null;
  return { frontmatter: match[1], body: match[2] };
}

/**
 * Very small YAML parser — only handles the subset used in these frontmatter blocks.
 * Returns a plain object. Nested keys (stats.*) are supported one level deep.
 */
function parseFrontmatter(yaml) {
  const obj = {};
  const lines = yaml.split(/\r?\n/); // handle both CRLF (Windows) and LF
  let currentParent = null;

  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;

    // Detect indented (nested) key
    const nested = line.match(/^  ([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (nested && currentParent) {
      const [, key, rawVal] = nested;
      obj[currentParent][key] = parseYamlValue(rawVal.trim());
      continue;
    }

    const top = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
    if (!top) continue;

    const [, key, rawVal] = top;
    const val = rawVal.trim();

    if (val === '' || val === null) {
      // Could be the start of a nested block
      obj[key] = {};
      currentParent = key;
    } else {
      obj[key] = parseYamlValue(val);
      currentParent = null;
    }
  }

  return obj;
}

function parseYamlValue(val) {
  if (val === 'true')  return true;
  if (val === 'false') return false;
  if (val === 'null' || val === '~' || val === '') return null;

  // Inline array  ["a", "b"] or [a, b]
  if (val.startsWith('[') && val.endsWith(']')) {
    const inner = val.slice(1, -1).trim();
    if (!inner) return [];
    return inner
      .split(',')
      .map(s => s.trim().replace(/^["']|["']$/g, ''));
  }

  // Quoted string
  if ((val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))) {
    return val.slice(1, -1);
  }

  // Number
  if (!isNaN(Number(val))) return Number(val);

  return val;
}

/**
 * Serialises only the `tags` line back into the YAML frontmatter string,
 * replacing whatever was there before.
 */
function updateTagsInYaml(yaml, tags) {
  const serialised = JSON.stringify(tags); // e.g. ["work","seoul"]
  // Replace existing tags line
  if (/^tags\s*:/m.test(yaml)) {
    return yaml.replace(/^tags\s*:.*$/m, `tags: ${serialised}`);
  }
  // Or append before the first blank/end
  return yaml + `\ntags: ${serialised}`;
}

// ── Seed loader ───────────────────────────────────────────────────────────────

function loadTagSeed() {
  if (!fs.existsSync(CONFIG.tagSeedFile)) return {};
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG.tagSeedFile, 'utf8'));
    return Object.fromEntries(raw.map(e => [e.id, e.tags || []]));
  } catch (err) {
    console.warn(`⚠️  Could not parse tag-seed.json: ${err.message}`);
    return {};
  }
}

// ── Core ──────────────────────────────────────────────────────────────────────

function processFile(filePath, tagSeed) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parts = splitMarkdown(raw);

  if (!parts) {
    console.warn(`  ⚠️  No frontmatter found in ${path.basename(filePath)}, skipping.`);
    return false;
  }

  const fm = parseFrontmatter(parts.frontmatter);

  // Start from empty set if --reset, otherwise keep existing tags
  const existingTags = RESET ? [] : (Array.isArray(fm.tags) ? fm.tags : []);
  const tagSet = new Set(existingTags);

  // Apply rules
  for (const rule of TAG_RULES) {
    const added = rule.apply(fm);
    added.forEach(t => tagSet.add(t));
  }

  // Apply seed tags for this day id
  const seedTags = tagSeed[fm.day] || [];
  seedTags.forEach(t => tagSet.add(t));

  const newTags = Array.from(tagSet).sort();
  const oldTags = Array.from(new Set(existingTags)).sort();

  // Nothing changed?
  if (JSON.stringify(newTags) === JSON.stringify(oldTags)) {
    return false;
  }

  if (!DRY_RUN) {
    const updatedFrontmatter = updateTagsInYaml(parts.frontmatter, newTags);
    const updatedFile = `---\n${updatedFrontmatter}\n---\n${parts.body}`;
    fs.writeFileSync(filePath, updatedFile, 'utf8');
  }

  return { old: oldTags, new: newTags };
}

// ── Main ──────────────────────────────────────────────────────────────────────

function run() {
  console.log(`🏷️  Tag updater${DRY_RUN ? ' (DRY RUN — no files written)' : ''}${RESET ? ' (RESET — clearing existing tags first)' : ''}\n`);

  if (!fs.existsSync(CONFIG.contentDir)) {
    console.error(`❌ Content directory not found: ${CONFIG.contentDir}`);
    process.exit(1);
  }

  const tagSeed = loadTagSeed();
  console.log(`📖 Loaded seed tags for ${Object.keys(tagSeed).length} day(s)\n`);

  const files = fs.readdirSync(CONFIG.contentDir)
    .filter(f => f.endsWith('.md'))
    .sort();

  let changed = 0;
  let unchanged = 0;

  for (const file of files) {
    const filePath = path.join(CONFIG.contentDir, file);
    const result = processFile(filePath, tagSeed);

    if (result) {
      const arrow = result.old.length
        ? `[${result.old.join(', ')}] → [${result.new.join(', ')}]`
        : `→ [${result.new.join(', ')}]`;
      console.log(`  ${DRY_RUN ? '👀' : '✅'} ${file}  ${arrow}`);
      changed++;
    } else {
      unchanged++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ${DRY_RUN ? '👀 Would update' : '✅ Updated'}:  ${changed} file(s)`);
  console.log(`   ⏭️  Unchanged: ${unchanged} file(s)`);
  console.log(`\n💡 Rules active: ${TAG_RULES.map(r => r.name).join(', ')}`);
}

run();