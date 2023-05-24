const t = /* @__PURE__ */ location.pathname.split("/").slice(0, -1).join("/"), h = [
  t + "/internal/immutable/entry/app.9234c834.js",
  t + "/internal/immutable/assets/0.5d940ba1.css",
  t + "/internal/immutable/nodes/0.2b8730df.js",
  t + "/internal/immutable/nodes/1.060ffcd8.js",
  t + "/internal/immutable/nodes/2.1adbb833.js",
  t + "/internal/immutable/nodes/3.c374f489.js",
  t + "/internal/immutable/nodes/4.315c7321.js",
  t + "/internal/immutable/nodes/5.8ecd3b0c.js",
  t + "/internal/immutable/assets/IconBase.6bf551a2.css",
  t + "/internal/immutable/chunks/IconBase.3953baa1.js",
  t + "/internal/immutable/chunks/Range.dbfb0895.js",
  t + "/internal/immutable/chunks/index.2ebf1e6a.js",
  t + "/internal/immutable/chunks/index.b32904f4.js",
  t + "/internal/immutable/chunks/index.fc72133f.js",
  t + "/internal/immutable/chunks/navigation.1ded8cd7.js",
  t + "/internal/immutable/chunks/singletons.38b5dd91.js",
  t + "/internal/immutable/chunks/trivia.0a8a2609.js",
  t + "/internal/immutable/chunks/util.4c8ca346.js",
  t + "/internal/immutable/entry/start.fba22d78.js"
], u = [
  t + "/favicon.png",
  t + "/icon.png",
  t + "/icon256x256.png",
  t + "/manifest.json",
  t + "/robots.txt"
], o = "1684927268907", a = self, l = `cache${o}`, r = h.concat(u), d = new Set(r);
a.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(l).then((n) => n.addAll(r)).then(() => {
      a.skipWaiting();
    })
  );
});
a.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(async (n) => {
      for (const s of n)
        s !== l && await caches.delete(s);
      a.clients.claim();
    })
  );
});
async function b(e) {
  const n = await caches.open(`offline${o}`);
  try {
    const s = await fetch(e);
    return n.put(e, s.clone()), s;
  } catch (s) {
    const c = await n.match(e);
    if (c)
      return c;
    throw s;
  }
}
a.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || e.request.headers.has("range"))
    return;
  const n = new URL(e.request.url), s = n.protocol.startsWith("http"), c = n.hostname === self.location.hostname && n.port !== self.location.port, i = n.host === self.location.host && d.has(n.pathname), m = e.request.cache === "only-if-cached" && !i;
  s && !c && !m && e.respondWith(
    (async () => i && await caches.match(e.request) || b(e.request))()
  );
});
