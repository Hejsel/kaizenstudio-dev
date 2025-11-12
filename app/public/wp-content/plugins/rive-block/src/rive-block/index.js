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

// Custom Rive icon
const riveIcon = (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150">
		<path
			fillRule="evenodd"
			d="M19.18,23.33a7.46,7.46,0,0,0,7.5,7.42H88.84c20.52-1.39,33.1,24.78,17.5,38.65q-6.87,5.88-17.5,5.87h-27a7.43,7.43,0,1,0,0,14.85c.94,0,30.07,0,29.83,0l26.87,42.66a7.92,7.92,0,0,0,7,3.87c6.85.23,10-6.88,6.25-12.37l-23.9-38c37.3-17.51,21.54-71.94-19.07-70.34H26.68A7.47,7.47,0,0,0,19.18,23.33Z"
			transform="translate(0 -0.2)"
		/>
	</svg>
);

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
