// Builds dist/ from src/: one ES module and one CommonJS file, so the same
// package loads from `import` and from `require`. Dependencies stay external.
import { build } from "esbuild"

const shared = {
  entryPoints: ["src/index.js"],
  bundle: true,
  packages: "external",
  platform: "neutral",
  target: "es2020"
}

await build({ ...shared, format: "esm", outfile: "dist/index.js" })
await build({ ...shared, format: "cjs", outfile: "dist/index.cjs" })
