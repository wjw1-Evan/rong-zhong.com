const CACHE_NAME = 'rong-zhong-cache-v1';
const STATIC_CACHE = [
    '/',
    '/index.html',
    '/about.html',
    '/services.html',
    '/solutions.html',
    '/contact.html',
    '/styles.css',
    '/main.js',
    '/images/logo.png',
    '/css/icons.css',
    '/css/knogix.css',
    '/js/cookie-consent.js'
];

// Service Worker 安装
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('缓存静态资源');
                return cache.addAll(STATIC_CACHE);
            })
            .catch(error => {
                console.error('缓存静态资源失败:', error);
            })
    );
});

// Service Worker 激活
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 网络请求拦截
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 如果在缓存中找到响应，则返回缓存的响应
                if (response) {
                    return response;
                }

                // 克隆请求，因为请求是一个流，只能使用一次
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest)
                    .then(response => {
                        // 检查是否收到有效的响应
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // 克隆响应，因为响应是一个流，只能使用一次
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                // 将新响应添加到缓存
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // 如果网络请求失败，尝试返回离线页面
                        return caches.match('/offline.html');
                    });
            })
    );
});

// 后台同步
self.addEventListener('sync', event => {
    if (event.tag === 'sync-forms') {
        event.waitUntil(
            // 处理表单数据同步
            syncFormData()
        );
    }
});

// 推送通知
self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/images/logo.png',
        badge: '/images/badge.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('融众信息通知', options)
    );
});

// 处理表单数据同步
async function syncFormData() {
    try {
        const formData = await getFormDataFromIndexedDB();
        if (formData) {
            await fetch('/api/submit-form', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            await clearFormDataFromIndexedDB();
        }
    } catch (error) {
        console.error('表单数据同步失败:', error);
    }
}

// 从 IndexedDB 获取表单数据
function getFormDataFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('formDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['formStore'], 'readonly');
            const store = transaction.objectStore('formStore');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => resolve(getAllRequest.result);
            getAllRequest.onerror = () => reject(getAllRequest.error);
        };
    });
}

// 清除 IndexedDB 中的表单数据
function clearFormDataFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('formDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['formStore'], 'readwrite');
            const store = transaction.objectStore('formStore');
            const clearRequest = store.clear();

            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject(clearRequest.error);
        };
    });
} 