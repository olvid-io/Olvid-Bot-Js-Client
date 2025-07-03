import { defineConfig } from "tsup";

// noinspection JSUnusedGlobalSymbols
export default defineConfig([
  {
    entry: ["src/olvid.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    splitting: false,
    outDir: "dist/",
    platform: "node",
  },
  {
    entry: ["src/gen/decorators/decorators.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    outDir: "dist/",
    platform: "node",
  },
]);
