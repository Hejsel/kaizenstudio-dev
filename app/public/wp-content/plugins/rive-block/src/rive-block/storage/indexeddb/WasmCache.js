/**
 * WasmCache - IndexedDB helper for WASM bytes caching
 *
 * Shared between frontend (view.js) and editor (RiveRuntime.js).
 * Stores raw WASM bytes (ArrayBuffer) to skip network download on subsequent loads.
 *
 * Uses IndexedDBUtils for generic database operations.
 * Note: WebAssembly.Module cannot be stored due to browser security restrictions.
 */

import { openDatabase, saveToStore, loadFromStore } from '../../utils/IndexedDBUtils';

const DB_NAME = 'rive-block-wasm-cache';
const DB_VERSION = 2;
const STORE_NAME = 'wasm-bytes';

// Singleton database instance
let dbInstance = null;

/**
 * Get database instance (singleton pattern)
 * @returns {Promise<IDBDatabase>}
 */
async function getDatabase() {
	if ( dbInstance ) {
		return dbInstance;
	}

	dbInstance = await openDatabase( DB_NAME, DB_VERSION, ( db ) => {
		// Delete old store from previous version (if exists)
		if ( db.objectStoreNames.contains( 'compiled-modules' ) ) {
			db.deleteObjectStore( 'compiled-modules' );
		}

		// Create new store for current version
		if ( ! db.objectStoreNames.contains( STORE_NAME ) ) {
			db.createObjectStore( STORE_NAME, { keyPath: 'filename' } );
			if ( window.riveBlockData?.debug ) {
				console.log( `[Rive IDB] Database upgraded to v${ DB_VERSION } (raw bytes storage)` );
			}
		}
	} );

	return dbInstance;
}

/**
 * Save WASM bytes to IndexedDB
 * @param {string} filename - WASM filename (e.g., 'webgl2_advanced.wasm')
 * @param {ArrayBuffer} wasmBytes - Raw WASM bytes
 * @param {string} logPrefix - Prefix for debug logs (default: '[Rive IDB]')
 */
export async function saveWASMBytes( filename, wasmBytes, logPrefix = '[Rive IDB]' ) {
	try {
		const db = await getDatabase();

		const data = {
			filename,
			bytes: wasmBytes, // ArrayBuffer is structured-cloneable
			timestamp: Date.now(),
		};

		await saveToStore( db, STORE_NAME, data, logPrefix );

		if ( window.riveBlockData?.debug ) {
			const sizeKB = Math.round( wasmBytes.byteLength / 1024 );
			console.log( `${ logPrefix } Saved WASM bytes: ${ filename } (${ sizeKB } KB)` );
		}
	} catch ( error ) {
		console.error( `${ logPrefix } Failed to save WASM bytes:`, error );
	}
}

/**
 * Load WASM bytes from IndexedDB
 * @param {string} filename - WASM filename
 * @param {string} logPrefix - Prefix for debug logs (default: '[Rive IDB]')
 * @returns {Promise<ArrayBuffer|null>} Raw WASM bytes or null if not cached
 */
export async function loadWASMBytes( filename, logPrefix = '[Rive IDB]' ) {
	try {
		const db = await getDatabase();
		const data = await loadFromStore( db, STORE_NAME, filename, logPrefix );

		if ( data && data.bytes ) {
			if ( window.riveBlockData?.debug ) {
				const age = Math.round( ( Date.now() - data.timestamp ) / 1000 );
				const sizeKB = Math.round( data.bytes.byteLength / 1024 );
				console.log( `${ logPrefix } Loaded WASM bytes: ${ filename } (${ sizeKB } KB, cached ${ age }s ago)` );
			}
			return data.bytes;
		}

		return null;
	} catch ( error ) {
		console.error( `${ logPrefix } Failed to load WASM bytes:`, error );
		return null;
	}
}
