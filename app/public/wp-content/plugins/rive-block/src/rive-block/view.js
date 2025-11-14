/**
 * Use this file for JavaScript code that you want to run in the front-end
 * on posts/pages that contain this block.
 *
 * When this file is defined as the value of the `viewScript` property
 * in `block.json` it will be enqueued on the front end of the site.
 *
 * Example:
 *
 * ```js
 * {
 *   "viewScript": "file:./view.js"
 * }
 * ```
 *
 * If you're not making any changes to this file because your project doesn't need any
 * JavaScript running in the front-end, then you should delete this file and remove
 * the `viewScript` property from `block.json`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#view-script
 */

import { Rive } from '@rive-app/canvas';

/**
 * Initialize all Rive animations on the page
 */
function initRiveAnimations() {
	// Find all Rive block canvas elements
	const canvases = document.querySelectorAll('canvas.wp-block-create-block-rive-block');

	if (canvases.length === 0) {
		return;
	}

	canvases.forEach((canvas) => {
		const riveSrc = canvas.dataset.riveSrc;

		// Skip if no Rive source URL is provided
		if (!riveSrc) {
			console.warn('[Rive Block] Canvas missing data-rive-src attribute');
			return;
		}

		try {
			// Initialize Rive instance
			const riveInstance = new Rive({
				canvas: canvas,
				src: riveSrc,
				autoplay: true,
				useOffscreenRenderer: true, // Critical for multiple instances
				onLoadError: () => {
					console.warn(`[Rive Block] Failed to load file: ${riveSrc}`);
				}
			});

			// Store instance reference for potential cleanup
			canvas._riveInstance = riveInstance;
		} catch (error) {
			console.error('[Rive Block] Error initializing Rive:', error);
		}
	});
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initRiveAnimations);
} else {
	initRiveAnimations();
}
