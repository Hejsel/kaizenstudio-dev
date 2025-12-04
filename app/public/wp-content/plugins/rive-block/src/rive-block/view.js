/**
 * Frontend JavaScript for Rive Block
 *
 * Uses @rive-app/webgl2-advanced for full control over Rive runtime with WebGL2 support.
 * Implements shared renderer pattern for optimal performance with multiple blocks.
 * Supports vector feathering and advanced rendering features.
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';

/**
 * Register Service Worker for caching and offline support
 * Provides ~30% faster loads after first visit via Cache Storage API
 *
 * Service Worker is at plugin root for broader scope - can cache:
 * - Plugin assets (/wp-content/plugins/rive-block/)
 * - Media Library .riv files (/wp-content/uploads/)
 */
if ( 'serviceWorker' in navigator ) {
	// Get plugin URL from localized data
	const pluginUrl = window.riveBlockData?.pluginUrl || '';
	const swUrl = `${ pluginUrl }rive-sw.js`;

	window.addEventListener( 'load', () => {
		navigator.serviceWorker
			.register( swUrl, { scope: '/wp-content/plugins/rive-block/' } )
			.then( ( registration ) => {
				if ( window.riveBlockData?.debug ) {
					console.log( '[Rive Block] Service Worker registered:', registration.scope );
				}

				// Listen for updates
				registration.addEventListener( 'updatefound', () => {
					const newWorker = registration.installing;
					if ( window.riveBlockData?.debug ) {
						console.log( '[Rive Block] Service Worker update found' );
					}

					newWorker.addEventListener( 'statechange', () => {
						if ( newWorker.state === 'activated' && window.riveBlockData?.debug ) {
							console.log( '[Rive Block] Service Worker activated' );
						}
					} );
				} );
			} )
			.catch( ( error ) => {
				// SW registration failure is non-critical - page still works
				if ( window.riveBlockData?.debug ) {
					console.log( '[Rive Block] Service Worker registration failed:', error );
				}
			} );
	} );
}

/**
 * IndexedDB Helper: Open or create database for WASM bytes caching
 * Stores raw WASM bytes (ArrayBuffer) to skip network download
 * Note: WebAssembly.Module cannot be stored due to browser security restrictions
 */
const DB_NAME = 'rive-block-wasm-cache';
const DB_VERSION = 2;
const STORE_NAME = 'wasm-bytes';

async function openWASMDatabase() {
	return new Promise( ( resolve, reject ) => {
		const request = indexedDB.open( DB_NAME, DB_VERSION );

		request.onerror = () => reject( request.error );
		request.onsuccess = () => resolve( request.result );

		request.onupgradeneeded = ( event ) => {
			const db = event.target.result;

			// Delete old store from v1 (if exists)
			if ( db.objectStoreNames.contains( 'compiled-modules' ) ) {
				db.deleteObjectStore( 'compiled-modules' );
			}

			// Create new store for v2
			if ( ! db.objectStoreNames.contains( STORE_NAME ) ) {
				// Create object store with filename as key
				db.createObjectStore( STORE_NAME, { keyPath: 'filename' } );
				if ( window.riveBlockData?.debug ) {
					console.log( '[Rive Block IDB] Database upgraded to v2 (raw bytes storage)' );
				}
			}
		};
	} );
}

/**
 * IndexedDB Helper: Save WASM bytes
 * @param {string} filename - WASM filename (e.g., 'webgl2_advanced.wasm')
 * @param {ArrayBuffer} wasmBytes - Raw WASM bytes
 */
