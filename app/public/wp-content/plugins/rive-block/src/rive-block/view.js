/**
 * Frontend JavaScript for Rive Block
 *
 * Uses @rive-app/webgl2-advanced for full control over Rive runtime with WebGL2 support.
 * Implements shared renderer pattern for optimal performance with multiple blocks.
 * Supports vector feathering and advanced rendering features.
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';

// Rive runtime instance (singleton)
let riveRuntime = null;
let runtimeLoading = false;
let runtimeCallbacks = [];

// Track all Rive instances for proper cleanup
const riveInstances = new Map();

// In-memory cache for Rive files to avoid duplicate decoding
// Key: file URL, Value: decoded Rive file object
const riveFileCache = new Map();

/**
 * Load Rive runtime (singleton)
 */
async function loadRiveRuntime() {
	if (riveRuntime) {
		return riveRuntime;
	}

	if (runtimeLoading) {
		// Wait for existing load to complete
		return new Promise((resolve) => {
			runtimeCallbacks.push(resolve);
		});
	}

	runtimeLoading = true;

	try {
		// Get the plugin URL from the localized script data (provided by PHP)
		const pluginUrl = window.riveBlockData?.pluginUrl || '';
		// Remove trailing slash to prevent double slashes in URL
		const baseUrl = pluginUrl.replace(/\/$/, '');

		riveRuntime = await RiveWebGL2({
			locateFile: (file) => {
				// Serve WASM files from plugin's build directory
				return `${baseUrl}/build/rive-block/${file}`;
			}
		});

		// Resolve any waiting callbacks
		runtimeCallbacks.forEach(callback => callback(riveRuntime));
		runtimeCallbacks = [];

		return riveRuntime;
	} catch (error) {
		console.error('[Rive Block] Failed to load Rive runtime:', error);
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
 * @returns {Promise<object>} Decoded Rive file object
 */
async function loadRiveFile(rive, url) {
	// Check in-memory cache first
	if (riveFileCache.has(url)) {
		// Log cache hit in development
		if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
			console.log(`[Rive Block] Cache hit: ${url}`);
		}
		return riveFileCache.get(url);
	}

	// Cache miss - fetch and decode the file
	if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
		console.log(`[Rive Block] Cache miss, loading: ${url}`);
	}

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const fileBytes = new Uint8Array(arrayBuffer);

	// Decode Rive file
	const file = await rive.load(fileBytes);

	// Store in cache for future reuse
	riveFileCache.set(url, file);

	return file;
}

/**
 * Initialize all Rive animations on the page
 * Handles both eager loading (high priority) and lazy loading (low priority)
 */
async function initRiveAnimations() {
	// Find all Rive block canvas elements
	const canvases = document.querySelectorAll('canvas.wp-block-create-block-rive-block');

	if (canvases.length === 0) {
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
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Separate canvases by loading priority
		const highPriorityCanvases = [];
		const lowPriorityCanvases = [];

		canvases.forEach(canvas => {
			const priority = canvas.dataset.loadingPriority || 'low';
			if (priority === 'high') {
				highPriorityCanvases.push(canvas);
			} else {
				lowPriorityCanvases.push(canvas);
			}
		});

		// Initialize high priority animations immediately (eager loading)
		for (const canvas of highPriorityCanvases) {
			await initRiveInstance(rive, canvas, prefersReducedMotion);
		}

		// Setup Intersection Observer for low priority animations (lazy loading)
		if (lowPriorityCanvases.length > 0) {
			const observerOptions = {
				root: null, // viewport
				rootMargin: '50px', // Start loading 50px before entering viewport
				threshold: 0.01 // Trigger when at least 1% is visible
			};

			const observer = new IntersectionObserver((entries) => {
				entries.forEach(async (entry) => {
					if (entry.isIntersecting) {
						const canvas = entry.target;

						// Skip if already initialized
						if (riveInstances.has(canvas)) {
							return;
						}

						// Initialize Rive instance when canvas becomes visible
						await initRiveInstance(rive, canvas, prefersReducedMotion);

						// Stop observing this canvas
						observer.unobserve(canvas);
					}
				});
			}, observerOptions);

			// Observe low priority canvas elements
			lowPriorityCanvases.forEach(canvas => observer.observe(canvas));
		}

	} catch (error) {
		console.error('[Rive Block] Error initializing Rive animations:', error);
	}
}

