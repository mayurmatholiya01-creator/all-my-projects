const CACHE_NAME = 'all-my-projects-v3.01'; // Version wahi rakha hai

const ASSETS_TO_CACHE = [
    './', 
    './index.html', 
    './manifest.json',
    './imagedata.js', 
    './icon-192.png',
    './icon-512.png',
    
    // --- Project-Price (Offline) ---
    './project-price/index.html',
    './project-price/imagedata.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
    
    // --- Project-Calculator (Offline) ---
    './project-calculator/index.html',
    './project-calculator/imagedata.js' // <-- Calculator ka logo cache kar diya
    
    // --- Project-Tilesearch (Online Only) ---
    // (Yahan se tile search ki files hata di gayi hain)
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Cache opened. Caching core assets...');
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    // no-cors mode ko hata diya hai taki cross-origin assets bhi sahi se cache ho sakein
                    return cache.add(url).catch(err => {
                        console.warn(`Failed to cache ${url}:`, err);
                    });
                })
            );
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // --- NAYA BADLAV ---
    // Agar request Tile Search page ya Google se related hai, toh hamesha Network se lao
    if (
        url.pathname.includes('/project-tilesearch/') || 
        url.hostname === 'docs.google.com' || 
        url.hostname === 'googleusercontent.com'
    ) {
        event.respondWith(fetch(event.request));
        return;
    }
    // --- BADLAV KHATAM ---

    // Baaki sab ke liye "Cache first, then network" strategy
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response; // Cache se mil gaya
            }
            
            // Cache mein nahi mila, network se fetch karo
            return fetch(event.request).then(
                fetchResponse => {
                    // Response valid hai toh cache mein daal do
                    if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                        // Agar cross-origin (jaise fonts) hai, toh use cache nahi karenge
                        return fetchResponse;
                    }

                    // Response ko clone karke cache mein store karo
                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return fetchResponse;
                }
            );
        })
        .catch(() => {
            // Agar network bhi fail ho jaye (total offline)
            // Toh homepage dikha do
            return caches.match('./index.html');
        })
    );
});
