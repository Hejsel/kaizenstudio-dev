const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

module.exports = {
	...defaultConfig,
	plugins: [
		...defaultConfig.plugins,
		new CopyPlugin({
			patterns: [
				{
					// Copy and rename rive.wasm to canvas_advanced.wasm (required by Emscripten)
					from: path.resolve(__dirname, 'node_modules/@rive-app/canvas-advanced/rive.wasm'),
					to: path.resolve(__dirname, 'build/rive-block/canvas_advanced.wasm'),
				},
				{
					// Copy and rename rive_fallback.wasm (for older browsers without SIMD)
					from: path.resolve(__dirname, 'node_modules/@rive-app/canvas-advanced/rive_fallback.wasm'),
					to: path.resolve(__dirname, 'build/rive-block/canvas_advanced_fallback.wasm'),
				},
			],
		}),
	],
};