async function saveWASMBytes( filename, wasmBytes ) {
	if ( window.riveBlockData?.debug ) {
		console.log( `[Rive Block IDB] Starting save: ${ filename }` );
	}

	try {
		const db = await openWASMDatabase();
		const transaction = db.transaction( [ STORE_NAME ], 'readwrite' );
		const store = transaction.objectStore( STORE_NAME );

		const data = {
			filename,
			bytes: wasmBytes, // ArrayBuffer is structured-cloneable
			timestamp: Date.now(),
		};

		// Wait for the put operation to complete
		const request = store.put( data );

		await new Promise( ( resolve, reject ) => {
			request.onsuccess = () => {
				// Request succeeded, now wait for transaction to commit
			};
			request.onerror = () => reject( request.error );

			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject( transaction.error );
		} );

		if ( window.riveBlockData?.debug ) {
			const sizeKB = Math.round( wasmBytes.byteLength / 1024 );
			console.log( `[Rive Block IDB] Saved WASM bytes: ${ filename } (${ sizeKB } KB)` );
		}

		db.close();
	} catch ( error ) {
		console.error( '[Rive Block IDB] Failed to save WASM bytes:', error );
	}
}

/**
 * IndexedDB Helper: Load WASM bytes
 * @param {string} filename - WASM filename
 * @returns {ArrayBuffer|null} Raw WASM bytes or null if not cached
 */
async function loadWASMBytes( filename ) {
	try {
		const db = await openWASMDatabase();
		const transaction = db.transaction( [ STORE_NAME ], 'readonly' );
		const store = transaction.objectStore( STORE_NAME );

		const data = await new Promise( ( resolve, reject ) => {
			const request = store.get( filename );
			request.onsuccess = () => resolve( request.result );
			request.onerror = () => reject( request.error );
		} );

		db.close();

		if ( data && data.bytes ) {
			if ( window.riveBlockData?.debug ) {
				const age = Math.round( ( Date.now() - data.timestamp ) / 1000 );
				const sizeKB = Math.round( data.bytes.byteLength / 1024 );
				console.log( `[Rive Block IDB] Loaded WASM bytes: ${ filename } (${ sizeKB } KB, cached ${ age }s ago)` );
			}
			return data.bytes;
		}

		if ( window.riveBlockData?.debug ) {
			console.log( '[Rive Block IDB] WASM bytes not found in cache:', filename );
		}
		return null;
	} catch ( error ) {
		console.error( '[Rive Block IDB] Failed to load WASM bytes:', error );
		return null;
	}
}

// Rive runtime instance (singleton)
let riveRuntime = null;
let runtimeLoading = false;
let runtimeCallbacks = [];

// Track all Rive instances for proper cleanup
const riveInstances = new Map();

// In-memory cache for Rive files to avoid duplicate decoding
// Key: file URL, Value: decoded Rive file object
const riveFileCache = new Map();

// Track which URLs have been loaded at least once (for cache optimization)
const riveFileLoadedOnce = new Set();

// Track current page URL to detect actual navigation (not just reloads)
let currentPageUrl = window.location.href;

/**
 * Load Rive runtime (singleton)
 * Uses IndexedDB to cache compiled WASM modules for ~85ms faster initialization
 */
