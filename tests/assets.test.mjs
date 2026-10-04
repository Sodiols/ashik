import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { projects } from "../data/projects.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const sourceDirs = ["app", "components", "sections", "styles", "data", "lib", "animations"];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : [path];
  });
}

test("every project image exists in public/", () => {
  for (const project of projects) {
    for (const src of [project.thumbnail, ...project.media.map((m) => m.src)])
      assert.ok(existsSync(join(root, "public", src)), `missing public${src}`);
  }
});

test("every local asset referenced in source exists", () => {
  const references = new Set();
  for (const file of sourceDirs.flatMap((dir) => files(join(root, dir)))) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/["'(]\/((?:fonts|projects|images|media)\/[\w./-]+\.(?:svg|png|jpe?g|webp|avif|woff2?|mp4))/g))
      references.add(`${relative(root, file)} → /${match[1]}`);
    for (const match of text.matchAll(/src:\s*"(\.\.\/public\/[\w./-]+)"/g))
      references.add(`${relative(root, file)} → ${match[1].replace("../", "")}`);
  }
  for (const reference of references) {
    const path = reference.split(" → ")[1].replace(/^\//, "public/");
    assert.ok(existsSync(join(root, path)), `missing ${reference}`);
  }
});

test("self-hosted fonts are real WOFF2 files with their licenses", () => {
  for (const font of ["instrument-sans", "instrument-serif-italic"]) {
    const data = readFileSync(join(root, "public/fonts", `${font}.woff2`));
    assert.equal(data.subarray(0, 4).toString("latin1"), "wOF2", `${font} is not WOFF2`);
  }
  assert.ok(existsSync(join(root, "public/fonts/instrumentsans-LICENSE.txt")));
  assert.ok(existsSync(join(root, "public/fonts/instrumentserif-LICENSE.txt")));
});

test("the visual system stays monochrome", () => {
  const chromatic = [];
  for (const file of [...sourceDirs, "public"].flatMap((dir) => files(join(root, dir)))) {
    if (!/\.(css|tsx?|svg)$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (const [hex] of text.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
      const full = hex.length === 4 ? hex.replace(/#(.)(.)(.)/, "#$1$1$2$2$3$3") : hex;
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(full.slice(i, i + 2), 16));
      if (r !== g || g !== b) chromatic.push(`${relative(root, file)}: ${hex}`);
    }
  }
  assert.deepEqual(chromatic, []);
});
