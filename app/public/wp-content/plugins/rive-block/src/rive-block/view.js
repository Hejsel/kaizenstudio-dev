/**
 * Frontend JavaScript for Rive Block
 *
 * Uses @rive-app/webgl2-advanced for Rive Renderer support (enables vector feathering).
 * Implements shared renderer pattern for optimal performance with multiple blocks.
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';

// Rive runtime instance (singleton)
let riveRuntime = null;
let runtimeLoading = false;
let runtimeCallbacks = [];

// Track all Rive instances for proper cleanup
const riveInstances = new Map();

/**
 * Check if WebGL2 is supported in the browser
 */
function isWebGL2Supported() {
	const canvas = document.createElement('canvas');
	const gl = canvas.getContext('webgl2');
	return !!gl;
}

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
		riveRuntime = await RiveWebGL2({
			locateFile: () => 'https://unpkg.com/@rive-app/webgl2-advanced@2.32.1/rive.wasm'
		});

		// Resolve any waiting callbacks
		runtimeCallbacks.forEach(callback => callback(riveRuntime));
		runtimeCallbacks = [];

		return riveRuntime;
	} catch (error) {
		console.error('[Rive Block] Failed to load Rive runtime (WebGL2):', error);
		runtimeLoading = false;
		throw error;
	}
}

/**
 * Initialize all Rive animations on the page
 */
