// Strip a logo PNG's baked-in solid background out and write a true RGBA
// version with the matched background fully transparent. Soft edges via
// partial alpha on near-matches so antialiased letter edges don't fringe.
//
// Usage:
//   node scripts/make-logo-transparent.js <input.png> <output.png> [fuzz] [soft] [lumaFloor] [lumaCeil]
// If no args are given, defaults to the header light-bg logo.
//
// lumaFloor: pixels darker than this average rgb are forced transparent
//            (use to strip stray-dark background that drifts outside the
//            fuzz sphere). Set to 0 to disable.
// lumaCeil:  pixels brighter than this average rgb are forced transparent
//            (use to strip stray-light background on a light source PNG).
//            Set to 256 to disable.

const sharp = require("sharp");
const path = require("path");

const PUBLIC = path.join(__dirname, "..", "public");

const args = process.argv.slice(2);
const INPUT = args[0]
  ? path.resolve(args[0])
  : path.join(PUBLIC, "golden-key-retreats-logo.png");
const OUTPUT = args[1]
  ? path.resolve(args[1])
  : path.join(PUBLIC, "golden-key-retreats-logo-transparent.png");
const FUZZ = Number(args[2] ?? 70); // RGB distance treated as background
const SOFT = Number(args[3] ?? 35); // additional band where alpha ramps 0 → 255
const LUMA_FLOOR = Number(args[4] ?? 0); // 0 = disabled
const LUMA_CEIL = Number(args[5] ?? 256); // 256 = disabled

(async () => {
  const { data, info } = await sharp(INPUT)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Sample the top-left pixel as the background reference.
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  console.log(
    `[${path.basename(INPUT)}] background sample: rgb(${bgR}, ${bgG}, ${bgB}); fuzz=${FUZZ} soft=${SOFT} lumaFloor=${LUMA_FLOOR} lumaCeil=${LUMA_CEIL}`,
  );

  let cleared = 0;
  let softened = 0;
  let lumaCleared = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    const luma = (r + g + b) / 3;
    if (luma < LUMA_FLOOR || luma > LUMA_CEIL) {
      data[i + 3] = 0;
      lumaCleared++;
      continue;
    }

    if (dist <= FUZZ) {
      data[i + 3] = 0;
      cleared++;
    } else if (dist <= FUZZ + SOFT) {
      const t = (dist - FUZZ) / SOFT;
      data[i + 3] = Math.round(255 * t);
      softened++;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(OUTPUT);

  console.log(
    `→ ${cleared.toLocaleString()} bg-match, ${lumaCleared.toLocaleString()} luma-clipped, ${softened.toLocaleString()} soft-edge.`,
  );
  console.log(`→ wrote ${OUTPUT}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
