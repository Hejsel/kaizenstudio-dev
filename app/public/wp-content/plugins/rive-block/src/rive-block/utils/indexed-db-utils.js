/**
 * IndexedDBUtils - Generelle IndexedDB hjælpefunktioner
 *
 * Kan bruges til forskellige cache-typer (WASM, Rive files, fonts, etc.)
 * Hver specific cache kan have sin egen database og upgrade logic.
 */

/**
 * Open or create IndexedDB database
 * @param {string} dbName - Database name
 * @param {number} dbVersion - Database version
 * @param {Function} onUpgradeNeeded - Callback for schema upgrade (receives db instance and event)
 * @returns {Promise<IDBDatabase>} Database instance
 */
export async function openDatabase( dbName, dbVersion, onUpgradeNeeded ) {
	return new Promise( ( resolve, reject ) => {
		const request = indexedDB.open( dbName, dbVersion );

		request.onerror = () => reject( request.error );
		request.onsuccess = () => resolve( request.result );

		if ( onUpgradeNeeded ) {
			request.onupgradeneeded = ( event ) => {
				onUpgradeNeeded( event.target.result, event );
			};
		}
	} );
}

/**
 * Save data to object store
 * @param {IDBDatabase} db - Database instance
 * @param {string} storeName - Object store name
 * @param {Object} data - Data to save
 * @param {string} logPrefix - Log prefix for debug messages (default: '[IDB]')
 * @returns {Promise<void>}
 */
export async function saveToStore( db, storeName, data, logPrefix = '[IDB]' ) {
	if ( window.riveBlockData?.debug ) {
		console.log( `${ logPrefix } Starting save to store: ${ storeName }` );
	}

	try {
		const transaction = db.transaction( [ storeName ], 'readwrite' );
		const store = transaction.objectStore( storeName );

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
			console.log( `${ logPrefix } Saved to store: ${ storeName }` );
		}
	} catch ( error ) {
		console.error( `${ logPrefix } Failed to save to store:`, error );
		throw error;
	}
}

/**
 * Load data from object store
 * @param {IDBDatabase} db - Database instance
 * @param {string} storeName - Object store name
 * @param {string} key - Key to retrieve
 * @param {string} logPrefix - Log prefix for debug messages (default: '[IDB]')
 * @returns {Promise<any|null>} Retrieved data or null if not found
 */
export async function loadFromStore( db, storeName, key, logPrefix = '[IDB]' ) {
	try {
		const transaction = db.transaction( [ storeName ], 'readonly' );
		const store = transaction.objectStore( storeName );

		const data = await new Promise( ( resolve, reject ) => {
			const request = store.get( key );
			request.onsuccess = () => resolve( request.result );
			request.onerror = () => reject( request.error );
		} );

		if ( data ) {
			if ( window.riveBlockData?.debug ) {
				console.log(
					`${ logPrefix } Loaded from store: ${ storeName }`
				);
			}
			return data;
		}

		if ( window.riveBlockData?.debug ) {
			console.log(
				`${ logPrefix } Data not found in store: ${ storeName }`
			);
		}
		return null;
	} catch ( error ) {
		console.error( `${ logPrefix } Failed to load from store:`, error );
		return null;
	}
}
