/**
 * Rive Block Service Worker
 *
 * Provides offline caching and performance optimization for Rive animations.
 * Caches WASM runtime, JavaScript, and .riv animation files for instant loading.
 *
 * @version 1.0.0
 */

const CACHE_VERSION = 'rive-block-v1';
const CACHE_NAME = `${CACHE_VERSION}-assets`;

// Assets to cache during Service Worker installation
const STATIC_ASSETS = [
	// WASM runtime (1.8 MB - critical for Rive)
	'/wp-content/plugins/rive-block/build/rive-block/webgl2_advanced.wasm',
	// JavaScript runtime
	'/wp-content/plugins/rive-block/build/rive-block/view.js'
];

/**
 * Service Worker Installation
 * Downloads and caches static assets for offline use
 */
self.addEventListener('install', (event) => {
	console.log('[Rive SW] Installing Service Worker v' + CACHE_VERSION);

	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('[Rive SW] Caching static assets');
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => {
				console.log('[Rive SW] Static assets cached successfully');
				// Activate immediately without waiting for other tabs to close
				return self.skipWaiting();
			})
			.catch((error) => {
				console.error('[Rive SW] Installation failed:', error);
			})
	);
});

/**
 * Service Worker Activation
 * Cleans up old caches when a new version is activated
 */
self.addEventListener('activate', (event) => {
	console.log('[Rive SW] Activating Service Worker v' + CACHE_VERSION);

	event.waitUntil(
		// Clean up old cache versions
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames
					.filter((cacheName) => {
						// Delete caches that don't match current version
						return cacheName.startsWith('rive-block-') && cacheName !== CACHE_NAME;
					})
					.map((cacheName) => {
						console.log('[Rive SW] Deleting old cache:', cacheName);
						return caches.delete(cacheName);
					})
			);
		})
		.then(() => {
			console.log('[Rive SW] Old caches cleaned up');
			// Take control of all clients immediately
			return self.clients.claim();
		})
	);
});

/**
 * Fetch Event Handler
 * Intercepts network requests and serves cached responses when available
 *
 * Strategy: Cache First, falling back to Network
 * - WASM files: Always try cache first (immutable assets)
 * - .riv files: Cache first for faster loads
 * - Other requests: Pass through to network
 */
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Only intercept requests for Rive assets
	const isRiveAsset =
		url.pathname.includes('/rive-block/') && (
			url.pathname.endsWith('.wasm') ||
			url.pathname.endsWith('.riv') ||
			url.pathname.includes('/view.js')
		);

	if (!isRiveAsset) {
		// Pass through all other requests
		return;
	}

	// Cache-first strategy for Rive assets
	event.respondWith(
		caches.match(request)
			.then((cachedResponse) => {
				if (cachedResponse) {
					console.log('[Rive SW] Serving from cache:', url.pathname);
					return cachedResponse;
				}

				// Cache miss - fetch from network
				console.log('[Rive SW] Fetching from network:', url.pathname);
				return fetch(request)
					.then((networkResponse) => {
						// Only cache successful responses
						if (!networkResponse || networkResponse.status !== 200) {
							return networkResponse;
						}

						// Clone response (can only be consumed once)
						const responseToCache = networkResponse.clone();

						// Cache for future requests
						caches.open(CACHE_NAME)
							.then((cache) => {
								console.log('[Rive SW] Caching:', url.pathname);
								cache.put(request, responseToCache);
							});

						return networkResponse;
					})
					.catch((error) => {
						console.error('[Rive SW] Fetch failed:', url.pathname, error);
						// Return offline page or error response if needed
						throw error;
					});
			})
	);
});

/**
 * Message Handler
 * Allows communication between page and Service Worker
 */
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		console.log('[Rive SW] Received SKIP_WAITING message');
		self.skipWaiting();
	}

	// Clear cache command (useful for debugging)
	if (event.data && event.data.type === 'CLEAR_CACHE') {
		console.log('[Rive SW] Clearing cache');
		event.waitUntil(
			caches.delete(CACHE_NAME)
				.then(() => {
					console.log('[Rive SW] Cache cleared');
					return self.clients.matchAll();
				})
				.then((clients) => {
					clients.forEach((client) => {
						client.postMessage({ type: 'CACHE_CLEARED' });
					});
				})
		);
	}
});
