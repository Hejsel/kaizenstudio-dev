/**
 * RiveCanvas Component
 *
 * Wrapper component that handles Rive animation loading and display in the block editor.
 * Uses @rive-app/webgl2-advanced for Rive Renderer support (enables vector feathering).
 * Isolated component ensures proper cleanup when riveFileUrl changes.
 */

import { useEffect, useState, useRef } from '@wordpress/element';
import { Spinner, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { riveRuntime } from '../utils/RiveRuntime';

export default function RiveCanvas({
	riveFileUrl,
	width,
	height,
	enableAutoplay,
	respectReducedMotion,
	ariaLabel,
	ariaDescription
}) {
	const canvasRef = useRef(null);
	const riveInstanceRef = useRef(null);
	const riveFileRef = useRef(null);
	const artboardRef = useRef(null);
	const rendererRef = useRef(null);
	const animationFrameIdRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);
	const [webglNotSupported, setWebglNotSupported] = useState(false);

	// Check WebGL2 support on mount
	useEffect(() => {
		if (!riveRuntime.isWebGL2Supported()) {
			setWebglNotSupported(true);
			setIsLoading(false);
			setLoadError(__('WebGL2 is not supported in your browser. Please use a modern browser to view Rive animations with vector feathering.', 'rive-block'));
		}
	}, []);

	// Initialize Rive animation when canvas is ready
	useEffect(() => {
		console.log('[RiveCanvas] useEffect triggered', {
			hasCanvas: !!canvasRef.current,
			riveFileUrl,
			webglNotSupported,
			width,
			height
		});

		if (!canvasRef.current || !riveFileUrl || webglNotSupported) {
			console.log('[RiveCanvas] Early return - missing requirements');
			return;
		}

		let mounted = true;
		setIsLoading(true);
		setLoadError(null);

		(async () => {
			try {
				// Set canvas size attributes - WebGL2 requires these
				const canvas = canvasRef.current;

				// Wait for DOM to layout using requestAnimationFrame (more reliable than setTimeout)
				await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

				// Get Rive runtime instance FIRST
				console.log('[RiveCanvas] Getting Rive runtime...');
				const rive = await riveRuntime.awaitInstance();
				console.log('[RiveCanvas] Rive runtime loaded');

				if (!mounted) return;

				// Fetch and load Rive file to get artboard dimensions
				console.log('[RiveCanvas] Fetching Rive file:', riveFileUrl);
				const response = await fetch(riveFileUrl);
				if (!response.ok) {
					throw new Error(`Failed to fetch Rive file: ${response.statusText}`);
				}

				const arrayBuffer = await response.arrayBuffer();
				const fileBytes = new Uint8Array(arrayBuffer);
				console.log('[RiveCanvas] File fetched, size:', fileBytes.length, 'bytes');

				// Load Rive file
				console.log('[RiveCanvas] Loading Rive file...');
				const file = await rive.load(fileBytes);
				riveFileRef.current = file;
				console.log('[RiveCanvas] File loaded successfully');

				if (!mounted) return;

				// Get default artboard to determine aspect ratio
				const artboard = file.defaultArtboard();
				artboardRef.current = artboard;
				const artboardBounds = artboard.bounds;
				const artboardWidth = artboardBounds.maxX - artboardBounds.minX;
				const artboardHeight = artboardBounds.maxY - artboardBounds.minY;
				const aspectRatio = artboardWidth / artboardHeight;

				console.log('[RiveCanvas] Artboard loaded:', artboard.name, 'bounds:', artboardBounds, 'aspect ratio:', aspectRatio);

				// Now calculate canvas size
				const computedStyle = window.getComputedStyle(canvas);
				let canvasWidth = parseInt(computedStyle.width, 10);
				let canvasHeight = parseInt(computedStyle.height, 10);

				console.log('[RiveCanvas] Initial computed size', { canvasWidth, canvasHeight });

				// Get width first (fallback to parent or default)
				if (!canvasWidth || isNaN(canvasWidth) || canvasWidth === 0) {
					const parent = canvas.parentElement;
					if (parent) {
						const parentStyle = window.getComputedStyle(parent);
						canvasWidth = parseInt(parentStyle.width, 10);
					}

					// Final fallback to minimum size
					if (!canvasWidth || canvasWidth === 0) {
						canvasWidth = 800;
					}
				}

				// Calculate height based on aspect ratio if height is auto or 0
				if (!canvasHeight || isNaN(canvasHeight) || canvasHeight === 0 || height === 'auto') {
					// Use aspect ratio from artboard to calculate height
					canvasHeight = Math.round(canvasWidth / aspectRatio);
					console.log('[RiveCanvas] Calculated height from aspect ratio:', canvasHeight);

					// Apply minimum height
					if (canvasHeight < 200) {
						canvasHeight = 200;
					}
				}

				// Set pixel dimensions FIRST (for DPR scaling)
				const dpr = window.devicePixelRatio || 1;
				canvas.width = canvasWidth * dpr;
				canvas.height = canvasHeight * dpr;

				console.log('[RiveCanvas] Canvas pixel dimensions set', {
					canvasWidth,
					canvasHeight,
					dpr,
					pixelWidth: canvas.width,
					pixelHeight: canvas.height
				});

				// Create WebGL2 renderer BEFORE setting CSS dimensions
				// This ensures renderer gets correct pixel dimensions
				console.log('[RiveCanvas] Creating WebGL2 renderer...');
				const renderer = rive.makeRenderer(canvas, true);
				rendererRef.current = renderer;
				console.log('[RiveCanvas] Renderer created:', !!renderer);

				// Now set CSS dimensions for display
				canvas.style.width = canvasWidth + 'px';
				canvas.style.height = canvasHeight + 'px';

				console.log('[RiveCanvas] Canvas CSS dimensions set');

				// Check user's motion preference
				const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

				// Determine if autoplay should be enabled
				const shouldAutoplay = enableAutoplay && !(respectReducedMotion && prefersReducedMotion);

				// Try to create animation or state machine instance
				let animationInstance = null;

				console.log('[RiveCanvas] Animation count:', artboard.animationCount());
				if (artboard.animationCount() > 0) {
					const animation = artboard.animationByIndex(0);
					animationInstance = new rive.LinearAnimationInstance(animation, artboard);
					console.log('[RiveCanvas] Animation instance created');
				}

				riveInstanceRef.current = {
					rive,
					file,
					artboard,
					renderer,
					animation: animationInstance,
					shouldAutoplay
				};

				console.log('[RiveCanvas] Should autoplay:', shouldAutoplay, 'Has animation:', !!animationInstance);

				// Start render loop if autoplay is enabled
				if (shouldAutoplay && animationInstance) {
					console.log('[RiveCanvas] Starting render loop...');
					startRenderLoop(rive);
				} else {
					// Just render one frame
					console.log('[RiveCanvas] Rendering single frame...');
					renderFrame(rive);
				}

				setIsLoading(false);
				setLoadError(null);
				console.log('[RiveCanvas] Initialization complete!');

			} catch (error) {
				console.error('[Rive Block] Error loading Rive animation:', error);
				if (mounted) {
					setLoadError(__('Unable to load Rive animation. Please check the file and try again.', 'rive-block'));
					setIsLoading(false);
				}
			}
		})();

		// Cleanup function
		return () => {
			mounted = false;
			cleanup();
		};
	}, [riveFileUrl, width, height, enableAutoplay, respectReducedMotion, webglNotSupported]);

	/**
	 * Start the render loop for animation
	 */
	const startRenderLoop = (rive) => {
		console.log('[RiveCanvas] startRenderLoop called');
		let lastTime = 0;
		let frameCount = 0;

		const draw = (time) => {
			if (frameCount < 3) {
				console.log(`[RiveCanvas] Draw frame ${frameCount}`);
			}
			frameCount++;

			if (!riveInstanceRef.current) return;

			const { artboard, renderer, animation } = riveInstanceRef.current;
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

			// Align to canvas - WebGL2 uses same API as Canvas
			renderer.align(
				rive.Fit.contain,
				rive.Alignment.center,
				{
					minX: 0,
					minY: 0,
					maxX: canvasRef.current.width,
					maxY: canvasRef.current.height
				},
				artboard.bounds
			);

			// Draw artboard with Rive Renderer (enables feathering)
			artboard.draw(renderer);
			renderer.restore();

			// Flush renderer to commit to GPU (critical for WebGL2)
			renderer.flush();

			// Request next frame
			animationFrameIdRef.current = rive.requestAnimationFrame(draw);
		};

		animationFrameIdRef.current = rive.requestAnimationFrame(draw);
	};

	/**
	 * Render a single frame (for static display)
	 */
	const renderFrame = (rive) => {
		console.log('[RiveCanvas] renderFrame called');
		if (!riveInstanceRef.current) {
			console.log('[RiveCanvas] No rive instance ref!');
			return;
		}

		const { artboard, renderer } = riveInstanceRef.current;

		// Log detailed debugging info
		console.log('[RiveCanvas] Canvas element:', canvasRef.current);
		console.log('[RiveCanvas] Canvas pixel dimensions:', {
			width: canvasRef.current.width,
			height: canvasRef.current.height
		});
		console.log('[RiveCanvas] Canvas CSS dimensions:', {
			styleWidth: canvasRef.current.style.width,
			styleHeight: canvasRef.current.style.height,
			offsetWidth: canvasRef.current.offsetWidth,
			offsetHeight: canvasRef.current.offsetHeight
		});
		console.log('[RiveCanvas] Artboard bounds:', artboard.bounds);
		console.log('[RiveCanvas] Renderer:', renderer);

		// Render the frame
		renderer.clear();
		renderer.save();

		// Align artboard to canvas bounds
		const alignBounds = {
			minX: 0,
			minY: 0,
			maxX: canvasRef.current.width,
			maxY: canvasRef.current.height
		};

		console.log('[RiveCanvas] Align bounds:', alignBounds);

		renderer.align(
			rive.Fit.contain,
			rive.Alignment.center,
			alignBounds,
			artboard.bounds
		);

		// Draw artboard
		console.log('[RiveCanvas] Drawing artboard...');
		artboard.draw(renderer);
		renderer.restore();

		// Flush to GPU
		renderer.flush();

		console.log('[RiveCanvas] Frame rendered and flushed successfully');

		// DEBUG TEST: Access Rive's internal WebGL context
		// Renderer object has structure: renderer.Db.T is the WebGL2RenderingContext
		if (renderer.Db && renderer.Db.T) {
			const gl = renderer.Db.T;
			console.log('[RiveCanvas] DEBUG: Got Rive WebGL context:', gl);

			// Try to draw a red rectangle to verify WebGL works
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(10, 10, 100, 100);
			gl.clearColor(1.0, 0.0, 0.0, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.disable(gl.SCISSOR_TEST);
			console.log('[RiveCanvas] DEBUG: Drew red 100x100 square - if you see red, WebGL works!');
		}
	};

	/**
	 * Cleanup Rive resources
	 */
	const cleanup = () => {
		// Cancel animation frame
		if (animationFrameIdRef.current && riveInstanceRef.current) {
			const { rive } = riveInstanceRef.current;
			rive.cancelAnimationFrame(animationFrameIdRef.current);
			animationFrameIdRef.current = null;
		}

		// Delete Rive instances
		if (riveInstanceRef.current) {
			const { animation, renderer, artboard } = riveInstanceRef.current;

			if (animation) {
				animation.delete();
			}
			if (renderer) {
				renderer.delete();
			}
			if (artboard) {
				artboard.delete();
			}
		}

		// Unref file
		if (riveFileRef.current) {
			riveFileRef.current.unref();
			riveFileRef.current = null;
		}

		riveInstanceRef.current = null;
		artboardRef.current = null;
		rendererRef.current = null;
	};

	return (
		<div style={{
			position: 'relative',
			width: width || '100%',
			minHeight: height === 'auto' ? '200px' : height,
			display: 'block'
		}}>
			{/* Loading indicator */}
			{isLoading && !webglNotSupported && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'rgba(255, 255, 255, 0.8)',
						zIndex: 1000
					}}
				>
					<Spinner />
				</div>
			)}

			{/* Error notice */}
			{loadError && (
				<Notice status={webglNotSupported ? "warning" : "error"} isDismissible={false}>
					{loadError}
					{webglNotSupported && (
						<>
							<br />
							<strong>{__('Supported browsers:', 'rive-block')}</strong> Chrome 56+, Firefox 51+, Safari 15+, Edge 79+
						</>
					)}
				</Notice>
			)}

			{/* Rive animation canvas - ALL sizes set programmatically in useEffect */}
			{!webglNotSupported && (
				<canvas
					ref={canvasRef}
					style={{
						display: 'block'
					}}
					role={ariaLabel ? 'img' : undefined}
					aria-label={ariaLabel || undefined}
					aria-description={ariaDescription || undefined}
				/>
			)}
		</div>
	);
}
