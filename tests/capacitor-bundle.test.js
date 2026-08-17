const assert = require("assert");
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const expectedFiles = [
  "index.html",
  "app.js",
  "app.css",
  "icon.svg",
  "manifest.webmanifest",
  "firebase-messaging-sw.js",
  "capacitor-bridge.js",
  "config/public-config.js",
  "services/firebase.js",
  "services/auth.js"
];

execFileSync(process.execPath, [path.join(root, "scripts", "build-capacitor.mjs")], {
  cwd: root,
  stdio: "inherit"
});

for (const relativePath of expectedFiles) {
  const sourcePath = path.join(root, relativePath);
  const bundlePath = path.join(root, "www", relativePath);

  assert.ok(fs.existsSync(bundlePath), `Arquivo ausente no bundle: ${relativePath}`);
  assert.deepStrictEqual(
    fs.readFileSync(bundlePath),
    fs.readFileSync(sourcePath),
    `Conteúdo divergente no bundle: ${relativePath}`
  );
}

console.log("capacitor-bundle.test.js: OK");
