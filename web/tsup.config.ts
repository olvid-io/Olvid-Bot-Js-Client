import { defineConfig } from "tsup";

const getOutExtension = (format: string, minify: boolean) => {
  switch (format) {
    case "esm":
      return minify ? ".esm.min.js" : ".esm.js";
    case "cjs":
      return minify ? ".cjs.min.js" : ".cjs.js";
    case "iife":
      return minify ? ".min.js" : ".js";
  }
};

// noinspection JSUnusedGlobalSymbols
export default defineConfig([
  {
    entry: ["src/olvid.ts"],
    format: ["esm", "cjs", "iife"],
    globalName: "OLVID",
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    outDir: "dist/",
    platform: "browser",
    outExtension(ctx) {
      return {
        js: getOutExtension(ctx.format, false),
      };
    },
  },
  {
    entry: ["src/olvid.ts"],
    format: ["esm", "cjs", "iife"],
    globalName: "OLVID",
    dts: true,
    clean: false,
    splitting: false,
    sourcemap: true,
    minify: true,
    outDir: "dist/",
    platform: "browser",
    outExtension(ctx) {
      return {
        js: getOutExtension(ctx.format, true),
      };
    },
  },
]);
