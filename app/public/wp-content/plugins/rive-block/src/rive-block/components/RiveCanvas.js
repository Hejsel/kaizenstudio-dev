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
async function loadRiveFile(rive, url) {
	// Check cache first
	if (riveFileCache.has(url)) {
		if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
			console.log(`[Rive Editor] Cache hit: ${url}`);
		}
		return riveFileCache.get(url);
	}

	// Cache miss - fetch and decode the file
	if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
		console.log(`[Rive Editor] Cache miss, loading: ${url}`);
	}

	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch Rive file: ${response.statusText}`);
	}

	const arrayBuffer = await response.arrayBuffer();
	const fileBytes = new Uint8Array(arrayBuffer);

	// Load and decode the file
	const file = await rive.load(fileBytes);

	// Store in cache for future use
	riveFileCache.set(url, file);

	if (window.location.hostname === 'localhost' || window.location.hostname.includes('local')) {
		console.log(`[Rive Editor] Successfully loaded: ${url}`);
	}

	return file;
}

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
	const resizeObserverRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);

	/**
	 * Set canvas internal resolution to match display size and device pixel ratio
	 * This ensures crisp rendering and optimal GPU usage in the editor
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas element to resize
	 */
	const setCanvasDPIAwareSize = (canvas) => {
		if (!canvas) return;

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
	};

	// Initialize Rive animation when canvas is ready
	useEffect(() => {
		if (!canvasRef.current || !riveFileUrl) return;

		let mounted = true;
		setIsLoading(true);
		setLoadError(null);

		(async () => {
			try {
				// Get Rive runtime instance
				const rive = await riveRuntime.awaitInstance();

				if (!mounted) return;

				// Load Rive file (uses in-memory cache if available)
				const file = await loadRiveFile(rive, riveFileUrl);
				riveFileRef.current = file;

				if (!mounted) return;

				// Get default artboard
				const artboard = file.defaultArtboard();
				artboardRef.current = artboard;

				// Set canvas to DPI-aware size for crisp rendering
				setCanvasDPIAwareSize(canvasRef.current);

				// Create renderer
				const renderer = rive.makeRenderer(canvasRef.current, true);
				rendererRef.current = renderer;

				// Debug logging when WP_DEBUG is active
				if (window.riveBlockData?.debug) {
					console.log('[Rive Editor] Renderer created for:', riveFileUrl);
					console.log('[Rive Editor] Artboard:', artboard.name);
					console.log('[Rive Editor] Canvas size:', `${canvasRef.current.width}×${canvasRef.current.height}`);
					console.log('[Rive Editor] Animations available:', artboard.animationCount());
				}

				// Setup ResizeObserver to handle canvas resizing
				const resizeObserver = new ResizeObserver(() => {
					if (canvasRef.current) {
						setCanvasDPIAwareSize(canvasRef.current);
						// Re-render current frame with new canvas size
						if (riveInstanceRef.current) {
							renderFrame(rive);
						}
					}
				});
				resizeObserver.observe(canvasRef.current);
				resizeObserverRef.current = resizeObserver;

				// Check user's motion preference
				const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

				// Determine if autoplay should be enabled
				const shouldAutoplay = enableAutoplay && !(respectReducedMotion && prefersReducedMotion);

				// Try to create animation or state machine instance
				let animationInstance = null;

				if (artboard.animationCount() > 0) {
					const animation = artboard.animationByIndex(0);
					animationInstance = new rive.LinearAnimationInstance(animation, artboard);
				}

				riveInstanceRef.current = {
					rive,
					file,
					artboard,
					renderer,
					animation: animationInstance,
					shouldAutoplay
				};

				// Start render loop if autoplay is enabled
				if (shouldAutoplay && animationInstance) {
					startRenderLoop(rive);
				} else {
					// Just render one frame
					renderFrame(rive);
				}

				setIsLoading(false);
				setLoadError(null);

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
	}, [riveFileUrl, enableAutoplay, respectReducedMotion]);

	/**
	 * Start the render loop for animation
	 */
	const startRenderLoop = (rive) => {
		let lastTime = 0;

		const draw = (time) => {
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

			// Align to canvas
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

			// Draw artboard
			artboard.draw(renderer);
			renderer.restore();

			// Flush renderer (required for WebGL2)
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
		if (!riveInstanceRef.current) return;

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
				maxY: canvasRef.current.height
			},
			artboard.bounds
		);

		// Draw artboard
		artboard.draw(renderer);
		renderer.restore();

		// Flush renderer (required for WebGL2)
		renderer.flush();
	};

	/**
	 * Cleanup Rive resources
	 */
	const cleanup = () => {
		// Disconnect resize observer
		if (resizeObserverRef.current) {
			resizeObserverRef.current.disconnect();
			resizeObserverRef.current = null;
		}

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

		// NOTE: We don't unref files here because they're stored in riveFileCache
		// and may be reused by other block instances in the editor.
		// Files remain cached for optimal performance across multiple blocks.
		riveFileRef.current = null;

		riveInstanceRef.current = null;
		artboardRef.current = null;
		rendererRef.current = null;
	};

	return (
		<div style={{ position: 'relative', width, height }}>
			{/* Loading indicator */}
			{isLoading && (
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
				<Notice status="error" isDismissible={false}>
					{loadError}
				</Notice>
			)}

			{/* Rive animation canvas - identical markup to frontend */}
			<canvas
				ref={canvasRef}
				style={{ width, height }}
				role={ariaLabel ? 'img' : undefined}
				aria-label={ariaLabel || undefined}
				aria-description={ariaDescription || undefined}
			/>
		</div>
	);
}
