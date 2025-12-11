/**
 * RiveRuntime - Singleton manager for Rive WASM runtime
 *
 * Ensures only one instance of the Rive runtime is loaded across the entire application.
 * Provides queue-based loading to handle multiple simultaneous requests.
 * Uses IndexedDB to cache compiled WASM modules for ~85ms faster initialization.
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';
import { saveWASMBytes, loadWASMBytes } from '../storage/indexeddb/WasmCache';

// Log prefix for editor context
const LOG_PREFIX = '[Rive Editor IDB]';

class RiveRuntimeLoader {
	constructor() {
		this.runtime = null;
		this.isLoading = false;
		this.loadPromise = null;
		// WASM URL will be set dynamically based on WordPress plugin URL
		this.wasmURL = null;
	}

	/**
	 * Load the Rive runtime (singleton pattern)
	 * Uses IndexedDB to cache compiled WASM modules for ~85ms faster initialization
	 * @private
	 */
	async loadRuntime() {
		try {
			const wasmFilename = 'webgl2_advanced.wasm';
			const wasmUrl = this.wasmURL ? `${ this.wasmURL }/${ wasmFilename }` : wasmFilename;

			// Try to load WASM bytes from IndexedDB
			const cachedBytes = await loadWASMBytes( wasmFilename, LOG_PREFIX );

			const startTime = performance.now();

			this.runtime = await RiveWebGL2( {
				locateFile: ( file ) => {
					// If custom WASM URL is set, use it
					if ( this.wasmURL ) {
						return `${ this.wasmURL }/${ file }`;
					}
					// Fallback to default path
					return file;
				},
				// Custom WASM instantiation with IndexedDB caching
				// Handles both cache hits (compile from cached bytes) and misses (fetch from network)
				instantiateWasm: async ( imports, successCallback ) => {
					try {
						let instance;
						let module;

						if ( cachedBytes ) {
							// IDB Cache hit: Compile bytes to module + instantiate
							if ( window.riveBlockData?.debug ) {
								console.log( `${ LOG_PREFIX } Compiling cached WASM bytes to module` );
							}
							module = await WebAssembly.compile( cachedBytes );
							instance = await WebAssembly.instantiate( module, imports );
						} else {
							// IDB Cache miss: Fetch bytes from network, compile to module, instantiate, then cache bytes
							if ( window.riveBlockData?.debug ) {
								console.log( `${ LOG_PREFIX } Fetching WASM bytes from network (first load)` );
							}

							const response = await fetch( wasmUrl );
							const wasmBytes = await response.arrayBuffer();

							// Compile bytes to WASM module and instantiate with imports
							module = await WebAssembly.compile( wasmBytes );
							instance = await WebAssembly.instantiate( module, imports );

							// Save WASM bytes to IndexedDB for next load (await to ensure transaction completes)
							await saveWASMBytes( wasmFilename, wasmBytes, LOG_PREFIX );
						}

						successCallback( instance, module );
						return instance.exports;
					} catch ( error ) {
						console.error( `${ LOG_PREFIX } WASM instantiation failed:`, error );
						throw error;
					}
				},
			} );

			const loadTime = Math.round( performance.now() - startTime );

			// Debug logging when WP_DEBUG is active
			if ( window.riveBlockData?.debug ) {
				console.log( `[Rive Editor] Rive runtime loaded in ${ loadTime }ms` );
				console.log( '[Rive Editor] Renderer: WebGL2-Advanced' );
				console.log( '[Rive Editor] WASM caching: IndexedDB (raw bytes)' );
			}
		} catch ( error ) {
			console.error( '[Rive Block] Failed to load Rive runtime:', error );
			throw error;
		}
	}

	/**
	 * Get runtime instance via Promise
	 * @returns {Promise} Promise that resolves with the runtime instance
	 */
	awaitInstance() {
		if ( this.runtime ) {
			return Promise.resolve( this.runtime );
		}

		// Reuse the same promise if already loading
		if ( ! this.loadPromise ) {
			this.loadPromise = ( async () => {
				if ( ! this.isLoading ) {
					this.isLoading = true;
					await this.loadRuntime();
				}
				return this.runtime;
			} )();
		}

		return this.loadPromise;
	}

	/**
	 * Manually set the WASM base URL (useful for custom CDN or local hosting)
	 * @param {string} url - Base URL path to WASM files (without filename)
	 */
	setWasmUrl( url ) {
		if ( this.runtime ) {
			console.warn(
				'[Rive Block] Runtime already loaded. WASM URL change will not take effect.'
			);
			return;
		}
		this.wasmURL = url;
	}
}

// Export singleton instance
export const riveRuntime = new RiveRuntimeLoader();
