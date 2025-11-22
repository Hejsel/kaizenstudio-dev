/**
 * RiveRuntime - Singleton manager for Rive WASM runtime (WebGL2)
 *
 * Ensures only one instance of the Rive runtime is loaded across the entire application.
 * Provides queue-based loading to handle multiple simultaneous requests.
 *
 * Uses @rive-app/webgl2-advanced for Rive Renderer support (required for vector feathering).
 */

import RiveWebGL2 from '@rive-app/webgl2-advanced';

class RiveRuntimeManager {
	constructor() {
		this.runtime = null;
		this.isLoading = false;
		this.callbacks = [];
		// Use unpkg CDN for WASM file - works both in development and production
		this.wasmURL = 'https://unpkg.com/@rive-app/webgl2-advanced@2.32.1/rive.wasm';
	}

	/**
	 * Load the Rive runtime (singleton pattern)
	 * @private
	 */
	async loadRuntime() {
		try {
			this.runtime = await RiveWebGL2({
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
			console.error('[Rive Block] Failed to load Rive runtime (WebGL2):', error);
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
					reject(new Error('Failed to load Rive runtime (WebGL2)'));
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

	/**
	 * Check if WebGL2 is supported in the current browser
	 * @returns {boolean} True if WebGL2 is supported
	 */
	isWebGL2Supported() {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl2');
		return !!gl;
	}
}

// Export singleton instance
export const riveRuntime = new RiveRuntimeManager();
