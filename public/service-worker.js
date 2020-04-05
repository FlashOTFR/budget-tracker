const FILES_TO_CACHE = [
    `/`,
    `/index.html`,
    `/db.js`,
    `index.js`,
    `style.css`,
    `manifest.webmanifest`
  ];
  
  const CACHE_NAME = `static-cache-v2`;
  const DATA_CACHE_NAME = `data-cache-v2`;

  self.addEventListener('install', event => {
    console.log('begin installation');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('pre-cache successful');
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
  });

  self.addEventListener('activate', event => {
    console.log('BEGIN ACTIVATION!');
    event.waitUntil(
        caches.keys().then(keyList => Promise.all(
            keyList.map(key => {
                if (key !== CACHE_NAME && key !==DATA_CACHE_NAME) {
                    console.log('DESTROYING OBSOLETE FILES', key);
                    return caches.delete(key);
                }
                return undefined;
            })
        ))
    );
    self.clients.claim
  });

  self.addEventListener('fetch', event => {
        console.log('begin fetch');
        if(event.request.url.includes('/api/')){
            event.respondWith(
                caches.open(DATA_CACHE_NAME)
                .then(cache => fetch(event.request)
                .then(response => {
                    if (response.status === 200){
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                })
                .catch(() => 
                cache.match(event.request)
                ))
                .catch(err => console.error())
            );
        } else {
            event.respondWith(
                caches.match(event.request).then(response => response || fetch (event.request))
            );
        }
    });
    