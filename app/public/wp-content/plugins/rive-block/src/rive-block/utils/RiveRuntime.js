/**
 * RiveRuntime - Singleton manager for Rive WASM runtime
 *
 * Ensures only one instance of the Rive runtime is loaded across the entire application.
 * Provides queue-based loading to handle multiple simultaneous requests.
 * Uses IndexedDB to cache compiled WASM modules for ~85ms faster initialization.
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';

/**
 * IndexedDB Helper: Open or create database for WASM bytes caching
 * Stores raw WASM bytes (ArrayBuffer) to skip network download
 * Note: WebAssembly.Module cannot be stored due to browser security restrictions
 */
const DB_NAME = 'rive-block-wasm-cache';
const DB_VERSION = 2;
const STORE_NAME = 'wasm-bytes';

async function openWASMDatabase() {
	return new Promise( ( resolve, reject ) => {
		const request = indexedDB.open( DB_NAME, DB_VERSION );

		request.onerror = () => reject( request.error );
		request.onsuccess = () => resolve( request.result );

		request.onupgradeneeded = ( event ) => {
			const db = event.target.result;

			// Delete old store from v1 (if exists)
			if ( db.objectStoreNames.contains( 'compiled-modules' ) ) {
				db.deleteObjectStore( 'compiled-modules' );
			}

			// Create new store for v2
			if ( ! db.objectStoreNames.contains( STORE_NAME ) ) {
				// Create object store with filename as key
				db.createObjectStore( STORE_NAME, { keyPath: 'filename' } );
				if ( window.riveBlockData?.debug ) {
					console.log( '[Rive Editor IDB] Database upgraded to v2 (raw bytes storage)' );
				}
			}
		};
	} );
}

/**
 * IndexedDB Helper: Save WASM bytes
 * @param {string} filename - WASM filename (e.g., 'webgl2_advanced.wasm')
 * @param {ArrayBuffer} wasmBytes - Raw WASM bytes
 */
async function saveWASMBytes( filename, wasmBytes ) {
	if ( window.riveBlockData?.debug ) {
		console.log( `[Rive Editor IDB] Starting save: ${ filename }` );
	}

	try {
		const db = await openWASMDatabase();
		const transaction = db.transaction( [ STORE_NAME ], 'readwrite' );
		const store = transaction.objectStore( STORE_NAME );

		const data = {
			filename,
			bytes: wasmBytes, // ArrayBuffer is structured-cloneable
			timestamp: Date.now(),
		};

		// Wait for the put operation to complete
		const request = store.put( data );

		await new Promise( ( resolve, reject ) => {
			request.onsuccess = () => {
				// Request succeeded, now wait for transaction to commit
			};
			request.onerror = () => reject( request.error );

			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject( transaction.error );
		} );

		if ( window.riveBlockData?.debug ) {
			const sizeKB = Math.round( wasmBytes.byteLength / 1024 );
			console.log( `[Rive Editor IDB] Saved WASM bytes: ${ filename } (${ sizeKB } KB)` );
		}

		db.close();
	} catch ( error ) {
		console.error( '[Rive Editor IDB] Failed to save WASM bytes:', error );
	}
}

/**
 * IndexedDB Helper: Load WASM bytes
 * @param {string} filename - WASM filename
 * @returns {ArrayBuffer|null} Raw WASM bytes or null if not cached
 */
async function loadWASMBytes( filename ) {
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

		if ( data && data.bytes ) {
			if ( window.riveBlockData?.debug ) {
				const age = Math.round( ( Date.now() - data.timestamp ) / 1000 );
				const sizeKB = Math.round( data.bytes.byteLength / 1024 );
				console.log( `[Rive Editor IDB] Loaded WASM bytes: ${ filename } (${ sizeKB } KB, cached ${ age }s ago)` );
			}
			return data.bytes;
		}

		return null;
	} catch ( error ) {
		console.error( '[Rive Editor IDB] Failed to load WASM bytes:', error );
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

			// Try to load WASM bytes from IndexedDB
			const cachedBytes = await loadWASMBytes( wasmFilename );

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
						let module;

						if ( cachedBytes ) {
							// IDB Cache hit: Compile from cached bytes + instantiate
							if ( window.riveBlockData?.debug ) {
								console.log( '[Rive Editor IDB] Compiling from cached WASM bytes' );
							}
							module = await WebAssembly.compile( cachedBytes );
							instance = await WebAssembly.instantiate( module, imports );
						} else {
							// IDB Cache miss: Fetch + compile + instantiate + cache bytes
							if ( window.riveBlockData?.debug ) {
								console.log( '[Rive Editor IDB] Fetching and compiling WASM (first load)' );
							}

							const response = await fetch( wasmUrl );
							const wasmBytes = await response.arrayBuffer();

							// Compile and instantiate
							module = await WebAssembly.compile( wasmBytes );
							instance = await WebAssembly.instantiate( module, imports );

						// Save WASM bytes to IndexedDB for next load (await to ensure transaction completes)
						await saveWASMBytes( wasmFilename, wasmBytes );
						}

						successCallback( instance, module );
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
				console.log( '[Rive Editor] WASM caching: IndexedDB (raw bytes)' );
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
