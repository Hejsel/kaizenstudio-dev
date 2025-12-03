/**
 * Rive Block Service Worker
 *
 * Provides offline caching and performance optimization for Rive animations.
 * Uses Origin Private File System (OPFS) for WASM files (better I/O performance).
 * Uses Cache Storage for JavaScript and .riv files.
 *
 * @version 2.0.0
 */

const CACHE_VERSION = 'rive-block-v2';
const CACHE_NAME = `${CACHE_VERSION}-assets`;
const OPFS_DIRECTORY = 'rive-wasm-cache';

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
 * OPFS Helper: Get or create OPFS directory
 */
async function getOPFSDirectory() {
	const root = await navigator.storage.getDirectory();
	return await root.getDirectoryHandle(OPFS_DIRECTORY, { create: true });
}

/**
 * OPFS Helper: Save WASM file to OPFS
 * @param {string} filename - Name of the file
 * @param {Response} response - Fetch response containing file data
 */
async function saveToOPFS(filename, response) {
	try {
		const directory = await getOPFSDirectory();
		const fileHandle = await directory.getFileHandle(filename, { create: true });
		const writable = await fileHandle.createWritable();

		// Stream response body directly to OPFS (efficient for large files)
		await response.body.pipeTo(writable);

		console.log('[Rive SW OPFS] Saved to OPFS:', filename);
	} catch (error) {
		console.error('[Rive SW OPFS] Failed to save:', filename, error);
		throw error;
	}
}

/**
 * OPFS Helper: Load WASM file from OPFS
 * @param {string} filename - Name of the file
 * @returns {Response|null} Response object or null if not found
 */
async function loadFromOPFS(filename) {
	try {
		const directory = await getOPFSDirectory();
		const fileHandle = await directory.getFileHandle(filename, { create: false });
		const file = await fileHandle.getFile();

		console.log('[Rive SW OPFS] Loaded from OPFS:', filename, `(${file.size} bytes)`);

		// Return as Response object (compatible with fetch API)
		return new Response(file, {
			status: 200,
			headers: {
				'Content-Type': 'application/wasm',
				'Content-Length': file.size,
				'X-Rive-Source': 'opfs'
			}
		});
	} catch (error) {
		// File not found in OPFS
		console.log('[Rive SW OPFS] Not found in OPFS:', filename);
		return null;
	}
}

/**
 * OPFS Helper: Check if file exists in OPFS
 * @param {string} filename - Name of the file
 * @returns {boolean} True if file exists
 */
async function existsInOPFS(filename) {
	try {
		const directory = await getOPFSDirectory();
		await directory.getFileHandle(filename, { create: false });
		return true;
	} catch {
		return false;
	}
}

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
 * Strategy:
 * - WASM files: OPFS (better I/O performance for large binary files)
 * - .riv files: Cache Storage (HTTP Response caching)
 * - JS files: Cache Storage (standard caching)
 * - Other requests: Pass through to network
 */
self.addEventListener('fetch', (event) => {
	const { request } = event;
	const url = new URL(request.url);

	// Check if this is a WASM file
	const isWASM = url.pathname.includes('/rive-block/') && url.pathname.endsWith('.wasm');

	// Check if this is other Rive asset (.riv or view.js)
	const isOtherRiveAsset =
		url.pathname.includes('/rive-block/') && (
			url.pathname.endsWith('.riv') ||
			url.pathname.includes('/view.js')
		);

	if (!isWASM && !isOtherRiveAsset) {
		// Pass through all other requests
		return;
	}

	// WASM files: Use OPFS (better I/O performance)
	if (isWASM) {
		event.respondWith(handleWASMRequest(request, url));
	}
	// Other Rive assets: Use Cache Storage
	else {
		event.respondWith(handleCacheRequest(request, url));
	}
});

/**
 * Handle WASM requests using OPFS
 * OPFS provides ~3ms faster I/O than Cache Storage for large binary files
 */
async function handleWASMRequest(request, url) {
	const filename = url.pathname.split('/').pop();

	// Try OPFS first
	const opfsResponse = await loadFromOPFS(filename);
	if (opfsResponse) {
		return opfsResponse;
	}

	// OPFS miss - fetch from network
	console.log('[Rive SW] Fetching WASM from network:', filename);
	try {
		const networkResponse = await fetch(request);

		if (!networkResponse || networkResponse.status !== 200) {
			return networkResponse;
		}

		// Save to OPFS for future requests (don't await - save in background)
		saveToOPFS(filename, networkResponse.clone())
			.catch((error) => {
				console.error('[Rive SW] Failed to save WASM to OPFS:', error);
			});

		return networkResponse;
	} catch (error) {
		console.error('[Rive SW] WASM fetch failed:', filename, error);
		throw error;
	}
}

/**
 * Handle non-WASM Rive assets using Cache Storage
 * Standard caching for .riv files and JavaScript
 */
async function handleCacheRequest(request, url) {
	// Try cache first
	const cachedResponse = await caches.match(request);
	if (cachedResponse) {
		console.log('[Rive SW] Serving from cache:', url.pathname);
		return cachedResponse;
	}

	// Cache miss - fetch from network
	console.log('[Rive SW] Fetching from network:', url.pathname);
	try {
		const networkResponse = await fetch(request);

		if (!networkResponse || networkResponse.status !== 200) {
			return networkResponse;
		}

		// Clone and cache for future requests
		const responseToCache = networkResponse.clone();
		const cache = await caches.open(CACHE_NAME);
		await cache.put(request, responseToCache);
		console.log('[Rive SW] Cached:', url.pathname);

		return networkResponse;
	} catch (error) {
		console.error('[Rive SW] Fetch failed:', url.pathname, error);
		throw error;
	}
}

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
