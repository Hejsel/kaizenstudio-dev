/* eslint-disable no-console */
/**
 * RiveFileCache - In-memory cache for decoded Rive files
 *
 * Prevents duplicate decoding of .riv files on the same page.
 * Automatically unrefs WASM objects when cleared.
 *
 * Uses MemoryCacheUtils for generic cache operations.
 */

import { MemoryCache, LoadedTracker } from '../../utils/memory-cache-utils';

const fileCache = new MemoryCache( 'rive-files' );
const loadedUrls = new LoadedTracker( 'rive-urls' );

const LOG_PREFIX = '[Rive Memory Cache]';

/**
 * Get cached Rive file (if exists)
 * @param {string} url - File URL
 * @return {Object|null} Decoded Rive file or null
 */
export function getCachedFile( url ) {
	return fileCache.get( url ) || null;
}

/**
 * Cache a decoded Rive file
 * @param {string} url  - File URL
 * @param {Object} file - Decoded Rive file object
 */
export function setCachedFile( url, file ) {
	fileCache.set( url, file );
	loadedUrls.add( url );

	if ( window.riveBlockData?.debug ) {
		console.log(
			`${ LOG_PREFIX } Cached: ${ url } (${ fileCache.size() } files in cache)`
		);
	}
}

/**
 * Check if URL has been loaded before
 * @param {string} url - File URL
 * @return {boolean} Whether the URL has been loaded
 */
export function isUrlLoaded( url ) {
	return loadedUrls.has( url );
}

/**
 * Clear all cached files and unref WASM objects
 * Called when navigating to a different page
 */
export function clearCache() {
	fileCache.cache.forEach( ( file, url ) => {
		try {
			file.unref();
			if ( window.riveBlockData?.debug ) {
				console.log( `${ LOG_PREFIX } Unreffed: ${ url }` );
			}
		} catch ( error ) {
			console.warn( `${ LOG_PREFIX } Error unreffing ${ url }:`, error );
		}
	} );

	fileCache.clear();
	loadedUrls.clear();

	if ( window.riveBlockData?.debug ) {
		console.log( `${ LOG_PREFIX } Cache cleared` );
	}
}

/**
 * Get cache statistics (for debugging)
 * @return {Object} Cache stats object
 */
export function getCacheStats() {
	return {
		cachedFiles: fileCache.size(),
		loadedUrls: loadedUrls.size(),
	};
}
