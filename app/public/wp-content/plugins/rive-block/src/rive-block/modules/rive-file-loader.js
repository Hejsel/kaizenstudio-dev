/* eslint-disable no-console */
/**
 * RiveFileLoader Module
 *
 * Centralized module for loading and caching Rive files.
 * Handles both editor (React) and frontend (vanilla JS) contexts
 * with configurable cache strategies.
 */

/**
 * RiveFileLoader - Service for loading and caching Rive files
 *
 * Supports multiple cache strategies by accepting cache functions as parameters.
 * Eliminates code duplication between editor and frontend implementations.
 */
export class RiveFileLoader {
	/**
	 * Initialize RiveFileLoader with cache functions and logging context
	 *
	 * @param {Function} getCachedFile - Function to retrieve cached files
	 * @param {Function} setCachedFile - Function to store files in cache
	 * @param {Function} isUrlLoaded   - Optional: Function to check if URL was previously loaded (for HTTP cache optimization)
	 * @param {string}   logPrefix     - Log prefix for console messages (e.g., '[Rive Block]')
	 */
	constructor(
		getCachedFile,
		setCachedFile,
		isUrlLoaded = null,
		logPrefix = '[Rive]'
	) {
		this.getCachedFile = getCachedFile;
		this.setCachedFile = setCachedFile;
		this.isUrlLoaded = isUrlLoaded;
		this.logPrefix = logPrefix;
	}

	/**
	 * Load and cache a Rive file
	 * Uses in-memory cache to avoid duplicate fetching and decoding of the same file
	 *
	 * @param {Object} rive - Rive runtime instance
	 * @param {string} url  - URL of the Rive file to load
	 * @return {Promise<object>} Decoded Rive file object
	 */
	async load( rive, url ) {
		// Check in-memory cache first
		const cachedFile = this.getCachedFile( url );
		if ( cachedFile ) {
			// Log cache hit when WP_DEBUG is enabled
			if ( window.riveBlockData?.debug ) {
				console.log( `${ this.logPrefix } Cache hit: ${ url }` );
			}
			return cachedFile;
		}

		// In-memory cache miss - will fetch (but may use HTTP browser cache)
		const isFirstLoad = ! this.isUrlLoaded
			? true
			: ! this.isUrlLoaded( url );

		if ( window.riveBlockData?.debug ) {
			console.log(
				`${ this.logPrefix } In-memory cache miss, fetching: ${ url }`
			);
			if ( this.isUrlLoaded ) {
				console.log(
					`${ this.logPrefix } Note: Browser HTTP cache may serve this without network transfer`
				);
			}
		}

		// Choose cache mode based on loading priority AND whether file has been loaded before:
		// - First time loading URL: 'default' (respect HTTP cache, may download)
		// - Subsequent loads: 'force-cache' (use browser HTTP cache aggressively)
		// This ensures browser cache is used after first load, maximizing performance
		let cacheMode = 'default';
		if ( this.isUrlLoaded && ! isFirstLoad ) {
			cacheMode = 'force-cache';
		}

		const response = await fetch( url, { cache: cacheMode } );
		if ( ! response.ok ) {
			throw new Error( `Failed to fetch: ${ response.statusText }` );
		}

		// Check if HTTP cache was used by examining response timing
		if ( window.riveBlockData?.debug ) {
			// Use Performance API to check if cached (transferSize = 0 means cached)
			const perfEntries = performance.getEntriesByName( url, 'resource' );
			const latestEntry = perfEntries[ perfEntries.length - 1 ];
			if ( latestEntry && latestEntry.transferSize === 0 ) {
				console.log(
					`${ this.logPrefix } ✓ HTTP cache hit (0 bytes transferred): ${ url }`
				);
			} else if ( latestEntry ) {
				console.log(
					`${ this.logPrefix } ↓ Downloaded ${ latestEntry.transferSize } bytes: ${ url }`
				);
			}
		}

		const arrayBuffer = await response.arrayBuffer();
		const fileBytes = new Uint8Array( arrayBuffer );

		// Decode Rive file
		const file = await rive.load( fileBytes );

		// Store in cache for future reuse
		this.setCachedFile( url, file );

		if ( window.riveBlockData?.debug ) {
			console.log( `${ this.logPrefix } Successfully loaded: ${ url }` );
		}

		return file;
	}
}