async function loadRiveRuntime() {
	if ( riveRuntime ) {
		return riveRuntime;
	}

	if ( runtimeLoading ) {
		// Wait for existing load to complete
		return new Promise( ( resolve ) => {
			runtimeCallbacks.push( resolve );
		} );
	}

	runtimeLoading = true;

	try {
		// Get the plugin URL from the localized script data (provided by PHP)
		const pluginUrl = window.riveBlockData?.pluginUrl || '';
		// Remove trailing slash to prevent double slashes in URL
		const baseUrl = pluginUrl.replace( /\/$/, '' );
		const wasmFilename = 'webgl2_advanced.wasm';
		const wasmUrl = `${ baseUrl }/build/rive-block/${ wasmFilename }`;

		// Try to load WASM bytes from IndexedDB
		const cachedBytes = await loadWASMBytes( wasmFilename );

		const startTime = performance.now();

		riveRuntime = await RiveWebGL2( {
			locateFile: ( file ) => {
				// Serve WASM files from plugin's build directory
				return `${ baseUrl }/build/rive-block/${ file }`;
			},
			// Custom WASM instantiation for IndexedDB caching
			instantiateWasm: async ( imports, successCallback ) => {
				try {
					let instance;
					let module;

					if ( cachedBytes ) {
						// IDB Cache hit: Compile from cached bytes + instantiate
						if ( window.riveBlockData?.debug ) {
							console.log( '[Rive Block IDB] Compiling from cached WASM bytes' );
						}
						module = await WebAssembly.compile( cachedBytes );
						instance = await WebAssembly.instantiate( module, imports );
					} else {
						// IDB Cache miss: Fetch + compile + instantiate + cache bytes
						if ( window.riveBlockData?.debug ) {
							console.log( '[Rive Block IDB] Fetching and compiling WASM (first load)' );
						}

						const response = await fetch( wasmUrl );
						const wasmBytes = await response.arrayBuffer();

						// Compile and instantiate
						module = await WebAssembly.compile( wasmBytes );
						instance = await WebAssembly.instantiate( module, imports );

						// Save WASM bytes to IndexedDB for next load (await to ensure transaction completes)
						await saveWASMBytes( wasmFilename, wasmBytes );
					}

					successCallback( instance, module );
					return instance.exports;
				} catch ( error ) {
					console.error( '[Rive Block IDB] WASM instantiation failed:', error );
					throw error;
				}
			},
		} );

		const loadTime = Math.round( performance.now() - startTime );

		// Debug logging when WP_DEBUG is active
		if ( window.riveBlockData?.debug ) {
			console.log( `[Rive Block] Rive runtime loaded in ${ loadTime }ms` );
			console.log( '[Rive Block] Renderer: WebGL2-Advanced' );
			console.log( '[Rive Block] WASM caching: IndexedDB (raw bytes)' );
		}

		// Resolve any waiting callbacks
		runtimeCallbacks.forEach( ( callback ) => callback( riveRuntime ) );
		runtimeCallbacks = [];

		return riveRuntime;
	} catch ( error ) {
		console.error( '[Rive Block] Failed to load Rive runtime:', error );
		runtimeLoading = false;
		throw error;
	}
}

/**
 * Load and cache a Rive file
 * Uses in-memory cache to avoid duplicate fetching and decoding of the same file
 *
 * @param {object} rive - Rive runtime instance
 * @param {string} url - URL to the .riv file
 * @param {string} priority - Loading priority ('high' or 'low')
 * @returns {Promise<object>} Decoded Rive file object
 */
async function loadRiveFile( rive, url, priority = 'low' ) {
	// Check in-memory cache first
	if ( riveFileCache.has( url ) ) {
		// Log cache hit in development
		if (
			window.location.hostname === 'localhost' ||
			window.location.hostname.includes( 'local' )
		) {
			console.log( `[Rive Block] Cache hit: ${ url }` );
		}
		return riveFileCache.get( url );
	}

	// In-memory cache miss - will fetch (but may use HTTP browser cache)
	const isFirstLoad = ! riveFileLoadedOnce.has( url );

	if (
		window.location.hostname === 'localhost' ||
		window.location.hostname.includes( 'local' )
	) {
		console.log( `[Rive Block] In-memory cache miss, fetching: ${ url }` );
		console.log(
			`[Rive Block] Note: Browser HTTP cache may serve this without network transfer`
		);
	}

	// Choose cache mode based on loading priority AND whether file has been loaded before:
	// - First time loading URL: 'default' (respect HTTP cache, may download)
	// - Subsequent loads: 'force-cache' (use browser HTTP cache aggressively)
	// This ensures browser cache is used after first load, maximizing performance
	let cacheMode;
	if ( isFirstLoad ) {
		cacheMode = 'default';
	} else {
		cacheMode = 'force-cache';
	}

	const response = await fetch( url, { cache: cacheMode } );
	if ( ! response.ok ) {
		throw new Error( `Failed to fetch: ${ response.statusText }` );
	}

	// Check if HTTP cache was used by examining response timing
	// Note: DevTools may show "200" but Performance API reveals if bytes were transferred
	if (
		window.location.hostname === 'localhost' ||
		window.location.hostname.includes( 'local' )
	) {
		// Use Performance API to check if cached (transferSize = 0 means cached)
		const perfEntries = performance.getEntriesByName( url, 'resource' );
		const latestEntry = perfEntries[ perfEntries.length - 1 ];
		if ( latestEntry && latestEntry.transferSize === 0 ) {
			console.log(
				`[Rive Block] ✓ HTTP cache hit (0 bytes transferred): ${ url }`
			);
		} else if ( latestEntry ) {
			console.log(
				`[Rive Block] ↓ Downloaded ${ latestEntry.transferSize } bytes: ${ url }`
			);
		}
	}

	const arrayBuffer = await response.arrayBuffer();
	const fileBytes = new Uint8Array( arrayBuffer );

	// Decode Rive file
	const file = await rive.load( fileBytes );

	// Store in cache for future reuse
	riveFileCache.set( url, file );

	// Mark this URL as loaded once for future cache optimization
	riveFileLoadedOnce.add( url );

	return file;
}

