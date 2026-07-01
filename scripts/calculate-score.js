#!/usr/bin/env node

/**
 * calculate-score.js
 *
 * Computes a 'score' for each day based on cultural activity, walking distance,
 * photo count, and text length (how much was written that day).
 *
 * The WEIGHTS and NORMALIZE constants below are tweakable — adjust them to
 * change how much each metric contributes to the final score. Re-run the script
 * as many times as you like; it only writes files that changed.
 *
 * Usage:
 *   node scripts/calculate-score.js           # compute and write scores
 *   node scripts/calculate-score.js --dry-run # preview without writing
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// ── Scoring formula config ─────────────────────────────────────────────────────
// Tweak these to change how the score is calculated.

const WEIGHTS = {
  cultural: 20,
  steps: 15,
  photos: 8,
  textLength: 12,
};

const NORMALIZE = {
  steps: 10000,     // divide steps by this to bring them into comparable range
  textLength: 1000, // divide text length (chars) by this
};

// ── Config ──────────────────────────────────────────────────────────────────

const CONFIG = {
  contentDir: path.join(__dirname, '..', 'content/days'),
};

const DRY_RUN = process.argv.includes('--dry-run');

// ── Scoring logic ───────────────────────────────────────────────────────────

function computeScore(frontmatter, bodyContent) {
  const fm = frontmatter;

  const cultural = (fm.stats?.cultural ?? 0) * WEIGHTS.cultural;
  const steps = ((fm.stats?.steps ?? 0) / NORMALIZE.steps) * WEIGHTS.steps;
  const photos = (fm.photos?.length ?? 0) * WEIGHTS.photos;
  const textLength = (bodyContent.length / NORMALIZE.textLength) * WEIGHTS.textLength;

  const total = cultural + steps + photos + textLength;
  return Math.round(total * 10) / 10; // round to 1 decimal
}

// ── Frontmatter manipulation (surgical, no reformatting) ─────────────────────

/**
 * Extract frontmatter and body from raw markdown.
 * Returns { frontmatter: string, body: string } or null if not found.
 */
function splitMarkdown(raw) {
  const match = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/);
  if (!match) return null;
  return { frontmatter: match[1], body: match[2] };
}

/**
 * Replace or append the score line in a YAML frontmatter string.
 * If a score line exists, replace it. Otherwise, append before the end.
 */
function updateScoreInYaml(yaml, score) {
  // If score line exists, replace it
  if (/^score\s*:/m.test(yaml)) {
    return yaml.replace(/^score\s*:.*$/m, `score: ${score}`);
  }
  // Otherwise append (with a newline before it if the YAML doesn't end with newline)
  return yaml + (yaml.endsWith('\n') ? '' : '\n') + `score: ${score}`;
}

// ── Main logic ──────────────────────────────────────────────────────────────

function run() {
  console.log(
    `🎯 Score calculator${DRY_RUN ? ' (DRY RUN — no files written)' : ''}\n`
  );

  if (!fs.existsSync(CONFIG.contentDir)) {
    console.error(`❌ Content directory not found: ${CONFIG.contentDir}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CONFIG.contentDir)
    .filter((f) => f.endsWith('.md'))
    .sort();

  console.log(`📂 Found ${files.length} markdown files\n`);

  let changed = 0;
  let unchanged = 0;

  for (const file of files) {
    const filePath = path.join(CONFIG.contentDir, file);
    const raw = fs.readFileSync(filePath, 'utf8');

    // Parse with gray-matter for clean separation
    const parsed = matter(raw);
    const fm = parsed.data;
    const bodyContent = parsed.content;

    // Split for surgical YAML rewriting
    const parts = splitMarkdown(raw);
    if (!parts || !fm) {
      console.warn(`  ⚠️  No frontmatter found in ${file}, skipping.`);
      continue;
    }

    const newScore = computeScore(fm, bodyContent);
    const oldScore = fm.score;

    // Only write if score changed
    if (oldScore === newScore) {
      unchanged++;
      continue;
    }

    if (!DRY_RUN) {
      const updatedFrontmatter = updateScoreInYaml(parts.frontmatter, newScore);
      const updatedFile = `---\n${updatedFrontmatter}\n---\n${parts.body}`;
      fs.writeFileSync(filePath, updatedFile, 'utf8');
    }

    const arrow = oldScore !== undefined ? `${oldScore} → ${newScore}` : `→ ${newScore}`;
    console.log(`  ${DRY_RUN ? '👀' : '✅'} ${file}  ${arrow}`);
    changed++;
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ${DRY_RUN ? '👀 Would update' : '✅ Updated'}:  ${changed} file(s)`);
  console.log(`   ⏭️  Unchanged: ${unchanged} file(s)`);
  console.log(`\n⚙️  Current formula:`);
  console.log(`   cultural: ${WEIGHTS.cultural} pts/unit`);
  console.log(`   steps: ${WEIGHTS.steps} pts per ${NORMALIZE.steps} steps`);
  console.log(`   photos: ${WEIGHTS.photos} pts/photo`);
  console.log(`   text: ${WEIGHTS.textLength} pts per ${NORMALIZE.textLength} chars`);
}

run();
