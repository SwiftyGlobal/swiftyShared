const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "..", "src", "ui");
const outDir = path.join(__dirname, "..", "dist", "ui");

function copyAssets(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const src = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      copyAssets(src);
      continue;
    }
    if (!/\.(css|d\.ts)$/.test(entry.name)) continue;
    const rel = path.relative(srcDir, src);
    const dest = path.join(outDir, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (!fs.existsSync(outDir)) {
  console.error("dist/ui not found — run `tsc -p tsconfig.ui.json` first");
  process.exit(1);
}

copyAssets(srcDir);
console.log("Copied CSS assets to dist/ui");
