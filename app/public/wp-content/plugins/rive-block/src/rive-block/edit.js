/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { 
	InspectorControls,
	useBlockProps
} from '@wordpress/block-editor';

import { 
	PanelBody,
	FormFileUpload,
	__experimentalToolsPanel as ToolsPanel,
  	__experimentalToolsPanelItem as ToolsPanelItem,
  	__experimentalUnitControl as UnitControl
} from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {

	const { width } = attributes;

	return (
		<>
			<InspectorControls>
				<ToolsPanel
                    label={__("Settings", "rive-block")}
                    resetAll={() => {
                        setAttributes({ width: undefined });
                    }}
                >
                    <ToolsPanelItem
                        hasValue={() => !!width}
                        label={__("Width", "rive-block")}
                        onDeselect={() => setAttributes({ width: undefined })}
                        isShownByDefault
                    >
                        <UnitControl
                            label={__("Width", "rive-block")}
                            value={width}
                            onChange={(value) => setAttributes({ width: value })}
							units={[
								{ value: 'px', label: 'px' },
								{ value: '%', label: '%' },
								{ value: 'em', label: 'em' },
								{ value: 'rem', label: 'rem' },
								{ value: 'vw', label: 'vw' },
								{ value: 'vh', label: 'vh' },
								{ value: 'dvh', label: 'dvh' }  // ← Din custom unit!
							]}
                        />
                    </ToolsPanelItem>
                </ToolsPanel>
				<PanelBody>
					<FormFileUpload
						__next40pxDefaultSize
						icon={"upload"}
						accept="image/*"
						onChange={ ( event ) => console.log( event.currentTarget.files ) }
					>
						Upload .riv file
					</FormFileUpload>
				</PanelBody>
			</InspectorControls>

			<div { ...useBlockProps() }>
				<canvas className='rive-block-canvas' ></canvas>
				{ __( 'Rive Block – hello from the editor!', 'rive-block' ) }
			</div>
		</>
	);
}