async function initRiveAnimations() {
	// Check WebGL2 support
	if (!isWebGL2Supported()) {
		console.warn('[Rive Block] WebGL2 is not supported in this browser. Rive animations will not be displayed.');

		// Find all Rive blocks and show fallback message
		const canvases = document.querySelectorAll('canvas.wp-block-create-block-rive-block');
		canvases.forEach(canvas => {
			showErrorMessage(
				canvas,
				'Your browser does not support WebGL2. Please update to a modern browser to view this animation.'
			);
		});
		return;
	}

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

		// Initialize each canvas
		for (const canvas of canvases) {
			await initRiveInstance(rive, canvas, prefersReducedMotion);
		}

	} catch (error) {
		console.error('[Rive Block] Error initializing Rive animations:', error);
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
	const heightAttr = canvas.dataset.height || 'auto';

	// Determine if autoplay should be enabled based on settings and user preference
	const shouldAutoplay = enableAutoplay && !(respectReducedMotion && prefersReducedMotion);

	try {
		// Fetch and load Rive file to get artboard dimensions
		const response = await fetch(riveSrc);
		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		const fileBytes = new Uint8Array(arrayBuffer);

		// Load Rive file
		const file = await rive.load(fileBytes);

		// Get default artboard to determine aspect ratio
		const artboard = file.defaultArtboard();
		const artboardBounds = artboard.bounds;
		const artboardWidth = artboardBounds.maxX - artboardBounds.minX;
		const artboardHeight = artboardBounds.maxY - artboardBounds.minY;
		const aspectRatio = artboardWidth / artboardHeight;

		// Now calculate canvas size
		const computedStyle = window.getComputedStyle(canvas);
		let canvasWidth = parseInt(computedStyle.width, 10);
		let canvasHeight = parseInt(computedStyle.height, 10);

		// Get width first (fallback to parent or default)
		if (!canvasWidth || isNaN(canvasWidth) || canvasWidth === 0) {
			const parent = canvas.parentElement;
			if (parent) {
				const parentStyle = window.getComputedStyle(parent);
				canvasWidth = parseInt(parentStyle.width, 10) || 800;
			} else {
				canvasWidth = 800;
			}
		}

		// Calculate height based on aspect ratio if height is auto or 0
		if (!canvasHeight || isNaN(canvasHeight) || canvasHeight === 0 || heightAttr === 'auto') {
			// Use aspect ratio from artboard to calculate height
			canvasHeight = Math.round(canvasWidth / aspectRatio);

			// Apply minimum height
			if (canvasHeight < 200) {
				canvasHeight = 200;
			}
		}

		// Apply high DPI scaling for crisp rendering
		const dpr = window.devicePixelRatio || 1;
		canvas.width = canvasWidth * dpr;
		canvas.height = canvasHeight * dpr;
		canvas.style.width = canvasWidth + 'px';
		canvas.style.height = canvasHeight + 'px';

		// Debug log in development
		if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
			console.log(`[Rive Block] Canvas size: ${canvasWidth}x${canvasHeight} (DPR: ${dpr}, aspect: ${aspectRatio.toFixed(2)})`);
		}

		// Create WebGL2 renderer with Rive Renderer enabled
		// Second parameter `true` enables Rive Renderer (required for feathering)
		// Note: makeRenderer will create its own WebGL2 context
		const renderer = rive.makeRenderer(canvas, true);

		// Debug: Check if renderer was created successfully
		if (!renderer) {
			console.error('[Rive Block] Failed to create WebGL2 renderer');
			showErrorMessage(canvas, 'Failed to create WebGL2 renderer. Please check browser compatibility.');
			return;
		}

		// Debug log renderer info
		if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
			console.log('[Rive Block] Renderer created successfully', { renderer });
		}

		// Try to create animation instance
		let animationInstance = null;
		if (artboard.animationCount() > 0) {
			const animation = artboard.animationByIndex(0);
			animationInstance = new rive.LinearAnimationInstance(animation, artboard);
		}

		// Store instance data
		const instanceData = {
			rive,
			file,
			artboard,
			renderer,
			animation: animationInstance,
			canvas,
			shouldAutoplay,
			animationFrameId: null
		};

		riveInstances.set(canvas, instanceData);

		// Start render loop if autoplay is enabled
		if (shouldAutoplay && animationInstance) {
			startRenderLoop(instanceData);
		} else {
			// Just render one frame
			renderFrame(instanceData);
		}

		// Log success in development
		if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
			console.log(`[Rive Block] Successfully loaded with WebGL2: ${riveSrc}`);
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
	let frameCount = 0;

	const draw = (time) => {
		// Check if instance still exists
		if (!riveInstances.has(canvas)) {
			return;
		}

		const elapsed = lastTime ? (time - lastTime) / 1000 : 0;
		lastTime = time;

		// Debug: Log first few frames
		if (frameCount < 3 && (window.location.hostname === 'localhost' || window.location.hostname.includes('local'))) {
			console.log(`[Rive Block] Drawing frame ${frameCount}`, {
				canvasSize: `${canvas.width}x${canvas.height}`,
				artboardBounds: artboard.bounds,
				elapsed
			});
		}
		frameCount++;

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

		// Align to canvas - use canvas pixel dimensions (already scaled by DPR)
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

		// Draw artboard with Rive Renderer (enables feathering)
		artboard.draw(renderer);
		renderer.restore();

		// Flush renderer to commit to GPU (critical for WebGL2)
		renderer.flush();

		// Request next frame
		instanceData.animationFrameId = rive.requestAnimationFrame(draw);
	};

	instanceData.animationFrameId = rive.requestAnimationFrame(draw);
}

/**
 * Render a single frame (for static display)
 */
function renderFrame(instanceData) {
	const { rive, artboard, renderer, canvas } = instanceData;

	renderer.clear();
	renderer.save();

	// Align to canvas - use canvas pixel dimensions (already scaled by DPR)
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

	// Flush renderer to commit to GPU (critical for WebGL2)
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
			const { rive, animation, renderer, artboard, file, animationFrameId } = instanceData;

			// Cancel animation frame
			if (animationFrameId) {
				rive.cancelAnimationFrame(animationFrameId);
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

			// Unref file
			if (file) {
				file.unref();
			}
		} catch (error) {
			console.warn('[Rive Block] Error cleaning up instance:', error);
		}
	});

	riveInstances.clear();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initRiveAnimations);
} else {
	initRiveAnimations();
}

// Cleanup on page unload to prevent memory leaks
window.addEventListener('beforeunload', cleanupRiveInstances);
