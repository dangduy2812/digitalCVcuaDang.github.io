import { Jimp } from "jimp";
import { readdir, mkdir, copyFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const srcDir = path.join(root, "images");
const outDir = path.join(root, "repo", "repo_CV_Java", "CV_Java_images");

const VI_FILES = {
  ielts: /IELTS/i,
  word: /MOS Word/i,
  excel: /MOS EXCEL/i,
  ppt: /MOS PowerPoint/i,
};

async function findSource(pattern) {
  const files = await readdir(srcDir);
  const name = files.find((f) => pattern.test(f) && /\.(jpe?g|png)$/i.test(f));
  if (!name) throw new Error(`Missing source matching ${pattern}`);
  return path.join(srcDir, name);
}

async function saveJpeg(img, filename) {
  const out = path.join(outDir, filename);
  await img.write(out);
  console.log("  ->", filename, `${img.bitmap.width}x${img.bitmap.height}`);
}

async function processIelts() {
  const src = await findSource(VI_FILES.ielts);
  let img = await Jimp.read(src);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  img = img.crop({
    x: Math.round(w * 0.03),
    y: Math.round(h * 0.02),
    w: Math.round(w * 0.94),
    h: Math.round(h * 0.96),
  });
  await saveJpeg(img, "cert-ielts-academic.jpg");
}

async function processMos(key, pattern, filename, crop) {
  const src = await findSource(pattern);
  let img = await Jimp.read(src);
  img = img.rotate(90);
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  img = img.crop({
    x: Math.round(w * crop.left),
    y: Math.round(h * crop.top),
    w: Math.round(w * (1 - crop.left - crop.right)),
    h: Math.round(h * (1 - crop.top - crop.bottom)),
  });
  await saveJpeg(img, filename);
}

async function syncStaticAssets() {
  const copies = [
    ["default-avatar.png", "default-avatar.png"],
    ["default-avatar.webp", "default-avatar.webp"],
    ["project_1.png", "project-vehicle-telemetry.png"],
    ["project_2.png", "project-telemetry-pipeline.png"],
    ["project_3.png", "project-iot-sensor.png"],
    ["Cert_WEB.png", "cert-funix-web-app.png"],
    ["banner.jpg", "banner.jpg"],
    ["funix-icon.png", "funix-icon.png"],
  ];
  for (const [from, to] of copies) {
    const src = path.join(srcDir, from);
    try {
      await copyFile(src, path.join(outDir, to));
      console.log("  copy", to);
    } catch {
      console.warn("  skip (missing):", from);
    }
  }
}

await mkdir(outDir, { recursive: true });

console.log("IELTS");
await processIelts();

console.log("MOS Word");
await processMos("word", VI_FILES.word, "cert-mos-word-2010.jpg", {
  left: 0.06,
  top: 0.05,
  right: 0.04,
  bottom: 0.05,
});

console.log("MOS Excel");
await processMos("excel", VI_FILES.excel, "cert-mos-excel-2016.jpg", {
  left: 0.05,
  top: 0.05,
  right: 0.05,
  bottom: 0.05,
});

console.log("MOS PowerPoint");
await processMos("ppt", VI_FILES.ppt, "cert-mos-powerpoint-2016.jpg", {
  left: 0.05,
  top: 0.05,
  right: 0.05,
  bottom: 0.05,
});

console.log("Static assets");
await syncStaticAssets();

console.log("Sync English names to images/");
const englishCerts = [
  "cert-ielts-academic.jpg",
  "cert-mos-word-2010.jpg",
  "cert-mos-excel-2016.jpg",
  "cert-mos-powerpoint-2016.jpg",
  "cert-funix-web-app.png",
];
for (const file of englishCerts) {
  await copyFile(path.join(outDir, file), path.join(srcDir, file));
}

console.log("Done.");
