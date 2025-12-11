/**
 * RiveEditorFileCache - In-memory cache for decoded Rive files in the editor
 *
 * Prevents duplicate decoding of .riv files within the block editor.
 * Unlike the frontend cache, this does NOT unref files on clear because:
 * - Files may be reused by multiple block instances in the same editor session
 * - The editor session lives for the duration of the editor use
 * - Browser cleanup handles memory management when user closes editor
 *
 * Uses MemoryCacheUtils for generic cache operations.
 */

import { MemoryCache } from '../../utils/memory-cache-utils';

const fileCache = new MemoryCache( 'rive-editor-files' );

const LOG_PREFIX = '[Rive Editor Cache]';

/**
 * Get cached Rive file (if exists)
 * @param {string} url - File URL
 * @returns {Object|null} Decoded Rive file or null
 */
export function getCachedFile( url ) {
	return fileCache.get( url ) || null;
}

/**
 * Cache a decoded Rive file
 * @param {string} url - File URL
 * @param {Object} file - Decoded Rive file object
 */
export function setCachedFile( url, file ) {
	fileCache.set( url, file );

	if ( window.riveBlockData?.debug ) {
		console.log(
			`${ LOG_PREFIX } Cached: ${ url } (${ fileCache.size() } files in cache)`
		);
	}
}

/**
 * Clear all cached files
 * NOTE: Files are NOT unreffed here because they may be reused by other
 * block instances in the editor. Cleanup happens automatically when
 * the editor session ends.
 */
export function clearCache() {
	const count = fileCache.size();
	fileCache.clear();

	if ( window.riveBlockData?.debug ) {
		console.log(
			`${ LOG_PREFIX } Cache cleared (${ count } files freed by GC)`
		);
	}
}

/**
 * Get cache statistics (for debugging)
 * @returns {Object} Cache stats object
 */
export function getCacheStats() {
	return {
		cachedFiles: fileCache.size(),
	};
}
