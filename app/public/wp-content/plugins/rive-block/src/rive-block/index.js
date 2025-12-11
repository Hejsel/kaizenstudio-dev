/**
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * All files containing `style` keyword are bundled together. The code used
 * gets applied both to the front of your site and to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './style.scss';

/**
 * Internal dependencies
 */
import Edit from './edit';
import metadata from './block.json';
import riveIcon from './icon';
import { riveRuntimeLoader } from './modules/rive-runtime-loader';

/**
 * Set WASM URL for editor from localized script data
 * This must happen before any blocks attempt to load the Rive runtime
 */
if ( window.riveBlockData?.pluginUrl ) {
	const baseUrl = window.riveBlockData.pluginUrl.replace( /\/$/, '' );
	riveRuntimeLoader.setWasmUrl( `${ baseUrl }/build/rive-block` );
}

/**
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
registerBlockType( metadata.name, {
	/**
	 * @see ./edit.js
	 */
	icon: riveIcon,
	edit: Edit,
} );
