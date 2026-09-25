import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// The lasting, ImageKit-free image pipeline: walks public/photos/originals/
// (populated either by scripts/download-originals.ts, or by hand-dropping a
// new full-quality photo in the matching days/{date}, weeks/{index},
// blogs/{slug} or food path) and derives the two fixed tiers the site
// actually serves, skipping anything already processed.
//
// Run this after adding new originals. It only touches files that don't
// have a matching output yet, so it's safe to re-run at any time.

const ORIGINALS_DIR = path.join(process.cwd(), 'public', 'photos', 'originals');

const TIERS = {
  thumb: { dir: path.join(process.cwd(), 'public', 'photos', 'thumb'), longEdge: 300, quality: 70 },
  display: { dir: path.join(process.cwd(), 'public', 'photos', 'display'), longEdge: 1920, quality: 80 },
} as const;

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.heic', '.heif']);

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
  });
}

async function isAnimated(originalPath: string): Promise<boolean> {
  try {
    const metadata = await sharp(originalPath, { animated: true }).metadata();
    return (metadata.pages ?? 1) > 1;
  } catch {
    return false;
  }
}

async function processOriginal(originalPath: string, force: boolean, progress: string): Promise<void> {
  const relativePath = path.relative(ORIGINALS_DIR, originalPath);
  const relativeDir = path.dirname(relativePath);
  const baseName = path.parse(relativePath).name;

  // Multi-frame GIF/WEBP sources (short video clips converted to an animated
  // image) get flattened to their first frame by sharp unless explicitly told
  // to read all frames. Keep `thumb` a static preview (consistent with every
  // other thumbnail), but preserve the loop for `display`.
  const animated = await isAnimated(originalPath);

  let wrote = false;
  for (const [tierName, tier] of Object.entries(TIERS)) {
    const outDir = path.join(tier.dir, relativeDir);
    const outPath = path.join(outDir, `${baseName}.webp`);

    if (!force && fs.existsSync(outPath)) continue;

    fs.mkdirSync(outDir, { recursive: true });

    const preserveAnimation = animated && tierName === 'display';

    await sharp(originalPath, preserveAnimation ? { animated: true } : undefined)
      .resize({
        width: tier.longEdge,
        height: tier.longEdge,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: tier.quality })
      .toFile(outPath);

    wrote = true;
    console.log(
      `✅ ${progress} ${relativePath} -> ${path.relative(process.cwd(), outPath)}${preserveAnimation ? ' (animated)' : ''}`,
    );
  }

  if (!wrote) {
    console.log(`⏭️  ${progress} ${relativePath} (thumb + display already exist)`);
  }
}

async function main(): Promise<void> {
  const force = process.argv.includes('--force');
  const originals = walk(ORIGINALS_DIR);

  if (originals.length === 0) {
    console.log('No originals found in public/photos/originals/ — nothing to process.');
    return;
  }

  console.log(`Found ${originals.length} original(s).`);

  let failures = 0;
  for (let i = 0; i < originals.length; i++) {
    const originalPath = originals[i];
    const progress = `[${i + 1}/${originals.length}]`;
    try {
      await processOriginal(originalPath, force, progress);
    } catch (error) {
      failures++;
      console.error(`❌ ${progress} Failed to process ${originalPath}:`, error);
    }
  }

  console.log(`\n🎉 Done processing images (${originals.length - failures}/${originals.length} succeeded).`);

  if (failures > 0) {
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}