/**
 * Initialize all Rive animations on the page
 * Handles both eager loading (high priority) and lazy loading (low priority)
 */
async function initRiveAnimations() {
	// CRITICAL: Only cleanup if we navigated to a different page (not just a reload)
	// This preserves in-memory cache for same-page reloads while still handling SPA navigation
	const newPageUrl = window.location.href;
	if ( newPageUrl !== currentPageUrl ) {
		cleanupRiveInstances();
		currentPageUrl = newPageUrl;
	}

	// Find all Rive block canvas elements
	const canvases = document.querySelectorAll(
		'canvas.wp-block-create-block-rive-block'
	);

	if ( canvases.length === 0 ) {
		return;
	}

	try {
		// Load Rive runtime once for all instances
		const rive = await loadRiveRuntime();

		/**
		 * Check user's motion preference once for all instances
		 *
		 * @see https://www.w3.org/WAI/WCAG21/Techniques/client-side-script/SCR40
		 */
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;

		// Separate canvases by loading priority
		const highPriorityCanvases = [];
		const lowPriorityCanvases = [];

		canvases.forEach( ( canvas ) => {
			const priority = canvas.dataset.loadingPriority || 'low';
			if ( priority === 'high' ) {
				highPriorityCanvases.push( canvas );
			} else {
				lowPriorityCanvases.push( canvas );
			}
		} );

		// Initialize high priority animations immediately (eager loading)
		for ( const canvas of highPriorityCanvases ) {
			await initRiveInstance( rive, canvas, prefersReducedMotion );
		}

		// Setup Intersection Observer for low priority animations (lazy loading)
		if ( lowPriorityCanvases.length > 0 ) {
			const observerOptions = {
				root: null, // viewport
				rootMargin: '50px', // Start loading 50px before entering viewport
				threshold: 0.01, // Trigger when at least 1% is visible
			};

			const observer = new IntersectionObserver( ( entries ) => {
				entries.forEach( async ( entry ) => {
					if ( entry.isIntersecting ) {
						const canvas = entry.target;

						// Skip if already initialized
						if ( riveInstances.has( canvas ) ) {
							return;
						}

						// Initialize Rive instance when canvas becomes visible
						await initRiveInstance(
							rive,
							canvas,
							prefersReducedMotion
						);

						// Stop observing this canvas
						observer.unobserve( canvas );
					}
				} );
			}, observerOptions );

			// Observe low priority canvas elements
			lowPriorityCanvases.forEach( ( canvas ) =>
				observer.observe( canvas )
			);
		}
	} catch ( error ) {
		console.error(
			'[Rive Block] Error initializing Rive animations:',
			error
		);
	}
}

