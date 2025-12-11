/**
 * RiveCanvas Component
 *
 * Wrapper component that handles Rive animation loading and display in the block editor.
 * Uses @rive-app/webgl2-advanced for full control over Rive runtime with WebGL2 support.
 * Supports vector feathering and advanced rendering features.
 * Isolated component ensures proper cleanup when riveFileUrl changes.
 */

import { useEffect, useState, useRef } from '@wordpress/element';
import { Spinner, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { setCanvasDPIAwareSize } from '../utils/canvas-utils';
import {
	getCachedFile,
	setCachedFile,
} from '../storage/memory/rive-editor-file-cache';
import {
	startRenderLoop,
	renderFrame,
} from '../rendering/rive-rendering-engine';
import { RiveFileLoader } from '../modules/rive-file-loader';
import { riveRuntimeLoader } from '../modules/rive-runtime-loader';

// Log prefix for editor context
const CANVAS_LOG_PREFIX = '[Rive Editor]';

// Set log prefix for runtime loader (editor context)
riveRuntimeLoader.setLogPrefix( `${ CANVAS_LOG_PREFIX } IDB` );

// Initialize file loader with editor cache
const fileLoader = new RiveFileLoader(
	getCachedFile,
	setCachedFile,
	null, // Editor doesn't track URL loading for HTTP cache optimization
	CANVAS_LOG_PREFIX
);

export default function RiveCanvas( {
	riveFileUrl,
	width,
	height,
	enableAutoplay,
	respectReducedMotion,
	ariaLabel,
	ariaDescription,
} ) {
	const canvasRef = useRef( null );
	const riveInstanceRef = useRef( null );
	const riveFileRef = useRef( null );
	const artboardRef = useRef( null );
	const rendererRef = useRef( null );
	const animationFrameIdRef = useRef( null );
	const resizeObserverRef = useRef( null );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ loadError, setLoadError ] = useState( null );

	/**
	 * Render context helper - builds context object for RiveRenderingEngine
	 */
	const buildRenderContext = () => {
		if ( ! riveInstanceRef.current ) return null;
		const { rive, artboard, renderer, animation, animationFPS } =
			riveInstanceRef.current;
		return {
			rive,
			artboard,
			renderer,
			animation,
			canvas: canvasRef.current,
			animationFPS,
			animationFrameIdRef,
			logPrefix: CANVAS_LOG_PREFIX,
			onFrameCheck: () => riveInstanceRef.current !== null,
		};
	};

	// Initialize Rive animation when canvas is ready
	useEffect( () => {
		if ( ! canvasRef.current || ! riveFileUrl ) return;

		let mounted = true;
		setIsLoading( true );
		setLoadError( null );

		( async () => {
			try {
				// Get Rive runtime instance
				const rive = await riveRuntimeLoader.load();

				if ( ! mounted ) return;

				// Load Rive file (uses in-memory cache if available)
				const file = await fileLoader.load( rive, riveFileUrl );
				riveFileRef.current = file;

				if ( ! mounted ) return;

				// Get default artboard
				const artboard = file.defaultArtboard();
				artboardRef.current = artboard;

				// Set canvas to DPI-aware size for crisp rendering
				setCanvasDPIAwareSize( canvasRef.current, CANVAS_LOG_PREFIX );

				// Create renderer
				const renderer = rive.makeRenderer( canvasRef.current, true );
				rendererRef.current = renderer;

				// Debug logging when WP_DEBUG is active
				if ( window.riveBlockData?.debug ) {
					console.log(
						'[Rive Editor] Renderer created for:',
						riveFileUrl
					);
					console.log( '[Rive Editor] Artboard:', artboard.name );
					console.log(
						'[Rive Editor] Canvas size:',
						`${ canvasRef.current.width }×${ canvasRef.current.height }`
					);
					console.log(
						'[Rive Editor] Animations available:',
						artboard.animationCount()
					);
				}

				// Setup ResizeObserver to handle canvas resizing
				// PERFORMANCE: Debounce to prevent excessive resize operations
				let resizeTimeout = null;
				const resizeObserver = new ResizeObserver( () => {
					// Clear any pending resize
					if ( resizeTimeout ) {
						clearTimeout( resizeTimeout );
					}

					// Debounce resize operations to avoid layout thrashing
					resizeTimeout = setTimeout( () => {
						if ( canvasRef.current ) {
							const didResize = setCanvasDPIAwareSize(
								canvasRef.current,
								CANVAS_LOG_PREFIX
							);
							// Re-render current frame with new canvas size (only if actually resized)
							if ( didResize && riveInstanceRef.current ) {
								const context = buildRenderContext();
								if ( context ) {
									renderFrame( context );
								}
							}
						}
					}, 150 ); // 150ms debounce - balances responsiveness vs performance
				} );
				resizeObserver.observe( canvasRef.current );
				resizeObserverRef.current = resizeObserver;

				// Check user's motion preference
				const prefersReducedMotion = window.matchMedia(
					'(prefers-reduced-motion: reduce)'
				).matches;

				// Determine if autoplay should be enabled
				const shouldAutoplay =
					enableAutoplay &&
					! ( respectReducedMotion && prefersReducedMotion );

				// Try to create animation or state machine instance
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
							'[Rive Editor] Animation FPS (from .riv):',
							animationFPS
						);
					}
				}

				riveInstanceRef.current = {
					rive,
					file,
					artboard,
					renderer,
					animation: animationInstance,
					animationFPS, // Store native FPS from .riv file
					shouldAutoplay,
				};

				// Start render loop if autoplay is enabled
				if ( shouldAutoplay && animationInstance ) {
					const context = buildRenderContext();
					if ( context ) {
						startRenderLoop( context );
					}
				} else {
					// Just render one frame
					const context = buildRenderContext();
					if ( context ) {
						renderFrame( context );
					}
				}

				setIsLoading( false );
				setLoadError( null );
			} catch ( error ) {
				console.error(
					'[Rive Block] Error loading Rive animation:',
					error
				);
				if ( mounted ) {
					setLoadError(
						__(
							'Unable to load Rive animation. Please check the file and try again.',
							'rive-block'
						)
					);
					setIsLoading( false );
				}
			}
		} )();

		// Cleanup function
		return () => {
			mounted = false;
			cleanup();
		};
	}, [ riveFileUrl, enableAutoplay, respectReducedMotion ] );

	/**
	 * Cleanup Rive resources
	 * NOTE: Files are NOT unreffed here because they're stored in RiveEditorFileCache
	 * and may be reused by other block instances in the editor.
	 * Files remain cached for optimal performance across multiple blocks.
	 */
	const cleanup = () => {
		// Disconnect resize observer
		if ( resizeObserverRef.current ) {
			resizeObserverRef.current.disconnect();
			resizeObserverRef.current = null;
		}

		// Cancel animation frame
		if ( animationFrameIdRef.current && riveInstanceRef.current ) {
			const { rive } = riveInstanceRef.current;
			rive.cancelAnimationFrame( animationFrameIdRef.current );
			animationFrameIdRef.current = null;
		}

		// Delete Rive instances
		if ( riveInstanceRef.current ) {
			const { animation, renderer, artboard } = riveInstanceRef.current;

			if ( animation ) {
				animation.delete();
			}
			if ( renderer ) {
				renderer.delete();
			}
			if ( artboard ) {
				artboard.delete();
			}
		}

		riveFileRef.current = null;
		riveInstanceRef.current = null;
		artboardRef.current = null;
		rendererRef.current = null;
	};

	return (
		<div style={ { position: 'relative', width, height } }>
			{ /* Loading indicator */ }
			{ isLoading && (
				<div
					style={ {
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'rgba(255, 255, 255, 0.8)',
						zIndex: 1000,
					} }
				>
					<Spinner />
				</div>
			) }

			{ /* Error notice */ }
			{ loadError && (
				<Notice status="error" isDismissible={ false }>
					{ loadError }
				</Notice>
			) }

			{ /* Rive animation canvas - identical markup to frontend */ }
			<canvas
				ref={ canvasRef }
				style={ { width, height } }
				role={ ariaLabel ? 'img' : undefined }
				aria-label={ ariaLabel || undefined }
				aria-description={ ariaDescription || undefined }
			/>
		</div>
	);
}
