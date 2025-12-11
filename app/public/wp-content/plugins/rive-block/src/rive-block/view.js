/**
 * Frontend JavaScript for Rive Block
 *
 * Uses @rive-app/webgl2-advanced for full control over Rive runtime with WebGL2 support.
 * Implements shared renderer pattern for optimal performance with multiple blocks.
 * Supports vector feathering and advanced rendering features.
 */

import {
	getCachedFile,
	setCachedFile,
	isUrlLoaded,
} from './storage/memory/rive-file-cache';
import { RiveFileLoader } from './modules/rive-file-loader';
import { RiveAnimationManager } from './modules/rive-animation-manager';
import { riveRuntimeLoader } from './modules/rive-runtime-loader';

// Set log prefix for runtime loader (frontend context)
riveRuntimeLoader.setLogPrefix( '[Rive Block IDB]' );

// Initialize file loader with frontend cache and URL tracking
const fileLoader = new RiveFileLoader(
	getCachedFile,
	setCachedFile,
	isUrlLoaded,
	'[Rive Block]'
);

// Initialize animation manager
const animationManager = new RiveAnimationManager( fileLoader );

// Initialize when DOM is ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () =>
		animationManager.initialize()
	);
} else {
	animationManager.initialize();
}

// Re-initialize when page is restored from bfcache (back/forward cache)
// This handles browser back/forward button navigation where DOMContentLoaded doesn't fire
window.addEventListener( 'pageshow', ( event ) => {
	if ( event.persisted ) {
		// Page was restored from bfcache
		if ( window.riveBlockData?.debug ) {
			console.log(
				'[Rive Block] Page restored from bfcache, re-initializing animations'
			);
		}
		animationManager.initialize();
	}
} );

// NOTE: We do NOT cleanup on pagehide/beforeunload anymore!
// Reason: These events fire on normal page reloads (Ctrl+R), which would
// clear the in-memory cache that we want to preserve.
//
// Instead, cleanup happens conditionally in initRiveAnimations():
// - Navigation to different page: cleanup + clear cache
// - Same page reload: preserve cache for instant loading
//
// This achieves the best of both worlds:
// 1. In-memory cache works for same-page reloads
// 2. No stale WASM references when navigating to different pages
