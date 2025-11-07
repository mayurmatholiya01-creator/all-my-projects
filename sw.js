const CACHE_NAME = 'all-my-projects-v3'; // Version badal diya hai

const ASSETS_TO_CACHE = [
    './', 
    './index.html', 
    './manifest.json',
    './imagedata.js', // <-- YEH NAYA ADD KIYA HAI
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

    // --- Project-Tilesearch (Online) ---
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Cache opened. Caching core assets...');
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    const request = new Request(url, { mode: 'no-cors' });
                    return cache.add(request).catch(err => {
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
    if (event.request.url.includes('index.html')) {
        event.respondWith(
            fetch(event.request)
            .catch(() => caches.match(event.request))
        );
        return;
    }

    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response;
            }
            return fetch(event.request);
        })
    );
});
