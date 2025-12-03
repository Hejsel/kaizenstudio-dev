/**
 * RiveRuntime - Singleton manager for Rive WASM runtime
 *
 * Ensures only one instance of the Rive runtime is loaded across the entire application.
 * Provides queue-based loading to handle multiple simultaneous requests.
 * Uses IndexedDB to cache compiled WASM modules for ~85ms faster initialization.
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';

/**
 * IndexedDB Helper: Open or create database for WASM module caching
 * Stores compiled WebAssembly.Module objects for instant initialization
 */
const DB_NAME = 'rive-block-wasm-cache';
const DB_VERSION = 1;
const STORE_NAME = 'compiled-modules';

async function openWASMDatabase() {
	return new Promise( ( resolve, reject ) => {
		const request = indexedDB.open( DB_NAME, DB_VERSION );

		request.onerror = () => reject( request.error );
		request.onsuccess = () => resolve( request.result );

		request.onupgradeneeded = ( event ) => {
			const db = event.target.result;
			if ( ! db.objectStoreNames.contains( STORE_NAME ) ) {
				// Create object store with filename as key
				db.createObjectStore( STORE_NAME, { keyPath: 'filename' } );
				if ( window.riveBlockData?.debug ) {
					console.log( '[Rive Editor IDB] Database created' );
				}
			}
		};
	} );
}

/**
 * IndexedDB Helper: Save compiled WASM module
 */
async function saveCompiledWASM( filename, module ) {
	try {
		const db = await openWASMDatabase();
		const transaction = db.transaction( [ STORE_NAME ], 'readwrite' );
		const store = transaction.objectStore( STORE_NAME );

		const data = {
			filename,
			module, // WebAssembly.Module is structured-cloneable!
			timestamp: Date.now(),
		};

		await new Promise( ( resolve, reject ) => {
			const request = store.put( data );
			request.onsuccess = () => resolve();
			request.onerror = () => reject( request.error );
		} );

		if ( window.riveBlockData?.debug ) {
			console.log( '[Rive Editor IDB] Saved compiled WASM:', filename );
		}

		db.close();
	} catch ( error ) {
		console.error( '[Rive Editor IDB] Failed to save compiled WASM:', error );
	}
}

/**
 * IndexedDB Helper: Load compiled WASM module
 */
async function loadCompiledWASM( filename ) {
	try {
		const db = await openWASMDatabase();
		const transaction = db.transaction( [ STORE_NAME ], 'readonly' );
		const store = transaction.objectStore( STORE_NAME );

		const data = await new Promise( ( resolve, reject ) => {
			const request = store.get( filename );
			request.onsuccess = () => resolve( request.result );
			request.onerror = () => reject( request.error );
		} );

		db.close();

		if ( data && data.module ) {
			if ( window.riveBlockData?.debug ) {
				const age = Math.round( ( Date.now() - data.timestamp ) / 1000 );
				console.log( `[Rive Editor IDB] Loaded compiled WASM: ${ filename } (cached ${ age }s ago)` );
			}
			return data.module;
		}

		return null;
	} catch ( error ) {
		console.error( '[Rive Editor IDB] Failed to load compiled WASM:', error );
		return null;
	}
}

class RiveRuntimeLoader {
	constructor() {
		this.runtime = null;
		this.isLoading = false;
		this.callBackQueue = [];
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

			// Try to load compiled WASM from IndexedDB
			const compiledModule = await loadCompiledWASM( wasmFilename );

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
				// Custom WASM instantiation for IndexedDB caching
				instantiateWasm: async ( imports, successCallback ) => {
					try {
						let instance;

						if ( compiledModule ) {
							// IDB Cache hit: Instantiate from cached compiled module (~30ms)
							if ( window.riveBlockData?.debug ) {
								console.log( '[Rive Editor IDB] Using cached compiled WASM' );
							}
							instance = await WebAssembly.instantiate( compiledModule, imports );
						} else {
							// IDB Cache miss: Compile + instantiate + cache for next time
							if ( window.riveBlockData?.debug ) {
								console.log( '[Rive Editor IDB] Compiling WASM (first load)' );
							}

							const response = await fetch( wasmUrl );
							const { instance: wasmInstance, module } = await WebAssembly.instantiateStreaming( response, imports );
							instance = wasmInstance;

							// Save compiled module to IndexedDB for next load (don't await)
							saveCompiledWASM( wasmFilename, module )
								.catch( ( error ) => {
									console.error( '[Rive Editor IDB] Failed to cache compiled WASM:', error );
								} );
						}

						successCallback( instance, compiledModule || undefined );
						return instance.exports;
					} catch ( error ) {
						console.error( '[Rive Editor IDB] WASM instantiation failed:', error );
						throw error;
					}
				},
			} );

			const loadTime = Math.round( performance.now() - startTime );

			// Debug logging when WP_DEBUG is active
			if ( window.riveBlockData?.debug ) {
				console.log( `[Rive Editor] Rive runtime loaded in ${ loadTime }ms` );
				console.log( '[Rive Editor] Renderer: WebGL2-Advanced' );
				console.log( '[Rive Editor] WASM caching: IndexedDB (compiled modules)' );
			}

			// Execute all queued callbacks
			while ( this.callBackQueue.length > 0 ) {
				const callback = this.callBackQueue.shift();
				if ( callback ) {
					callback( this.runtime );
				}
			}
		} catch ( error ) {
			console.error( '[Rive Block] Failed to load Rive runtime:', error );
			// Reject all queued callbacks
			while ( this.callBackQueue.length > 0 ) {
				this.callBackQueue.shift();
			}
			throw error;
		}
	}

	/**
	 * Get runtime instance via callback
	 * @param {Function} callback - Callback that receives the runtime instance
	 */
	getInstance( callback ) {
		// If runtime already loaded, call immediately
		if ( this.runtime ) {
			callback( this.runtime );
			return;
		}

		// Add to queue
		this.callBackQueue.push( callback );

		// Start loading if not already loading
		if ( ! this.isLoading ) {
			this.isLoading = true;
			this.loadRuntime();
		}
	}

	/**
	 * Get runtime instance via Promise
	 * @returns {Promise} Promise that resolves with the runtime instance
	 */
	awaitInstance() {
		return new Promise( ( resolve, reject ) => {
			if ( this.runtime ) {
				resolve( this.runtime );
				return;
			}

			this.getInstance( ( runtime ) => {
				if ( runtime ) {
					resolve( runtime );
				} else {
					reject( new Error( 'Failed to load Rive runtime' ) );
				}
			} );
		} );
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
