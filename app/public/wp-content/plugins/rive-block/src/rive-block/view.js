/**
 * Frontend JavaScript for Rive Block
 *
 * Uses @rive-app/canvas-advanced for full control over Rive runtime.
 * Implements shared renderer pattern for optimal performance with multiple blocks.
 */

import RiveCanvas from '@rive-app/canvas-advanced';

// Rive runtime instance (singleton)
let riveRuntime = null;
let runtimeLoading = false;
let runtimeCallbacks = [];

// Track all Rive instances for proper cleanup
const riveInstances = new Map();

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
		riveRuntime = await RiveCanvas({
			locateFile: () => 'https://unpkg.com/@rive-app/canvas-advanced@2.32.1/rive.wasm'
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
 * Initialize all Rive animations on the page
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

	// Determine if autoplay should be enabled based on settings and user preference
	const shouldAutoplay = enableAutoplay && !(respectReducedMotion && prefersReducedMotion);

	try {
		// Fetch Rive file
		const response = await fetch(riveSrc);
		if (!response.ok) {
			throw new Error(`Failed to fetch: ${response.statusText}`);
		}

		const arrayBuffer = await response.arrayBuffer();
		const fileBytes = new Uint8Array(arrayBuffer);

		// Load Rive file
		const file = await rive.load(fileBytes);

		// Get default artboard
		const artboard = file.defaultArtboard();

		// Create renderer
		const renderer = rive.makeRenderer(canvas, true);

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
