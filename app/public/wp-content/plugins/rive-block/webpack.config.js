const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const CopyPlugin = require( 'copy-webpack-plugin' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	plugins: [
		...defaultConfig.plugins,
		new CopyPlugin( {
			patterns: [
				{
					// Copy and rename rive.wasm to webgl2_advanced.wasm (required by Emscripten)
					// Note: WebGL2 only has one WASM file (no fallback needed for modern browsers)
					from: path.resolve(
						__dirname,
						'node_modules/@rive-app/webgl2-advanced/rive.wasm'
					),
					to: path.resolve(
						__dirname,
						'build/rive-block/webgl2_advanced.wasm'
					),
				},
				{
					// Copy Service Worker to plugin root for broader scope
					// Allows SW to cache assets from entire /wp-content/plugins/rive-block/ path
					// including .riv files from Media Library (/wp-content/uploads/)
					from: path.resolve(
						__dirname,
						'src/rive-sw.js'
					),
					to: path.resolve(
						__dirname,
						'rive-sw.js'
					),
				},
			],
		} ),
	],
};
