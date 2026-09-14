/**
 * Re-encodes everything in src/public/banner to WebP and emits the responsive
 * variants the <img srcset> attributes point at.
 *
 * The repo shipped source-of-truth originals straight to the browser: two
 * photographs stored as PNG (no alpha, so the format bought nothing) and three
 * camera-resolution JPEGs, 4 MB of which loaded on every hero.
 *
 * Originals are moved to _originals/banner/ at the repo root on first run --
 * NOT inside src/public, which is the served publicDir. They are gitignored, so
 * a copy that lived under src/public would be absent on Vercel but present
 * locally, which is exactly the kind of difference that hides bugs.
 *
 * Re-runnable: once originals have moved, they stay the input, so re-encoding
 * never compounds generation loss.
 *
 * Usage: node scripts/optimize-images.mjs
 */
import sharp from "sharp";
import { readdir, mkdir, rename, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const OUT = "src/public/banner";
const ORIGINALS = "_originals/banner";
const QUALITY = 78;
const MAX_EDGE = 1920;

/** srcset steps. A variant is only emitted when the original is wider. */
const WIDTHS = [320, 640, 960, 1440, 1920];

/** Referenced nowhere in src/ — verified by grep before deleting. */
const UNUSED = new Set(["bg-image.png", "bg-shape.png"]);

const isImage = (f) => /\.(png|jpe?g)$/i.test(f);
const kb = (b) => (b / 1024).toFixed(0) + " KB";

async function main() {
  await mkdir(ORIGINALS, { recursive: true });

  // First run: move the originals out of the served directory.
  for (const f of await readdir(OUT)) {
    if (!isImage(f)) continue;
    const from = path.join(OUT, f);
    if (UNUSED.has(f)) {
      await rename(from, path.join(ORIGINALS, f));
      console.log(`unused    ${f} -> ${ORIGINALS} (not re-encoded)`);
      continue;
    }
    await rename(from, path.join(ORIGINALS, f));
  }

  const manifest = {};
  let before = 0;
  let after = 0;

  for (const f of (await readdir(ORIGINALS)).sort()) {
    if (!isImage(f) || UNUSED.has(f)) continue;

    const src = path.join(ORIGINALS, f);
    const base = f.replace(/\.(png|jpe?g)$/i, "");
    const meta = await sharp(src).metadata();
    before += (await stat(src)).size;

    // Longest edge capped at MAX_EDGE, never upscaled.
    const scale = Math.min(1, MAX_EDGE / Math.max(meta.width, meta.height));
    const fullW = Math.round(meta.width * scale);

    const emitted = [];
    const targets = [...new Set([...WIDTHS.filter((w) => w < fullW), fullW])];

    for (const w of targets) {
      const name = w === fullW ? `${base}.webp` : `${base}-${w}.webp`;
      const dest = path.join(OUT, name);
      await sharp(src)
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 6 })
        .toFile(dest);
      const size = (await stat(dest)).size;
      if (w === fullW) after += size;
      emitted.push({ name, w, size });
    }

    manifest[`${base}.webp`] = {
      width: fullW,
      height: Math.round(meta.height * (fullW / meta.width)),
      srcset: emitted.map((e) => ({ name: e.name, w: e.w })),
    };

    const full = emitted.find((e) => e.w === fullW);
    console.log(
      `${f.padEnd(24)} ${meta.width}x${meta.height} ${kb((await stat(src)).size).padStart(8)}` +
        ` ->  ${fullW}px ${kb(full.size).padStart(8)}` +
        `  (${emitted.length} variants)`,
    );
  }

  // Consumed by the components so widths/heights are never hand-typed.
  await writeFile(
    "src/lib/bannerManifest.json",
    JSON.stringify(manifest, null, 2) + "\n",
  );

  console.log(
    `\nfull-size total: ${kb(before)} -> ${kb(after)} ` +
      `(${(100 - (after / before) * 100).toFixed(1)}% smaller)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
