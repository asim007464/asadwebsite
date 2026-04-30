/**
 * Makes near-black pixels transparent (keeps royal blue mark + white outer ring).
 * Default input: public/logo-source.png (replace with your export).
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const defaultInput = path.join(__dirname, "../public/logo-source.png");

const input = path.resolve(process.argv[2] || defaultInput);
const output = path.resolve(process.argv[3] || path.join(__dirname, "../public/logo.png"));

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const sum = r + g + b;

  const strongBlue = b > r + 14 && b > g + 8 && b > 75;
  const strongWhite = r > 215 && g > 215 && b > 215;

  // Remove black plaque and dark neutrals; keep blue mark + white rounded frame.
  if (!strongBlue && !strongWhite && sum < 135) {
    data[i + 3] = 0;
  }
}

await sharp(Buffer.from(data), {
  raw: { width: w, height: h, channels: 4 },
})
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log("Wrote transparent PNG:", output);
