/**
 * RiveRuntimeLoader Module
 *
 * Unified singleton for Rive runtime initialization with IndexedDB WASM caching.
 * Used by both editor (RiveCanvas) and frontend (view.js) contexts.
 * Ensures only one runtime is loaded and queues any concurrent requests.
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';
import { saveWASMBytes, loadWASMBytes } from '../storage/indexeddb/WasmCache';

/**
 * RiveRuntimeLoader - Singleton pattern for Rive runtime initialization
 *
 * Handles WASM caching via IndexedDB to improve load times.
 * Queues concurrent load requests to prevent multiple initializations.
 * Supports custom WASM URL configuration for both editor and frontend.
 */
export class RiveRuntimeLoader {
	constructor() {
		this.riveRuntime = null;
		this.isLoading = false;
		this.callbacks = [];
		this.customWasmUrl = null;
		this.logPrefix = '[Rive Block IDB]';
	}

	/**
	 * Set custom WASM URL (optional, for custom CDN or specific paths)
	 *
	 * @param {string} url - Base URL path to WASM files
	 */
	setWasmUrl( url ) {
		if ( this.riveRuntime ) {
			console.warn(
				'[Rive Block] Runtime already loaded. WASM URL change will not take effect.'
			);
			return;
		}
		this.customWasmUrl = url;
	}

	/**
	 * Set log prefix for context (editor vs frontend)
	 *
	 * @param {string} prefix - Log prefix like '[Rive Editor]' or '[Rive Block]'
	 */
	setLogPrefix( prefix ) {
		this.logPrefix = prefix;
	}

	/**
	 * Get or initialize Rive runtime (singleton)
	 *
	 * @returns {Promise<object>} Rive runtime instance
	 */
	async load() {
		if ( this.riveRuntime ) {
			return this.riveRuntime;
		}

		if ( this.isLoading ) {
			// Wait for existing load to complete
			return new Promise( ( resolve ) => {
				this.callbacks.push( resolve );
			} );
		}

		this.isLoading = true;

		try {
			// Determine WASM URL based on context
			const wasmFilename = 'webgl2_advanced.wasm';
			let baseUrl = this.customWasmUrl;

			// If no custom URL, try to get from plugin data (frontend) or use relative path (editor)
			if ( ! baseUrl ) {
				// Try frontend context first
				const pluginUrl = window.riveBlockData?.pluginUrl;
				if ( pluginUrl ) {
					baseUrl = pluginUrl.replace( /\/$/, '' );
				}
				// If no plugin URL, editor context will use relative paths
			}

			const wasmUrl = baseUrl
				? `${ baseUrl }/build/rive-block/${ wasmFilename }`
				: `build/rive-block/${ wasmFilename }`;

			// Try to load WASM bytes from IndexedDB
			const cachedBytes = await loadWASMBytes( wasmFilename, this.logPrefix );

			const startTime = performance.now();

			this.riveRuntime = await RiveWebGL2( {
				locateFile: ( file ) => {
					// Serve WASM files from appropriate location
					if ( baseUrl ) {
						return `${ baseUrl }/build/rive-block/${ file }`;
					}
					return `build/rive-block/${ file }`;
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
								console.log( `${ this.logPrefix } Compiling cached WASM bytes to module` );
							}
							module = await WebAssembly.compile( cachedBytes );
							instance = await WebAssembly.instantiate( module, imports );
						} else {
							// IDB Cache miss: Fetch bytes from network, compile to module, instantiate, then cache bytes
							if ( window.riveBlockData?.debug ) {
								console.log( `${ this.logPrefix } Fetching WASM bytes from network (first load)` );
							}

							const response = await fetch( wasmUrl );
							const wasmBytes = await response.arrayBuffer();

							// Compile bytes to WASM module and instantiate with imports
							module = await WebAssembly.compile( wasmBytes );
							instance = await WebAssembly.instantiate( module, imports );

							// Save WASM bytes to IndexedDB for next load (await to ensure transaction completes)
							await saveWASMBytes( wasmFilename, wasmBytes, this.logPrefix );
						}

						successCallback( instance, module );
						return instance.exports;
					} catch ( error ) {
						console.error( `${ this.logPrefix } WASM instantiation failed:`, error );
						throw error;
					}
				},
			} );

			const loadTime = Math.round( performance.now() - startTime );

			// Debug logging when WP_DEBUG is active
			if ( window.riveBlockData?.debug ) {
				console.log( `[Rive Block] Rive runtime loaded in ${ loadTime }ms` );
				console.log( '[Rive Block] Renderer: WebGL2-Advanced' );
				console.log( '[Rive Block] WASM caching: IndexedDB (raw bytes)' );
			}

			// Resolve any waiting callbacks
			this.callbacks.forEach( ( callback ) => callback( this.riveRuntime ) );
			this.callbacks = [];

			return this.riveRuntime;
		} catch ( error ) {
			console.error( '[Rive Block] Failed to load Rive runtime:', error );
			this.isLoading = false;
			throw error;
		}
	}
}

// Export singleton instance
export const riveRuntimeLoader = new RiveRuntimeLoader();
