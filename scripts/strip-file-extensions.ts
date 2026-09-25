import 'dotenv/config';
import fs from 'fs';
import path from 'path';

/**
 * Strips file extensions off ImageKit files in a given folder (e.g. the
 * .heic files iPhone photos get uploaded with) and updates the matching
 * photo IDs in a content markdown file's frontmatter `photos` array and
 * `<Img ... />` tags.
 *
 * Usage:
 *   tsx scripts/strip-file-extensions.ts <imagekit-folder> [content-file] [--dry-run]
 *
 * Example:
 *   tsx scripts/strip-file-extensions.ts /blogs/alisan content/blogs/alisan.md
 */

const API_BASE = 'https://api.imagekit.io/v1';
const EXTENSION_REGEX = /\.[a-zA-Z0-9]+$/;

interface ImageKitFile {
  fileId: string;
  name: string;
  filePath: string;
  type: 'file' | 'folder';
}

function getPrivateKey(): string {
  const key = process.env.IMAGE_KIT_PRIVATE_KEY;
  if (!key) {
    throw new Error('IMAGE_KIT_PRIVATE_KEY environment variable is required');
  }
  return key;
}

function authHeader(): string {
  return `Basic ${Buffer.from(`${getPrivateKey()}:`).toString('base64')}`;
}

function normalizeFolderPath(folder: string): string {
  let p = folder.startsWith('/') ? folder : `/${folder}`;
  if (!p.endsWith('/')) p += '/';
  return p;
}

async function listFiles(folderPath: string): Promise<ImageKitFile[]> {
  const files: ImageKitFile[] = [];
  const limit = 100;
  let skip = 0;

  while (true) {
    const url = `${API_BASE}/files?path=${encodeURIComponent(folderPath)}&limit=${limit}&skip=${skip}`;
    const res = await fetch(url, { headers: { Authorization: authHeader() } });

    if (!res.ok) {
      throw new Error(`Failed to list files at ${folderPath}: ${res.status} ${await res.text()}`);
    }

    const batch = (await res.json()) as ImageKitFile[];
    files.push(...batch.filter(f => f.type === 'file'));

    if (batch.length < limit) break;
    skip += limit;
  }

  return files;
}

async function renameFile(filePath: string, newFileName: string): Promise<void> {
  const res = await fetch(`${API_BASE}/files/rename`, {
    method: 'PUT',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filePath, newFileName, purgeCache: false }),
  });

  if (!res.ok) {
    throw new Error(`Failed to rename ${filePath} -> ${newFileName}: ${res.status} ${await res.text()}`);
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function updateContentFile(filePath: string, renameMap: Map<string, string>, dryRun: boolean): void {
  let content = fs.readFileSync(filePath, 'utf-8');

  for (const [oldName, newName] of renameMap) {
    content = content.split(`'${oldName}'`).join(`'${newName}'`);
    content = content.split(`"${oldName}"`).join(`"${newName}"`);
    content = content.replace(
      new RegExp(`(<Img\\s+)${escapeRegex(oldName)}(?=\\s|/|>)`, 'g'),
      `$1${newName}`
    );
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}Updating ${filePath}`);
  if (!dryRun) {
    fs.writeFileSync(filePath, content);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter(a => a !== '--dry-run');
  const dryRun = process.argv.includes('--dry-run');
  const [folderArg, contentFileArg] = args;

  if (!folderArg) {
    console.error('Usage: tsx scripts/strip-file-extensions.ts <imagekit-folder> [content-file] [--dry-run]');
    process.exit(1);
  }

  const folderPath = normalizeFolderPath(folderArg);

  console.log(`Listing files in ${folderPath}...`);
  const files = await listFiles(folderPath);
  const existingNames = new Set(files.map(f => f.name));
  const toRename = files.filter(f => EXTENSION_REGEX.test(f.name));

  if (toRename.length === 0) {
    console.log('No files with extensions found — nothing to do.');
    return;
  }

  const renameMap = new Map<string, string>();

  for (const file of toRename) {
    const newName = file.name.replace(EXTENSION_REGEX, '');

    if (existingNames.has(newName)) {
      console.warn(`⚠️  Skipping ${file.name}: a file named "${newName}" already exists in ${folderPath}`);
      continue;
    }

    renameMap.set(file.name, newName);
  }

  for (const [oldName, newName] of renameMap) {
    const file = toRename.find(f => f.name === oldName)!;
    console.log(`${dryRun ? '[dry-run] ' : ''}Renaming ${file.filePath} -> ${newName}`);
    if (!dryRun) {
      await renameFile(file.filePath, newName);
    }
  }

  if (contentFileArg) {
    const fullPath = path.resolve(process.cwd(), contentFileArg);
    updateContentFile(fullPath, renameMap, dryRun);
  }

  console.log(`${dryRun ? '[dry-run] ' : ''}Done. ${renameMap.size} file(s) renamed.`);
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
