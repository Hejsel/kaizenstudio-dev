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
import { riveRuntime } from '../utils/RiveRuntime';

// In-memory cache for Rive files to avoid duplicate fetching and decoding
// Key: file URL, Value: decoded Rive file object
const riveFileCache = new Map();

/**
 * Load and cache a Rive file for the editor
 * Uses in-memory cache to avoid duplicate fetching and decoding of the same file
 *
 * @param {object} rive - Rive runtime instance
 * @param {string} url - URL of the Rive file to load
 * @returns {Promise<object>} Decoded Rive file object
 */
async function loadRiveFile( rive, url ) {
	// Check cache first
	if ( riveFileCache.has( url ) ) {
		if (
			window.location.hostname === 'localhost' ||
			window.location.hostname.includes( 'local' )
		) {
			console.log( `[Rive Editor] Cache hit: ${ url }` );
		}
		return riveFileCache.get( url );
	}

	// Cache miss - fetch and decode the file
	if (
		window.location.hostname === 'localhost' ||
		window.location.hostname.includes( 'local' )
	) {
		console.log( `[Rive Editor] Cache miss, loading: ${ url }` );
	}

	// Use 'default' cache mode to respect HTTP cache headers
	// Editor context doesn't use preload, so default caching is appropriate
	const response = await fetch( url, { cache: 'default' } );
	if ( ! response.ok ) {
		throw new Error(
			`Failed to fetch Rive file: ${ response.statusText }`
		);
	}

	const arrayBuffer = await response.arrayBuffer();
	const fileBytes = new Uint8Array( arrayBuffer );

	// Load and decode the file
	const file = await rive.load( fileBytes );

	// Store in cache for future use
	riveFileCache.set( url, file );

	if (
		window.location.hostname === 'localhost' ||
		window.location.hostname.includes( 'local' )
	) {
		console.log( `[Rive Editor] Successfully loaded: ${ url }` );
	}

	return file;
}

