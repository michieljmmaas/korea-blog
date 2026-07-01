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
  photos: 10,
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

  return {
    total: Math.round(total * 10) / 10,
    breakdown: {
      cultural: Math.round(cultural * 10) / 10,
      steps: Math.round(steps * 10) / 10,
      photos: Math.round(photos * 10) / 10,
      textLength: Math.round(textLength * 10) / 10,
    },
    raw: {
      culturalCount: fm.stats?.cultural ?? 0,
      stepsCount: fm.stats?.steps ?? 0,
      photosCount: fm.photos?.length ?? 0,
      textLengthChars: bodyContent.length,
    }
  };
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
  const allScores = [];

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

    const scoreData = computeScore(fm, bodyContent);
    const newScore = scoreData.total;
    const oldScore = fm.score;

    // Store score info for later display
    allScores.push({
      file,
      filePath,
      parts,
      oldScore,
      newScore,
      scoreData,
      changed: oldScore !== newScore
    });

    // Track changes for summary
    if (oldScore !== newScore) {
      changed++;
    } else {
      unchanged++;
    }
  }

  // Sort all scores by newScore descending (highest first)
  allScores.sort((a, b) => b.newScore - a.newScore);

  // Display all scores sorted by value (highest to lowest)
  console.log(`📈 All scores (sorted highest to lowest):\n`);
  for (const scoreEntry of allScores) {
    const { file, oldScore, newScore, scoreData, changed: hasChanged } = scoreEntry;
    const arrow = oldScore !== undefined ? `${oldScore} → ${newScore}` : `→ ${newScore}`;
    const breakdown = `[cultural: ${scoreData.breakdown.cultural}, steps: ${scoreData.breakdown.steps}, photos: ${scoreData.breakdown.photos}, text: ${scoreData.breakdown.textLength}]`;
    const marker = hasChanged ? (DRY_RUN ? '👀' : '✅') : '  ';
    console.log(`  ${marker} ${file}  ${arrow}`);
    console.log(`     ${breakdown}`);
  }

  // Write changes if any
  if (changed > 0) {
    console.log(`\n💾 Writing changes...`);
    for (const scoreEntry of allScores) {
      if (scoreEntry.changed && !DRY_RUN) {
        const updatedFrontmatter = updateScoreInYaml(scoreEntry.parts.frontmatter, scoreEntry.newScore);
        const updatedFile = `---\n${updatedFrontmatter}\n---\n${scoreEntry.parts.body}`;
        fs.writeFileSync(scoreEntry.filePath, updatedFile, 'utf8');
      }
    }

    // Show summary of changes with position changes
    console.log(`\n📝 Changes made:\n`);
    const changedFiles = allScores.filter(s => s.changed);

    // Build position maps
    const oldRanking = allScores
      .filter(s => s.oldScore !== undefined)
      .sort((a, b) => b.oldScore - a.oldScore)
      .map(s => s.file);
    const newRanking = allScores.sort((a, b) => b.newScore - a.newScore).map(s => s.file);

    const oldPosition = new Map(oldRanking.map((file, idx) => [file, idx + 1]));
    const newPosition = new Map(newRanking.map((file, idx) => [file, idx + 1]));

    // Show only changes where position actually changed
    for (const scoreEntry of changedFiles) {
      const { file, oldScore, newScore, scoreData } = scoreEntry;
      const oldPos = oldPosition.get(file) || '?';
      const newPos = newPosition.get(file) || '?';

      // Skip if position didn't actually change
      if (oldPos === newPos) continue;

      const arrow = oldScore !== undefined ? `${oldScore} → ${newScore}` : `→ ${newScore}`;
      const posChange = `(position ${oldPos} → ${newPos})`;
      const breakdown = `[cultural: ${scoreData.breakdown.cultural}, steps: ${scoreData.breakdown.steps}, photos: ${scoreData.breakdown.photos}, text: ${scoreData.breakdown.textLength}]`;
      console.log(`  ${file}  ${arrow}  ${posChange}`);
      console.log(`     ${breakdown}`);
    }
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
