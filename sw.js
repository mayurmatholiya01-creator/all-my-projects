const CACHE_NAME = 'all-my-projects-v1';

// ये सभी फ़ाइलें ऑफ़लाइन के लिए सेव हो जाएँगी
const ASSETS_TO_CACHE = [
    './', 
    './index.html', 
    './app.js', 
    './projects.json',
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
    // './project-tilesearch/index.html' // (इसे छोड़ दें)
];

// Install Event: ज़रूरी फ़ाइलों को कैशे करें
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Cache opened. Caching core assets...');
            // हम addAll इस्तेमाल नहीं करेंगे ताकि अगर एक फ़ाइल (जैसे CDN) फेल हो, तो बाकी कैशे हो जाएँ
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    return cache.add(url).catch(err => {
                        console.warn(`Failed to cache ${url}:`, err);
                    });
                })
            );
        })
    );
});

// Fetch Event: (Network falling back to Cache)
// पहले नेटवर्क (इंटरनेट) से लाने की कोशिश करो।
// अगर फेल (ऑफलाइन) हो, तो कैशे से दो।
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
        .then(networkResponse => {
            // अगर नेटवर्क चला, तो रिस्पांस दो
            return networkResponse;
        })
        .catch(() => {
            // नेटवर्क फेल हुआ? कैशे से dhoondo
            console.log(`Network failed for ${event.request.url}. Trying cache.`);
            return caches.match(event.request);
        })
    );
});