export default function RiveCanvas( {
	riveFileUrl,
	riveFileId,
	width,
	height,
	enableAutoplay,
	respectReducedMotion,
	ariaLabel,
	ariaDescription,
	posterFrameUrl,
	posterFrameId,
	blockId,
	onPosterFrameGenerated,
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
	const [ isGeneratingPoster, setIsGeneratingPoster ] = useState( false );
	const hasGeneratedPosterRef = useRef( false );

	/**
	 * Set canvas internal resolution to match display size and device pixel ratio
	 * This ensures crisp rendering and optimal GPU usage in the editor
	 *
	 * PERFORMANCE: Uses adaptive DPR scaling to reduce GPU load on large canvas
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas element to resize
	 * @returns {boolean} True if canvas was resized, false if no change
	 */
	const setCanvasDPIAwareSize = ( canvas ) => {
		if ( ! canvas ) return false;

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
				`[Rive Editor] Canvas DPI sizing: ${ displayWidth }×${ displayHeight } CSS → ${ canvas.width }×${ canvas.height } internal (DPR: ${ dpr })`
			);
		}

		return true; // Canvas was resized
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
				const rive = await riveRuntime.awaitInstance();

				if ( ! mounted ) return;

				// Load Rive file (uses in-memory cache if available)
				const file = await loadRiveFile( rive, riveFileUrl );
				riveFileRef.current = file;

				if ( ! mounted ) return;

				// Get default artboard
				const artboard = file.defaultArtboard();
				artboardRef.current = artboard;

				// Set canvas to DPI-aware size for crisp rendering
				setCanvasDPIAwareSize( canvasRef.current );

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
							const didResize = setCanvasDPIAwareSize( canvasRef.current );
							// Re-render current frame with new canvas size (only if actually resized)
							if ( didResize && riveInstanceRef.current ) {
								renderFrame( rive );
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
						console.log( '[Rive Editor] Animation FPS (from .riv):', animationFPS );
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
					startRenderLoop( rive );
				} else {
					// Just render one frame
					renderFrame( rive );
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
	 * Start the render loop for animation
	 * Respects animation's native FPS from .riv file to avoid wasted GPU cycles
	 */
	const startRenderLoop = ( rive ) => {
		let lastTime = 0;
		let lastRenderTime = 0;

		// Use animation's native FPS from .riv file (set in Rive Editor)
		// This prevents wasted GPU cycles from rendering identical frames
		const targetFPS = riveInstanceRef.current?.animationFPS || 60; // Fallback to 60 if not available
		const frameInterval = 1000 / targetFPS; // ms between frames

		// Debug log target FPS
		if ( window.riveBlockData?.debug ) {
			console.log( `[Rive Editor] Render loop FPS: ${ targetFPS } (matching animation FPS)` );
		}

		const draw = ( time ) => {
			if ( ! riveInstanceRef.current ) return;

			// Frame rate limiting to match animation's native FPS
			if ( time - lastRenderTime < frameInterval ) {
				// Skip this frame to maintain target FPS
				animationFrameIdRef.current = rive.requestAnimationFrame( draw );
				return;
			}

			lastRenderTime = time;

			const { artboard, renderer, animation } = riveInstanceRef.current;
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
					maxX: canvasRef.current.width,
					maxY: canvasRef.current.height,
				},
				artboard.bounds
			);

			// Draw artboard
			artboard.draw( renderer );
			renderer.restore();

			// Flush renderer (required for WebGL2)
			renderer.flush();

			// Request next frame
			animationFrameIdRef.current = rive.requestAnimationFrame( draw );
		};

		animationFrameIdRef.current = rive.requestAnimationFrame( draw );
	};

	/**
	 * Render a single frame (for static display)
	 */
	const renderFrame = ( rive ) => {
		if ( ! riveInstanceRef.current ) return;

		const { artboard, renderer } = riveInstanceRef.current;

		renderer.clear();
		renderer.save();

		// Align to canvas
		renderer.align(
			rive.Fit.contain,
			rive.Alignment.center,
			{
				minX: 0,
				minY: 0,
				maxX: canvasRef.current.width,
				maxY: canvasRef.current.height,
			},
			artboard.bounds
		);

		// Draw artboard
		artboard.draw( renderer );
		renderer.restore();

		// Flush renderer (required for WebGL2)
		renderer.flush();
	};

	/**
	 * Auto-generate poster frame from first rendered frame
	 * Captures canvas as WebP and uploads to WordPress Media Library
	 */
	const generatePosterFrame = async () => {
		// Skip if already generated or no callback provided
		if ( hasGeneratedPosterRef.current || ! onPosterFrameGenerated ) {
			return;
		}

		// Skip if manually set poster frame already exists
		if ( posterFrameUrl && posterFrameId ) {
			if ( window.riveBlockData?.debug ) {
				console.log( '[Rive Editor] Manual poster frame exists, skipping auto-generation' );
			}
			return;
		}

		// Skip if canvas isn't ready
		if ( ! canvasRef.current || ! riveInstanceRef.current ) {
			return;
		}

		hasGeneratedPosterRef.current = true;
		setIsGeneratingPoster( true );

		try {
			if ( window.riveBlockData?.debug ) {
				console.log( '[Rive Editor] Auto-generating poster frame...' );
			}

			// Convert canvas to Blob (WebP format for optimal size/quality)
			const blob = await new Promise( ( resolve, reject ) => {
				canvasRef.current.toBlob(
					( result ) => {
						if ( result ) {
							resolve( result );
						} else {
							reject( new Error( 'Failed to convert canvas to blob' ) );
						}
					},
					'image/webp',
					0.9 // High quality
				);
			} );

			// Convert Blob to base64 for REST API upload
			const base64Data = await new Promise( ( resolve, reject ) => {
				const reader = new FileReader();
				reader.onloadend = () => resolve( reader.result );
				reader.onerror = reject;
				reader.readAsDataURL( blob );
			} );

			// Upload to WordPress via REST API
			const response = await fetch( '/wp-json/rive-block/v1/upload-poster-frame', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-WP-Nonce': window.wpApiSettings?.nonce || '',
				},
				body: JSON.stringify( {
					imageData: base64Data,
					riveFileId,
					blockId,
				} ),
			} );

			if ( ! response.ok ) {
				throw new Error( `Upload failed: ${ response.statusText }` );
			}

			const result = await response.json();

			if ( result.success && result.url && result.id ) {
				if ( window.riveBlockData?.debug ) {
					console.log( '[Rive Editor] Poster frame generated successfully:', result.url );
				}

				// Notify parent component of new poster frame
				onPosterFrameGenerated( result.url, result.id );
			} else {
				throw new Error( 'Invalid response from upload endpoint' );
			}

			setIsGeneratingPoster( false );
		} catch ( error ) {
			console.error( '[Rive Block] Error generating poster frame:', error );
			setIsGeneratingPoster( false );
			hasGeneratedPosterRef.current = false; // Allow retry
		}
	};

	// Auto-generate poster frame after first successful render
	useEffect( () => {
		// Wait for loading to complete and ensure no errors
		if ( ! isLoading && ! loadError && riveInstanceRef.current ) {
			// Small delay to ensure canvas is fully rendered
			const timeoutId = setTimeout( () => {
				generatePosterFrame();
			}, 100 );

			return () => clearTimeout( timeoutId );
		}
	}, [ isLoading, loadError ] );

	/**
	 * Cleanup Rive resources
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

		// NOTE: We don't unref files here because they're stored in riveFileCache
		// and may be reused by other block instances in the editor.
		// Files remain cached for optimal performance across multiple blocks.
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

			{ /* Poster frame generation indicator */ }
			{ isGeneratingPoster && (
				<div
					style={ {
						position: 'absolute',
						bottom: '8px',
						right: '8px',
						padding: '4px 8px',
						backgroundColor: 'rgba(0, 0, 0, 0.7)',
						color: 'white',
						fontSize: '12px',
						borderRadius: '4px',
						zIndex: 999,
						display: 'flex',
						alignItems: 'center',
						gap: '6px',
					} }
				>
					<Spinner style={ { width: '14px', height: '14px' } } />
					{ __( 'Generating poster...', 'rive-block' ) }
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
