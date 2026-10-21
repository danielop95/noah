import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');
const srcDir = path.join(__dirname, 'src');

// Match: ./images/xxx, /images/xxx, images/xxx (with any extension)
const IMAGE_REF_REGEX = /(?:\.\/|\/)?(images\/[a-zA-Z0-9_.\/-]+\.(?:png|jpg|jpeg|gif|svg|webp|ico))/g;

function getAllFiles(dir, ext = null) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getAllFiles(full, ext));
    } else if (!ext || item.name.endsWith(ext)) {
      results.push(full);
    }
  }
  return results;
}

function extractReferencedImages(dir) {
  const used = new Set();
  const exts = ['.htm', '.html', '.css', '.js', '.jsx', '.ts', '.tsx', '.vue', '.json'];
  const files = getAllFiles(dir).filter((f) => exts.some((e) => f.endsWith(e)));
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = IMAGE_REF_REGEX.exec(content)) !== null) {
      used.add(m[1].replace(/\/+/g, '/'));
    }
  }
  return used;
}

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico']);

function getAllImageFiles(dir, base = dir) {
  const results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of list) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      results.push(...getAllImageFiles(full, base));
    } else if (IMAGE_EXT.has(path.extname(item.name).toLowerCase())) {
      const rel = path.relative(base, full).replace(/\\/g, '/');
      results.push(rel);
    }
  }
  return results;
}

const used = extractReferencedImages(srcDir);
const allImages = getAllImageFiles(imagesDir, publicDir);

const unused = allImages.filter((img) => !used.has(img));

console.log('Total images:', allImages.length);
console.log('Referenced:', used.size);
console.log('Unused:', unused.length);
console.log('\nUnused files (first 50):', unused.slice(0, 50).join('\n'));

// Write list for deletion
fs.writeFileSync(
  path.join(__dirname, 'unused-images-list.txt'),
  unused.join('\n'),
  'utf8'
);
console.log('\nFull list written to unused-images-list.txt');

// Delete unused images
let deleted = 0;
for (const rel of unused) {
  const full = path.join(publicDir, rel);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    deleted++;
  }
}
console.log('\nDeleted', deleted, 'unused image files.');
