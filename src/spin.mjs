import { openDefault } from "@spinframework/spin-kv";
import { get } from "@spinframework/spin-variables";
import homepage from "../public/index.html";
import { createHandler } from "./core.mjs";

const handle = createHandler({
  homepage,
  getConfig: () => ({ ollamaUrl: get("ollama_url"), model: get("ollama_model"), secretSauce: get("secret_sauce") }),
  getKv: () => {
    const store = openDefault();
    return {
      get: key => store.exists(key) ? store.getJson(key) : undefined,
      set: (key, value) => store.setJson(key, value),
      keys: () => store.getKeys(),
      delete: key => { if (store.exists(key)) store.delete(key); },
    };
  },
});

addEventListener("fetch", event => event.respondWith(handle(event.request)));

