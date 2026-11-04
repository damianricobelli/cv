// Compiles messages and the runtime with the same options Vite uses.
import { compile } from "@inlang/paraglide-js";
import { paraglideOptions } from "../paraglide.options.mjs";

await compile({
  ...paraglideOptions,
  // Physical message files, so `tsc` works without a dev server running.
  outputStructure: "locale-modules",
});
