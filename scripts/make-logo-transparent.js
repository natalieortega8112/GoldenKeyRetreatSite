// Strip a logo PNG's baked-in solid background out and write a true RGBA
// version with the matched background fully transparent. Soft edges via
// partial alpha on near-matches so antialiased letter edges don't fringe.
//
// Usage:
//   node scripts/make-logo-transparent.js <input.png> <output.png> [fuzz] [soft]
// If no args are given, defaults to the header light-bg logo.

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
    `[${path.basename(INPUT)}] background sample: rgb(${bgR}, ${bgG}, ${bgB}); fuzz=${FUZZ} soft=${SOFT}`,
  );

  let cleared = 0;
  let softened = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

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
    `→ ${cleared.toLocaleString()} fully transparent, ${softened.toLocaleString()} soft-edge.`,
  );
  console.log(`→ wrote ${OUTPUT}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
