/* eslint-disable no-console */
/**
 * MemoryCacheUtils - Generelle in-memory cache helpers
 *
 * Kan bruges til forskellige cache-typer (Rive files, fonts, config, etc.)
 * Eksporterer generiske cache-klasser som kan instantieres for forskellige formål.
 */

/**
 * Simple in-memory cache med Map
 * Grundlæggende nøgle-værdi cache.
 */
export class MemoryCache {
	constructor( name = 'cache' ) {
		this.name = name;
		this.cache = new Map();
	}

	/**
	 * Check if key exists in cache
	 * @param {string} key
	 * @return {boolean} True if key exists in cache
	 */
	has( key ) {
		return this.cache.has( key );
	}

	/**
	 * Get value from cache
	 * @param {string} key
	 * @return {*} Cached value or undefined
	 */
	get( key ) {
		return this.cache.get( key );
	}

	/**
	 * Set value in cache
	 * @param {string} key
	 * @param {*}      value
	 */
	set( key, value ) {
		this.cache.set( key, value );
	}

	/**
	 * Delete value from cache
	 * @param {string} key
	 * @return {boolean} True if key was deleted
	 */
	delete( key ) {
		return this.cache.delete( key );
	}

	/**
	 * Clear all cached values
	 */
	clear() {
		this.cache.clear();
	}

	/**
	 * Get number of cached items
	 * @return {number} Number of items in cache
	 */
	size() {
		return this.cache.size;
	}
}

/**
 * Tracker Set - holder styr på hvilke keys der er blevet loaded
 * Bruges til at optimere cache-strategi (f.eks. HTTP cache mode).
 */
export class LoadedTracker {
	constructor( name = 'tracker' ) {
		this.name = name;
		this.loaded = new Set();
	}

	/**
	 * Check if key has been loaded before
	 * @param {string} key
	 * @return {boolean} True if key has been loaded
	 */
	has( key ) {
		return this.loaded.has( key );
	}

	/**
	 * Mark key as loaded
	 * @param {string} key
	 */
	add( key ) {
		this.loaded.add( key );
	}

	/**
	 * Clear all tracked keys
	 */
	clear() {
		this.loaded.clear();
	}

	/**
	 * Get number of tracked keys
	 * @return {number} Number of tracked keys
	 */
	size() {
		return this.loaded.size;
	}
}