/**
 * Set canvas internal resolution to match display size and device pixel ratio
 * This ensures crisp rendering and optimal GPU usage
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 */
function setCanvasDPIAwareSize(canvas) {
	// Get the display size of the canvas (CSS pixels)
	const rect = canvas.getBoundingClientRect();
	const displayWidth = rect.width;
	const displayHeight = rect.height;

	// Get device pixel ratio (typically 1, 1.5, 2, or 2.5)
	const dpr = window.devicePixelRatio || 1;

	// Set canvas internal resolution to match display size × DPI
	// This prevents blurry rendering and reduces GPU scaling overhead
	canvas.width = Math.round(displayWidth * dpr);
	canvas.height = Math.round(displayHeight * dpr);

	// Log in development
	if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
		console.log(`[Rive Block] Canvas DPI sizing: ${displayWidth}×${displayHeight} CSS → ${canvas.width}×${canvas.height} internal (DPR: ${dpr})`);
	}
}

/**
 * Initialize a single Rive instance
 */
async function initRiveInstance(rive, canvas, prefersReducedMotion) {
	const riveSrc = canvas.dataset.riveSrc;

	// Skip if no Rive source URL is provided
	if (!riveSrc) {
		console.warn('[Rive Block] Canvas missing data-rive-src attribute');
		return;
	}

	// Read accessibility settings from data attributes
	const enableAutoplay = canvas.dataset.enableAutoplay === 'true';
	const respectReducedMotion = canvas.dataset.respectReducedMotion !== 'false'; // Default to true

	// Determine if autoplay should be enabled based on settings and user preference
	const shouldAutoplay = enableAutoplay && !(respectReducedMotion && prefersReducedMotion);

	try {
		// Load Rive file (uses in-memory cache if available)
		const file = await loadRiveFile(rive, riveSrc);

		// Get default artboard
		const artboard = file.defaultArtboard();

		// Set canvas to DPI-aware size for crisp rendering and optimal GPU usage
		setCanvasDPIAwareSize(canvas);

		// Create renderer
		const renderer = rive.makeRenderer(canvas, true);

		// Try to create animation instance
		let animationInstance = null;
		if (artboard.animationCount() > 0) {
			const animation = artboard.animationByIndex(0);
			animationInstance = new rive.LinearAnimationInstance(animation, artboard);
		}

		// Setup ResizeObserver to handle canvas resizing (window resize, orientation change)
		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.target === canvas) {
					// Update canvas DPI-aware size
					setCanvasDPIAwareSize(canvas);
					// Renderer will automatically use new canvas size on next frame
				}
			}
		});
		resizeObserver.observe(canvas);

		// Store instance data
		const instanceData = {
			rive,
			file,
			artboard,
			renderer,
			animation: animationInstance,
			canvas,
			shouldAutoplay,
			animationFrameId: null,
			resizeObserver
		};

		riveInstances.set(canvas, instanceData);

		// Start render loop if autoplay is enabled
		if (shouldAutoplay && animationInstance) {
			startRenderLoop(instanceData);

			// Setup viewport observer to pause when not visible
			// This follows Rive's best practice: "Pause when scrolled out of view"
			setupViewportObserver(canvas, instanceData);
		} else {
			// Just render one frame
			renderFrame(instanceData);
		}

		// Log success in development
		if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
			console.log(`[Rive Block] Successfully loaded: ${riveSrc}`);
		}

	} catch (error) {
		console.error(`[Rive Block] Failed to load Rive file: ${riveSrc}`, error);
		showErrorMessage(canvas, 'Unable to load animation. Please refresh the page.');
	}
}

/**
 * Start the render loop for a single instance
 */
function startRenderLoop(instanceData) {
	const { rive, artboard, renderer, animation, canvas } = instanceData;
	let lastTime = 0;

	const draw = (time) => {
		// Check if instance still exists
		if (!riveInstances.has(canvas)) {
			return;
		}

		const elapsed = lastTime ? (time - lastTime) / 1000 : 0;
		lastTime = time;

		// Clear canvas
		renderer.clear();
		renderer.save();

		// Advance animation
		if (animation) {
			animation.advance(elapsed);
			animation.apply(1.0); // Full mix
		}

		// Advance artboard
		artboard.advance(elapsed);

		// Align to canvas
		renderer.align(
			rive.Fit.contain,
			rive.Alignment.center,
			{
				minX: 0,
				minY: 0,
				maxX: canvas.width,
				maxY: canvas.height
			},
			artboard.bounds
		);

		// Draw artboard
		artboard.draw(renderer);
		renderer.restore();

		// Flush renderer (required for WebGL2)
		renderer.flush();

		// Request next frame
		instanceData.animationFrameId = rive.requestAnimationFrame(draw);
	};

	instanceData.animationFrameId = rive.requestAnimationFrame(draw);
}

