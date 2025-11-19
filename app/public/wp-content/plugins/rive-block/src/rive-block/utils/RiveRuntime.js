/**
 * RiveRuntime - Singleton manager for Rive WASM runtime
 *
 * Ensures only one instance of the Rive runtime is loaded across the entire application.
 * Provides queue-based loading to handle multiple simultaneous requests.
 */

import RiveCanvas from '@rive-app/canvas-advanced';

class RiveRuntimeManager {
	constructor() {
		this.runtime = null;
		this.isLoading = false;
		this.callbacks = [];
		// Use unpkg CDN for WASM file - works both in development and production
		this.wasmURL = 'https://unpkg.com/@rive-app/canvas-advanced@2.32.1/rive.wasm';
	}

	/**
	 * Load the Rive runtime (singleton pattern)
	 * @private
	 */
	async loadRuntime() {
		try {
			this.runtime = await RiveCanvas({
				locateFile: () => this.wasmURL
			});

			// Execute all queued callbacks
			while (this.callbacks.length > 0) {
				const callback = this.callbacks.shift();
				if (callback) {
					callback(this.runtime);
				}
			}
		} catch (error) {
			console.error('[Rive Block] Failed to load Rive runtime:', error);
			// Reject all queued callbacks
			while (this.callbacks.length > 0) {
				this.callbacks.shift();
			}
			throw error;
		}
	}

	/**
	 * Get runtime instance via callback
	 * @param {Function} callback - Callback that receives the runtime instance
	 */
	getInstance(callback) {
		// If runtime already loaded, call immediately
		if (this.runtime) {
			callback(this.runtime);
			return;
		}

		// Add to queue
		this.callbacks.push(callback);

		// Start loading if not already loading
		if (!this.isLoading) {
			this.isLoading = true;
			this.loadRuntime();
		}
	}

	/**
	 * Get runtime instance via Promise
	 * @returns {Promise} Promise that resolves with the runtime instance
	 */
	awaitInstance() {
		return new Promise((resolve, reject) => {
			if (this.runtime) {
				resolve(this.runtime);
				return;
			}

			this.getInstance((runtime) => {
				if (runtime) {
					resolve(runtime);
				} else {
					reject(new Error('Failed to load Rive runtime'));
				}
			});
		});
	}

	/**
	 * Manually set the WASM URL (useful for custom CDN or local hosting)
	 * @param {string} url - URL to the rive.wasm file
	 */
	setWasmUrl(url) {
		if (this.runtime) {
			console.warn('[Rive Block] Runtime already loaded. WASM URL change will not take effect.');
			return;
		}
		this.wasmURL = url;
	}
}

// Export singleton instance
export const riveRuntime = new RiveRuntimeManager();
