/* Keeps a copy of the app on the phone, so it opens again without a connection. The network is tried first, so updates come through. */
var CACHE='deepavali-1';
self.addEventListener('install',function(){self.skipWaiting();});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return;
  e.respondWith(fetch(e.request).then(function(r){
    if(r&&r.ok){var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy);});}
    return r;
  }).catch(function(){
    return caches.match(e.request).then(function(m){
      if(m)return m;
      if(e.request.mode==='navigate')return caches.match(new URL('./index.html',self.registration.scope).href);
      return Response.error();
    });
  }));
});
