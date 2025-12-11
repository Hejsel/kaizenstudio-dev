/**
 * CanvasUtils - Shared canvas utility functions
 *
 * Shared between frontend (view.js) and editor (RiveCanvas.js).
 */

/**
 * Set canvas internal resolution to match display size and device pixel ratio.
 * This ensures crisp rendering and optimal GPU usage.
 *
 * PERFORMANCE: Only resizes if size actually changed to avoid expensive canvas resets.
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to resize
 * @param {string} logPrefix - Prefix for debug logs (default: '[Rive]')
 * @returns {boolean} True if canvas was resized, false if no change
 */
export function setCanvasDPIAwareSize( canvas, logPrefix = '[Rive]' ) {
	if ( ! canvas ) {
		return false;
	}

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

	// Debug log when WP_DEBUG is active
	if ( window.riveBlockData?.debug ) {
		console.log(
			`${ logPrefix } Canvas DPI sizing: ${ displayWidth }×${ displayHeight } CSS → ${ canvas.width }×${ canvas.height } internal (DPR: ${ dpr })`
		);
	}

	return true; // Canvas was resized
}