/**
 * Set canvas internal resolution to match display size and device pixel ratio
 * This ensures crisp rendering and optimal GPU usage
 *
 * PERFORMANCE: Only resizes if size actually changed to avoid expensive canvas resets
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @returns {boolean} True if canvas was resized, false if no change
 */
function setCanvasDPIAwareSize( canvas ) {
	// Get the display size of the canvas (CSS pixels)
	const rect = canvas.getBoundingClientRect();
	const displayWidth = rect.width;
	const displayHeight = rect.height;

	// Use full device pixel ratio for crisp rendering
	const dpr = window.devicePixelRatio || 1;

	// Calculate target internal resolution
	const targetWidth = Math.round( displayWidth * dpr );
	const targetHeight = Math.round( displayHeight * dpr );

	// CRITICAL: Only resize if dimensions actually changed
	// Setting canvas.width/height clears the canvas and triggers expensive reflow
	if ( canvas.width === targetWidth && canvas.height === targetHeight ) {
		return false; // No resize needed
	}

	// Set canvas internal resolution to match display size × DPI
	// This prevents blurry rendering and reduces GPU scaling overhead
	canvas.width = targetWidth;
	canvas.height = targetHeight;

	// Log in development
	if (
		window.location.hostname === 'localhost' ||
		window.location.hostname.includes( 'local' )
	) {
		console.log(
			`[Rive Block] Canvas DPI sizing: ${ displayWidth }×${ displayHeight } CSS → ${ canvas.width }×${ canvas.height } internal (DPR: ${ dpr })`
		);
	}

	return true; // Canvas was resized
}

/**
 * Initialize a single Rive instance
 */
