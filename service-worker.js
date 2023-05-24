const e = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), h = [
  e + "/internal/immutable/entry/app.23e63d80.js",
  e + "/internal/immutable/assets/0.5d940ba1.css",
  e + "/internal/immutable/nodes/0.2b8730df.js",
  e + "/internal/immutable/nodes/1.d40f3970.js",
  e + "/internal/immutable/nodes/2.1adbb833.js",
  e + "/internal/immutable/nodes/3.e8ce117a.js",
  e + "/internal/immutable/nodes/4.46c5de19.js",
  e + "/internal/immutable/nodes/5.adbf6bc9.js",
  e + "/internal/immutable/assets/IconBase.6bf551a2.css",
  e + "/internal/immutable/chunks/IconBase.3953baa1.js",
  e + "/internal/immutable/chunks/Range.dbfb0895.js",
  e + "/internal/immutable/chunks/index.2ebf1e6a.js",
  e + "/internal/immutable/chunks/index.b32904f4.js",
  e + "/internal/immutable/chunks/index.fc72133f.js",
  e + "/internal/immutable/chunks/navigation.0c2ded4d.js",
  e + "/internal/immutable/chunks/singletons.41d9df85.js",
  e + "/internal/immutable/chunks/trivia.0a8a2609.js",
  e + "/internal/immutable/chunks/util.4c8ca346.js",
  e + "/internal/immutable/entry/start.59e189a8.js"
], u = [
  e + "/favicon.png",
  e + "/icon.png",
  e + "/icon256x256.png",
  e + "/manifest.json",
  e + "/robots.txt"
], o = "1684927271726", a = self, l = `cache${o}`, r = h.concat(u), d = new Set(r);
a.addEventListener("install", (t) => {
  t.waitUntil(
    caches.open(l).then((n) => n.addAll(r)).then(() => {
      a.skipWaiting();
    })
  );
});
a.addEventListener("activate", (t) => {
  t.waitUntil(
    caches.keys().then(async (n) => {
      for (const s of n)
        s !== l && await caches.delete(s);
      a.clients.claim();
    })
  );
});
async function b(t) {
  const n = await caches.open(`offline${o}`);
  try {
    const s = await fetch(t);
    return n.put(t, s.clone()), s;
  } catch (s) {
    const i = await n.match(t);
    if (i)
      return i;
    throw s;
  }
}
a.addEventListener("fetch", (t) => {
  if (t.request.method !== "GET" || t.request.headers.has("range"))
    return;
  const n = new URL(t.request.url), s = n.protocol.startsWith("http"), i = n.hostname === self.location.hostname && n.port !== self.location.port, c = n.host === self.location.host && d.has(n.pathname), m = t.request.cache === "only-if-cached" && !c;
  s && !i && !m && t.respondWith(
    (async () => c && await caches.match(t.request) || b(t.request))()
  );
});
