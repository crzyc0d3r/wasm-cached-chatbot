import { build } from "esbuild";
import { SpinEsbuildPlugin } from "@spinframework/build-tools/plugins/esbuild/index.js";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

await mkdir("dist", { recursive: true });
await build({
  entryPoints: ["src/spin.mjs"],
  outfile: "build/chatbot.mjs",
  bundle: true,
  format: "esm",
  platform: "browser",
  loader: { ".html": "text" },
  plugins: [await SpinEsbuildPlugin()],
});
const toolDirectory = resolve("node_modules/@spinframework/build-tools");
const tool = JSON.parse(await readFile(resolve(toolDirectory, "package.json"), "utf8"));
const executable = resolve(toolDirectory, typeof tool.bin === "string" ? tool.bin : tool.bin.j2w);
const result = spawnSync(process.execPath, [executable, "-i", "build/chatbot.mjs", "-o", "dist/chatbot.wasm"], { stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;