async function initRiveInstance( rive, canvas, prefersReducedMotion ) {
	const riveSrc = canvas.dataset.riveSrc;

	// Skip if no Rive source URL is provided
	if ( ! riveSrc ) {
		console.warn( '[Rive Block] Canvas missing data-rive-src attribute' );
		return;
	}

	// Read accessibility settings from data attributes
	const enableAutoplay = canvas.dataset.enableAutoplay === 'true';
	const respectReducedMotion =
		canvas.dataset.respectReducedMotion !== 'false'; // Default to true
	const loadingPriority = canvas.dataset.loadingPriority || 'low';

	// Determine if autoplay should be enabled based on settings and user preference
	const shouldAutoplay =
		enableAutoplay && ! ( respectReducedMotion && prefersReducedMotion );

	try {
		// Load Rive file (uses in-memory cache if available)
		// Pass loadingPriority to optimize HTTP cache behavior
		const file = await loadRiveFile( rive, riveSrc, loadingPriority );

		// Get default artboard
		const artboard = file.defaultArtboard();

		// Set canvas to DPI-aware size for crisp rendering and optimal GPU usage
		setCanvasDPIAwareSize( canvas );

		// Create renderer
		const renderer = rive.makeRenderer( canvas, true );

		// Debug logging when WP_DEBUG is active
		if ( window.riveBlockData?.debug ) {
			console.log( '[Rive Block] Renderer created for:', riveSrc );
			console.log( '[Rive Block] Artboard:', artboard.name );
			console.log(
				'[Rive Block] Canvas size:',
				`${ canvas.width }×${ canvas.height }`
			);
			console.log(
				'[Rive Block] Animations available:',
				artboard.animationCount()
			);
			console.log( '[Rive Block] Autoplay:', shouldAutoplay );
		}

		// Try to create animation instance
		let animationInstance = null;
		let animationFPS = 60; // Default fallback
		if ( artboard.animationCount() > 0 ) {
			const animation = artboard.animationByIndex( 0 );
			animationInstance = new rive.LinearAnimationInstance(
				animation,
				artboard
			);

			// Get animation's native FPS from .riv file
			animationFPS = animation.fps || 60;

			// Debug log animation FPS
			if ( window.riveBlockData?.debug ) {
				console.log( '[Rive Block] Animation FPS (from .riv):', animationFPS );
			}
		}

		// Store instance data (before ResizeObserver so it can reference instanceData)
		const instanceData = {
			rive,
			file,
			artboard,
			renderer,
			animation: animationInstance,
			animationFPS, // Store native FPS from .riv file
			canvas,
			shouldAutoplay,
			animationFrameId: null,
			resizeObserver: null, // Will be set below
		};

		riveInstances.set( canvas, instanceData );

		// Setup ResizeObserver to handle canvas resizing (window resize, orientation change)
		// PERFORMANCE: Debounce to prevent excessive resize operations during scroll
		let resizeTimeout = null;
		const resizeObserver = new ResizeObserver( ( entries ) => {
			// Clear any pending resize
			if ( resizeTimeout ) {
				clearTimeout( resizeTimeout );
			}

			// Debounce resize operations to avoid layout thrashing during scroll
			resizeTimeout = setTimeout( () => {
				for ( const entry of entries ) {
					if ( entry.target === canvas ) {
						// Update canvas DPI-aware size (only if actually changed)
						const didResize = setCanvasDPIAwareSize( canvas );

						// If canvas was resized, re-render current frame
						if ( didResize && ! instanceData.shouldAutoplay ) {
							renderFrame( instanceData );
						}
						// Renderer will automatically use new canvas size on next frame for autoplay
					}
				}
			}, 150 ); // 150ms debounce - balances responsiveness vs performance
		} );
		resizeObserver.observe( canvas );

		// Store ResizeObserver reference for cleanup
		instanceData.resizeObserver = resizeObserver;

		// Start render loop if autoplay is enabled
		if ( shouldAutoplay && animationInstance ) {
			startRenderLoop( instanceData );

			// Setup viewport observer to pause when not visible
			// This follows Rive's best practice: "Pause when scrolled out of view"
			setupViewportObserver( canvas, instanceData );
		} else {
			// Just render one frame
			renderFrame( instanceData );
		}

		// Log success in development
		if (
			window.location.hostname === 'localhost' ||
			window.location.hostname.includes( 'local' )
		) {
			console.log( `[Rive Block] Successfully loaded: ${ riveSrc }` );
		}
	} catch ( error ) {
		console.error(
			`[Rive Block] Failed to load Rive file: ${ riveSrc }`,
			error
		);
		showErrorMessage(
			canvas,
			'Unable to load animation. Please refresh the page.'
		);
	}
}

/**
 * Start the render loop for a single instance
 * Respects animation's native FPS from .riv file to avoid wasted GPU cycles
 */
function startRenderLoop( instanceData ) {
	const { rive, artboard, renderer, animation, canvas, animationFPS } = instanceData;
	let lastTime = 0;
	let lastRenderTime = 0;

	// Use animation's native FPS from .riv file (set in Rive Editor)
	// This prevents wasted GPU cycles from rendering identical frames
	const targetFPS = animationFPS || 60; // Fallback to 60 if not available
	const frameInterval = 1000 / targetFPS; // ms between frames

	// Debug log target FPS
	if ( window.riveBlockData?.debug ) {
		console.log( `[Rive Block] Render loop FPS: ${ targetFPS } (matching animation FPS)` );
	}

	const draw = ( time ) => {
		// Check if instance still exists
		if ( ! riveInstances.has( canvas ) ) {
			return;
		}

		// Frame rate limiting for large canvas to reduce GPU load
		if ( time - lastRenderTime < frameInterval ) {
			// Skip this frame to maintain target FPS
			instanceData.animationFrameId = rive.requestAnimationFrame( draw );
			return;
		}

		lastRenderTime = time;
		const elapsed = lastTime ? ( time - lastTime ) / 1000 : 0;
		lastTime = time;

		// Clear canvas
		renderer.clear();
		renderer.save();

		// Advance animation
		if ( animation ) {
			animation.advance( elapsed );
			animation.apply( 1.0 ); // Full mix
		}

		// Advance artboard
		artboard.advance( elapsed );

		// Align to canvas
		renderer.align(
			rive.Fit.contain,
			rive.Alignment.center,
			{
				minX: 0,
				minY: 0,
				maxX: canvas.width,
				maxY: canvas.height,
			},
			artboard.bounds
		);

		// Draw artboard
		artboard.draw( renderer );
		renderer.restore();

		// Flush renderer (required for WebGL2)
		renderer.flush();

		// Request next frame
		instanceData.animationFrameId = rive.requestAnimationFrame( draw );
	};

	instanceData.animationFrameId = rive.requestAnimationFrame( draw );
}

