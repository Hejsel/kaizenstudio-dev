/**
 * RiveRuntime - Singleton manager for Rive WASM runtime
 *
 * Ensures only one instance of the Rive runtime is loaded across the entire application.
 * Provides queue-based loading to handle multiple simultaneous requests.
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';

class RiveRuntimeManager {
	constructor() {
		this.runtime = null;
		this.isLoading = false;
		this.callbacks = [];
		// WASM URL will be set dynamically based on WordPress plugin URL
		this.wasmURL = null;
	}

	/**
	 * Load the Rive runtime (singleton pattern)
	 * @private
	 */
	async loadRuntime() {
		try {
			this.runtime = await RiveWebGL2({
				locateFile: (file) => {
					// If custom WASM URL is set, use it
					if (this.wasmURL) {
						return `${this.wasmURL}/${file}`;
					}
					// Fallback to default path
					return file;
				}
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
	 * Manually set the WASM base URL (useful for custom CDN or local hosting)
	 * @param {string} url - Base URL path to WASM files (without filename)
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
