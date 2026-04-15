const CACHE='kpro-v3';
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','index.html'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.url.includes('supabase')||e.request.url.includes('anthropic')||e.request.url.includes('fonts')||e.request.url.includes('cdnjs')||e.request.url.includes('jsdelivr'))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)))});