/**
 * Pause the render loop for a single instance
 * Used when animation is not in viewport to save GPU resources
 */
function pauseRenderLoop( instanceData ) {
	if ( ! instanceData ) {
		return;
	}

	const { rive, animationFrameId } = instanceData;

	// Cancel animation frame if running
	if ( animationFrameId ) {
		rive.cancelAnimationFrame( animationFrameId );
		instanceData.animationFrameId = null;
	}
}

/**
 * Resume the render loop for a single instance
 * Called when animation enters viewport
 */
function resumeRenderLoop( instanceData ) {
	if ( ! instanceData || instanceData.animationFrameId ) {
		return; // Already running
	}

	// Only resume if autoplay is enabled
	if ( instanceData.shouldAutoplay ) {
		startRenderLoop( instanceData );
	}
}

/**
 * Setup Intersection Observer to pause/resume animation based on viewport visibility
 * Implements Rive's best practice: "Pause when scrolled out of view; resume when needed"
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to observe
 * @param {object} instanceData - Rive instance data
 * @see https://rive.app/docs/getting-started/best-practices#runtime-considerations
 */
function setupViewportObserver( canvas, instanceData ) {
	const observerOptions = {
		root: null, // viewport
		rootMargin: '0px', // Trigger exactly at viewport edge
		threshold: 0.3, // At least 30% visible to keep animation running (AGGRESSIVE: minimizes GPU load)
	};

	const observer = new IntersectionObserver( ( entries ) => {
		entries.forEach( ( entry ) => {
			if ( entry.isIntersecting ) {
				// Animation entered viewport - resume rendering
				if (
					window.location.hostname === 'localhost' ||
					window.location.hostname.includes( 'local' )
				) {
					console.log(
						`[Rive Block] Resuming animation (entered viewport): ${ canvas.dataset.riveSrc }`
					);
				}
				resumeRenderLoop( instanceData );
			} else {
				// Animation left viewport - pause rendering to save GPU
				if (
					window.location.hostname === 'localhost' ||
					window.location.hostname.includes( 'local' )
				) {
					console.log(
						`[Rive Block] Pausing animation (left viewport): ${ canvas.dataset.riveSrc }`
					);
				}
				pauseRenderLoop( instanceData );
			}
		} );
	}, observerOptions );

	// Start observing the canvas
	observer.observe( canvas );

	// Store observer reference for cleanup
	instanceData.viewportObserver = observer;
}

/**
 * Render a single frame (for static display)
 */
function renderFrame( instanceData ) {
	const { rive, artboard, renderer, canvas } = instanceData;

	renderer.clear();
	renderer.save();

	// Align to canvas
	renderer.align(
		rive.Fit.contain,
		rive.Alignment.center,
		{
			minX: 0,
			minY: 0,
			maxX: canvas.width,
			maxY: canvas.height,
		},
		artboard.bounds
	);

	// Draw artboard
	artboard.draw( renderer );
	renderer.restore();

	// Flush renderer (required for WebGL2)
	renderer.flush();
}

/**
 * Display user-friendly error message when Rive fails to load
 */
