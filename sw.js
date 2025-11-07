const CACHE_NAME = 'all-my-projects-v2'; // (वर्जन बदला गया है ताकि यह अपडेट हो)

// ये सभी फ़ाइलें ऑफ़लाइन के लिए सेव हो जाएँगी
const ASSETS_TO_CACHE = [
    './', 
    './index.html', 
    './style.css',  /* <-- नई CSS फ़ाइल जोड़ी गई */
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
                    // क्रॉस-ओरिजिन (CDN) रिक्वेस्ट के लिए 'no-cors' मोड का इस्तेमाल करें
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
    event.respondWith(
        fetch(event.request)
        .catch(() => {
            // नेटवर्क फेल हुआ? कैशे से dhoondo
            console.log(`Network failed for ${event.request.url}. Trying cache.`);
            return caches.match(event.request);
        })
    );
});
