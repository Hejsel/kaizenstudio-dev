/**
 * RiveRenderingEngine - Shared Rive rendering implementation
 *
 * Provides unified rendering logic for both editor (React/RiveCanvas.js)
 * and frontend (vanilla JS/view.js) contexts.
 *
 * Uses WebGL2-Advanced renderer with offscreen rendering for optimal performance.
 * Respects animation's native FPS from .riv file to avoid wasted GPU cycles.
 */

/**
 * Start the render loop for animation playback
 * Respects animation's native FPS from .riv file to avoid wasted GPU cycles
 *
 * @param {Object} context - Rendering context with:
 *   - rive: Rive runtime instance
 *   - artboard: Rive artboard object
 *   - renderer: Rive renderer instance
 *   - animation: Rive animation instance (or null for static)
 *   - canvas: HTMLCanvasElement
 *   - animationFPS: Native animation FPS from .riv file
 *   - animationFrameIdRef: Object with .current property OR direct property to store frame ID
 *   - logPrefix: Log prefix for debug messages (default: '[Rive]')
 *   - onFrameCheck: Optional callback to check if instance still exists (for cleanup)
 */
export function startRenderLoop( context ) {
	const {
		rive,
		artboard,
		renderer,
		animation,
		canvas,
		animationFPS,
		animationFrameIdRef,
		logPrefix = '[Rive]',
		onFrameCheck = null,
	} = context;

	// Use context itself as ref if animationFrameIdRef not provided
	// This handles both React refs and plain objects
	const frameIdRef = animationFrameIdRef || context;

	let lastTime = 0;
	let lastRenderTime = 0;

	// Use animation's native FPS from .riv file (set in Rive Editor)
	// This prevents wasted GPU cycles from rendering identical frames
	const targetFPS = animationFPS || 60; // Fallback to 60 if not available
	const frameInterval = 1000 / targetFPS; // ms between frames

	// Debug log target FPS
	if ( window.riveBlockData?.debug ) {
		console.log( `${ logPrefix } Render loop FPS: ${ targetFPS } (matching animation FPS)` );
	}

	const draw = ( time ) => {
		// Check if instance still exists (allows cleanup check)
		if ( onFrameCheck && ! onFrameCheck() ) {
			return;
		}

		// Frame rate limiting to match animation's native FPS
		if ( time - lastRenderTime < frameInterval ) {
			// Skip this frame to maintain target FPS
			setAnimationFrameId( frameIdRef, rive.requestAnimationFrame( draw ) );
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
		setAnimationFrameId( frameIdRef, rive.requestAnimationFrame( draw ) );
	};

	setAnimationFrameId( frameIdRef, rive.requestAnimationFrame( draw ) );
}

/**
 * Render a single frame (for static display or when autoplay is disabled)
 *
 * @param {Object} context - Rendering context with:
 *   - rive: Rive runtime instance
 *   - artboard: Rive artboard object
 *   - renderer: Rive renderer instance
 *   - canvas: HTMLCanvasElement
 *   - logPrefix: Log prefix for debug messages (default: '[Rive]')
 */
export function renderFrame( context ) {
	const { rive, artboard, renderer, canvas, logPrefix = '[Rive]' } = context;

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
 * Pause the render loop for a single instance
 * Used when animation is not in viewport to save GPU resources
 *
 * @param {Object} context - Rendering context with:
 *   - rive: Rive runtime instance
 *   - animationFrameIdRef: Object with .current property OR direct property storing frame ID
 *   - logPrefix: Log prefix for debug messages (default: '[Rive]')
 */
export function pauseRenderLoop( context ) {
	if ( ! context ) {
		return;
	}

	const { rive, animationFrameIdRef, logPrefix = '[Rive]' } = context;

	// Use context itself as ref if animationFrameIdRef not provided
	const frameIdRef = animationFrameIdRef || context;

	// Cancel animation frame if running
	const frameId = getAnimationFrameId( frameIdRef );
	if ( frameId ) {
		rive.cancelAnimationFrame( frameId );
		setAnimationFrameId( frameIdRef, null );
	}
}

/**
 * Resume the render loop for a single instance
 * Called when animation enters viewport
 *
 * @param {Object} context - Rendering context with:
 *   - rive: Rive runtime instance
 *   - artboard: Rive artboard object
 *   - renderer: Rive renderer instance
 *   - animation: Rive animation instance
 *   - canvas: HTMLCanvasElement
 *   - animationFPS: Native animation FPS from .riv file
 *   - animationFrameIdRef: Object with .current property OR direct property
 *   - shouldAutoplay: Boolean to check if autoplay is enabled
 *   - logPrefix: Log prefix for debug messages (default: '[Rive]')
 *   - renderLoopState: Object with { lastTime, lastRenderTime } for continuing from pause
 */
export function resumeRenderLoop( context ) {
	if ( ! context ) {
		return;
	}

	const { shouldAutoplay, animationFrameIdRef } = context;

	// Use context itself as ref if animationFrameIdRef not provided
	const frameIdRef = animationFrameIdRef || context;

	// Check if already running
	if ( getAnimationFrameId( frameIdRef ) ) {
		return; // Already running
	}

	// Only resume if autoplay is enabled
	if ( shouldAutoplay ) {
		startRenderLoop( context );
	}
}

/**
 * Helper: Get animation frame ID from ref or direct property
 * Handles both React refs (.current) and plain properties
 *
 * @private
 * @param {Object} ref - Reference object
 * @returns {number|null} Animation frame ID or null
 */
function getAnimationFrameId( ref ) {
	if ( ! ref ) return null;
	// Support both React refs (.current) and plain properties
	return ref.current !== undefined ? ref.current : ref.animationFrameId;
}

/**
 * Helper: Set animation frame ID to ref or direct property
 * Handles both React refs (.current) and plain properties
 *
 * @private
 * @param {Object} ref - Reference object
 * @param {number|null} id - Animation frame ID or null
 */
function setAnimationFrameId( ref, id ) {
	if ( ! ref ) return;
	// Support both React refs (.current) and plain properties
	if ( ref.current !== undefined ) {
		ref.current = id;
	} else {
		ref.animationFrameId = id;
	}
}
