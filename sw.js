const CACHE_NAME = 'all-my-projects-v2'; // (वर्जन बदला गया है ताकि यह अपडेट हो)

// ये सभी फ़ाइलें ऑफ़लाइन के लिए सेव हो जाएँगी
const ASSETS_TO_CACHE = [
    './', 
    './index.html', 
    // style.css और app.js को यहाँ से हटा दिया गया है, क्योंकि वे index.html में हैं
    // projects.json को भी हटा दिया गया है
    './manifest.json',
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

    // --- Project-Tilesearch (यह ऑनलाइन है, इसलिए इसे कैशे नहीं करेंगे) ---
];

// Install Event: ज़रूरी फ़ाइलों को कैशे करें
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

// Activate Event: पुराने कैशे को डिलीट करें
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

// Fetch Event: (Network falling back to Cache)
self.addEventListener('fetch', event => {
    // index.html के लिए हमेशा नेटवर्क से लाने की कोशिश करें (ताकि अपडेट्स मिलें),
    // अगर फेल हो तो कैशे से दें।
    if (event.request.url.includes('index.html')) {
        event.respondWith(
            fetch(event.request)
            .catch(() => caches.match(event.request))
        );
        return;
    }

    // बाकी सब चीज़ों के लिए कैशे से दें (अगर मौजूद है)
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // अगर कैशे में है, तो उसे दो
            if (response) {
                return response;
            }
            // अगर कैशे में नहीं है, तो नेटवर्क से लाओ
            return fetch(event.request);
        })
    );
});
