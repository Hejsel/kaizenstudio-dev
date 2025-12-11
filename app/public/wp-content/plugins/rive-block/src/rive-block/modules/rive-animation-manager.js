/* global ResizeObserver, IntersectionObserver */
/* eslint-disable no-console */
/**
 * RiveAnimationManager Module
 *
 * Orchestrates initialization and cleanup of Rive animation instances.
 * Handles eager/lazy loading, viewport visibility, and proper resource cleanup.
 */

import { setCanvasDPIAwareSize } from '../utils/canvas-utils';
import { clearCache } from '../storage/memory/rive-file-cache';
import {
	startRenderLoop,
	renderFrame,
} from '../rendering/rive-rendering-engine';
import {
	setupViewportObserver,
	showErrorMessage,
} from './rive-viewport-observer';
import { riveRuntimeLoader } from './rive-runtime-loader';

const CANVAS_LOG_PREFIX = '[Rive Block]';

/**
 * RiveAnimationManager - Orchestrates Rive animation lifecycle
 *
 * Manages initialization, cleanup, and resource tracking for all Rive instances.
 * Implements eager loading for high-priority animations and lazy loading with IntersectionObserver
 * for low-priority animations. Handles proper cleanup to prevent WASM reference counting issues.
 */
export class RiveAnimationManager {
	constructor( fileLoader ) {
		this.fileLoader = fileLoader;
		this.riveInstances = new Map();
		this.currentPageUrl = window.location.href;
	}

	/**
	 * Initialize all Rive animations on the page
	 * Handles both eager loading (high priority) and lazy loading (low priority)
	 */
	async initialize() {
		// CRITICAL: Only cleanup if we navigated to a different page (not just a reload)
		// This preserves in-memory cache for same-page reloads while still handling SPA navigation
		const newPageUrl = window.location.href;
		if ( newPageUrl !== this.currentPageUrl ) {
			this.cleanup();
			this.currentPageUrl = newPageUrl;
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
			const rive = await riveRuntimeLoader.load();

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
				await this.initInstance( rive, canvas, prefersReducedMotion );
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
							if ( this.riveInstances.has( canvas ) ) {
								return;
							}

							// Initialize Rive instance when canvas becomes visible
							await this.initInstance(
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
	 * Initialize a single Rive instance
	 *
	 * @param {Object}            rive                 - Rive runtime instance
	 * @param {HTMLCanvasElement} canvas               - Canvas element to initialize
	 * @param {boolean}           prefersReducedMotion - User's motion preference
	 */
	async initInstance( rive, canvas, prefersReducedMotion ) {
		const riveSrc = canvas.dataset.riveSrc;

		// Skip if no Rive source URL is provided
		if ( ! riveSrc ) {
			console.warn(
				'[Rive Block] Canvas missing data-rive-src attribute'
			);
			return;
		}

		// Read accessibility settings from data attributes
		const enableAutoplay = canvas.dataset.enableAutoplay === 'true';
		const respectReducedMotion =
			canvas.dataset.respectReducedMotion !== 'false'; // Default to true

		// Determine if autoplay should be enabled based on settings and user preference
		const shouldAutoplay =
			enableAutoplay &&
			! ( respectReducedMotion && prefersReducedMotion );

		try {
			// Load Rive file (uses in-memory cache if available)
			const file = await this.fileLoader.load( rive, riveSrc );

			// Get default artboard
			const artboard = file.defaultArtboard();

			// Set canvas to DPI-aware size for crisp rendering and optimal GPU usage
			setCanvasDPIAwareSize( canvas, CANVAS_LOG_PREFIX );

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
					console.log(
						'[Rive Block] Animation FPS (from .riv):',
						animationFPS
					);
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

			this.riveInstances.set( canvas, instanceData );

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
							const didResize = setCanvasDPIAwareSize(
								canvas,
								CANVAS_LOG_PREFIX
							);

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

			// Log success when WP_DEBUG is enabled
			if ( window.riveBlockData?.debug ) {
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
	cleanup() {
		this.riveInstances.forEach( ( instanceData ) => {
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
				console.warn(
					'[Rive Block] Error cleaning up instance:',
					error
				);
			}
		} );

		this.riveInstances.clear();

		// Clear the file cache to prevent stale WASM references
		// After artboards are deleted, cached file references become invalid
		clearCache();
	}
}
