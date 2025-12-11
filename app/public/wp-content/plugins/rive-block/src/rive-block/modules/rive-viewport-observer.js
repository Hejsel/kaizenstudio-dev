/**
 * RiveViewportObserver Module
 *
 * Handles viewport visibility detection for pausing/resuming animations
 * and user-friendly error message display for Rive animation failures.
 */

import {
	pauseRenderLoop,
	resumeRenderLoop,
} from '../rendering/rive-rendering-engine';

/**
 * Setup Intersection Observer to pause/resume animation based on viewport visibility
 * Implements Rive's best practice: "Pause when scrolled out of view; resume when needed"
 *
 * @param {HTMLCanvasElement} canvas - The canvas element to observe
 * @param {object} instanceData - Rive instance data
 * @see https://rive.app/docs/getting-started/best-practices#runtime-considerations
 */
export function setupViewportObserver( canvas, instanceData ) {
	const observerOptions = {
		root: null, // viewport
		rootMargin: '0px', // Trigger exactly at viewport edge
		threshold: 0.3, // At least 30% visible to keep animation running (AGGRESSIVE: minimizes GPU load)
	};

	const observer = new IntersectionObserver( ( entries ) => {
		entries.forEach( ( entry ) => {
			if ( entry.isIntersecting ) {
				// Animation entered viewport - resume rendering
				if ( window.riveBlockData?.debug ) {
					console.log(
						`[Rive Block] Resuming animation (entered viewport): ${ canvas.dataset.riveSrc }`
					);
				}
				resumeRenderLoop( instanceData );
			} else {
				// Animation left viewport - pause rendering to save GPU
				if ( window.riveBlockData?.debug ) {
					console.log(
						`[Rive Block] Pausing animation (left viewport): ${ canvas.dataset.riveSrc }`
					);
				}
				pauseRenderLoop( instanceData );
			}
		} );
	}, observerOptions );

	// Start observing the canvas
	observer.observe( canvas );

	// Store observer reference for cleanup
	instanceData.viewportObserver = observer;
}

/**
 * Display user-friendly error message when Rive fails to load
 *
 * @param {HTMLCanvasElement} canvas - Canvas element to replace
 * @param {string} message - Error message to display
 */
export function showErrorMessage( canvas, message ) {
	// Create error message container
	const errorDiv = document.createElement( 'div' );
	errorDiv.className = 'rive-block-error';
	errorDiv.style.cssText = `
		display: flex;
		align-items: center;
		justify-content: center;
		width: ${ canvas.style.width || '100%' };
		height: ${ canvas.style.height || 'auto' };
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
	if ( canvas.parentNode ) {
		canvas.parentNode.replaceChild( errorDiv, canvas );
	}
}