/**
 * Pause the render loop for a single instance
 * Used when animation is not in viewport to save GPU resources
 */
function pauseRenderLoop(instanceData) {
	if (!instanceData) {
		return;
	}

	const { rive, animationFrameId } = instanceData;

	// Cancel animation frame if running
	if (animationFrameId) {
		rive.cancelAnimationFrame(animationFrameId);
		instanceData.animationFrameId = null;
	}
}

/**
 * Resume the render loop for a single instance
 * Called when animation enters viewport
 */
function resumeRenderLoop(instanceData) {
	if (!instanceData || instanceData.animationFrameId) {
		return; // Already running
	}

	// Only resume if autoplay is enabled
	if (instanceData.shouldAutoplay) {
		startRenderLoop(instanceData);
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
function setupViewportObserver(canvas, instanceData) {
	const observerOptions = {
		root: null, // viewport
		rootMargin: '0px', // Trigger exactly at viewport edge
		threshold: 0.01 // At least 1% visible to be considered "in viewport"
	};

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				// Animation entered viewport - resume rendering
				if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
					console.log(`[Rive Block] Resuming animation (entered viewport): ${canvas.dataset.riveSrc}`);
				}
				resumeRenderLoop(instanceData);
			} else {
				// Animation left viewport - pause rendering to save GPU
				if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
					console.log(`[Rive Block] Pausing animation (left viewport): ${canvas.dataset.riveSrc}`);
				}
				pauseRenderLoop(instanceData);
			}
		});
	}, observerOptions);

	// Start observing the canvas
	observer.observe(canvas);

	// Store observer reference for cleanup
	instanceData.viewportObserver = observer;
}

/**
 * Render a single frame (for static display)
 */
function renderFrame(instanceData) {
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
			maxY: canvas.height
		},
		artboard.bounds
	);

	// Draw artboard
	artboard.draw(renderer);
	renderer.restore();

	// Flush renderer (required for WebGL2)
	renderer.flush();
}

/**
 * Display user-friendly error message when Rive fails to load
 */
function showErrorMessage(canvas, message) {
	// Create error message container
	const errorDiv = document.createElement('div');
	errorDiv.className = 'rive-block-error';
	errorDiv.style.cssText = `
		display: flex;
		align-items: center;
		justify-content: center;
		width: ${canvas.style.width || '100%'};
		height: ${canvas.style.height || 'auto'};
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
	if (canvas.parentNode) {
		canvas.parentNode.replaceChild(errorDiv, canvas);
	}
}

/**
 * Cleanup all Rive instances when page is unloaded
 */
function cleanupRiveInstances() {
	riveInstances.forEach((instanceData, canvas) => {
		try {
			const { rive, animation, renderer, artboard, animationFrameId, viewportObserver, resizeObserver } = instanceData;

			// Cancel animation frame
			if (animationFrameId) {
				rive.cancelAnimationFrame(animationFrameId);
			}

			// Disconnect viewport observer
			if (viewportObserver) {
				viewportObserver.disconnect();
			}

			// Disconnect resize observer
			if (resizeObserver) {
				resizeObserver.disconnect();
			}

			// Delete instances
			if (animation) {
				animation.delete();
			}
			if (renderer) {
				renderer.delete();
			}
			if (artboard) {
				artboard.delete();
			}

			// NOTE: We don't unref files here because they're stored in riveFileCache
			// and may be reused by other instances. Files are unreffed during cache cleanup.
		} catch (error) {
			console.warn('[Rive Block] Error cleaning up instance:', error);
		}
	});

	riveInstances.clear();

	// Cleanup cached files
	riveFileCache.forEach((file, url) => {
		try {
			file.unref();
		} catch (error) {
			console.warn(`[Rive Block] Error unreffing cached file ${url}:`, error);
		}
	});

	riveFileCache.clear();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initRiveAnimations);
} else {
	initRiveAnimations();
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', cleanupRiveInstances);
