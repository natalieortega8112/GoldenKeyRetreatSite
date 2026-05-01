// Strip the baked-in cream/white background out of the header logo PNG
// and write a true RGBA version with the matched background fully transparent.
// Soft edges via partial alpha on near-matches so antialiased letter edges
// don't show a halo.

const sharp = require("sharp");
const path = require("path");

const INPUT = path.join(
  __dirname,
  "..",
  "public",
  "golden-key-retreats-logo.png",
);
const OUTPUT = path.join(
  __dirname,
  "..",
  "public",
  "golden-key-retreats-logo-transparent.png",
);

const FUZZ = 70; // RGB distance treated as "this is background"
const SOFT = 35; // additional band where alpha ramps from 0 → 255

(async () => {
  const { data, info } = await sharp(INPUT)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Use the very top-left pixel as the background sample.
  const bgR = data[0];
  const bgG = data[1];
  const bgB = data[2];
  console.log(`Background sample (top-left): rgb(${bgR}, ${bgG}, ${bgB})`);

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
    `Done: ${cleared.toLocaleString()} pixels fully transparent, ${softened.toLocaleString()} soft-edge pixels.`,
  );
  console.log(`Wrote ${OUTPUT}`);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