function showErrorMessage( canvas, message ) {
	// Create error message container
	const errorDiv = document.createElement( 'div' );
	errorDiv.className = 'rive-block-error';
	errorDiv.style.cssText = `
		display: flex;
		align-items: center;
		justify-content: center;
		width: ${ canvas.style.width || '100%' };
		height: ${ canvas.style.height || 'auto' };
		background-color: #f0f0f0;
		color: #666;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 14px;
		padding: 20px;
		text-align: center;
		border: 1px solid #ddd;
		border-radius: 4px;
	`;
	errorDiv.textContent = message;

	// Replace canvas with error message
	if ( canvas.parentNode ) {
		canvas.parentNode.replaceChild( errorDiv, canvas );
	}
}

/**
 * Cleanup all Rive instances when page is unloaded
 *
 * IMPORTANT: We MUST unref files and clear the cache to prevent Rive WASM
 * reference counting issues. When we delete artboards, the underlying files
 * get unrefed in WASM. If we keep stale file references in the cache, they
 * become invalid and cause animations to fail on subsequent pages.
 *
 * The in-memory cache only works for multiple instances on THE SAME PAGE.
 * For cross-page caching, use HTTP cache headers (see README.md).
 */
function cleanupRiveInstances() {
	riveInstances.forEach( ( instanceData, canvas ) => {
		try {
			const {
				rive,
				animation,
				renderer,
				artboard,
				animationFrameId,
				viewportObserver,
				resizeObserver,
			} = instanceData;

			// Cancel animation frame
			if ( animationFrameId ) {
				rive.cancelAnimationFrame( animationFrameId );
			}

			// Disconnect viewport observer
			if ( viewportObserver ) {
				viewportObserver.disconnect();
			}

			// Disconnect resize observer
			if ( resizeObserver ) {
				resizeObserver.disconnect();
			}

			// Delete instances
			if ( animation ) {
				animation.delete();
			}
			if ( renderer ) {
				renderer.delete();
			}
			if ( artboard ) {
				artboard.delete();
			}

			// NOTE: We don't explicitly unref files here because deleting artboards
			// already unrefs them in WASM. But we MUST clear the cache below.
		} catch ( error ) {
			console.warn( '[Rive Block] Error cleaning up instance:', error );
		}
	} );

	riveInstances.clear();

	// Clear the file cache to prevent stale WASM references
	// After artboards are deleted, cached file references become invalid
	riveFileCache.forEach( ( file, url ) => {
		try {
			// Explicitly unref to be safe (may already be unrefed by artboard.delete)
			file.unref();
		} catch ( error ) {
			// Ignore errors if already unrefed
			console.warn(
				`[Rive Block] Error unreffing cached file ${ url }:`,
				error
			);
		}
	} );

	riveFileCache.clear();
}

// Initialize when DOM is ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initRiveAnimations );
} else {
	initRiveAnimations();
}

// Re-initialize when page is restored from bfcache (back/forward cache)
// This handles browser back/forward button navigation where DOMContentLoaded doesn't fire
window.addEventListener( 'pageshow', ( event ) => {
	if ( event.persisted ) {
		// Page was restored from bfcache
		if (
			window.location.hostname === 'localhost' ||
			window.location.hostname.includes( 'local' )
		) {
			console.log(
				'[Rive Block] Page restored from bfcache, re-initializing animations'
			);
		}
		initRiveAnimations();
	}
} );

// NOTE: We do NOT cleanup on pagehide/beforeunload anymore!
// Reason: These events fire on normal page reloads (Ctrl+R), which would
// clear the in-memory cache that we want to preserve.
//
// Instead, cleanup happens conditionally in initRiveAnimations():
// - Navigation to different page: cleanup + clear cache
// - Same page reload: preserve cache for instant loading
//
// This achieves the best of both worlds:
// 1. In-memory cache works for same-page reloads
// 2. No stale WASM references when navigating to different pages
