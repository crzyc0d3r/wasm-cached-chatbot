import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createHandler } from "./core.mjs";

const values = new Map();
const handle = createHandler({
  homepage: await readFile(new URL("../public/index.html", import.meta.url), "utf8"),
  getConfig: () => ({ ollamaUrl: process.env.OLLAMA_URL ?? "http://127.0.0.1:11434", model: process.env.OLLAMA_MODEL ?? "qwen2.5:7b", secretSauce: process.env.SECRET_SAUCE ?? "" }),
  getKv: () => ({ get: key => values.get(key), set: (key, value) => values.set(key, value), keys: () => [...values.keys()], delete: key => values.delete(key) }),
});

createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];
    let size = 0;
    for await (const chunk of incoming) {
      size += chunk.length;
      if (size > 8192) { outgoing.writeHead(413); outgoing.end("Request body too large"); return; }
      chunks.push(chunk);
    }
    const request = new Request("http://127.0.0.1" + incoming.url, { method: incoming.method, headers: incoming.headers, ...(chunks.length ? { body: Buffer.concat(chunks) } : {}) });
    const response = await handle(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch {
    outgoing.writeHead(500); outgoing.end("Request failed");
  }
}).listen(Number(process.env.PORT ?? 3000), "127.0.0.1", () => console.log("Chatbot: http://127.0.0.1:" + (process.env.PORT ?? 3000)));

