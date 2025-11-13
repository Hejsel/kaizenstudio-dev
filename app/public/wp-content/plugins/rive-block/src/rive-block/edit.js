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
	useBlockProps,
	MediaPlaceholder,
	BlockIcon,
	MediaUpload,
	MediaUploadCheck
} from '@wordpress/block-editor';

import {
	PanelBody,
	Button,
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
 * Internal dependencies
 */
import metadata from './block.json';
import riveIcon from './icon';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit({ attributes, setAttributes }) {

	const {
		riveFileUrl,
		riveFileId,
		width = metadata.attributes.width.default,
		height = metadata.attributes.height.default
	} = attributes;

	// Handle Rive file selection from Media Library or Upload
	const onSelectRiveFile = (media) => {
		if (!media || !media.url) {
			setAttributes({
				riveFileUrl: undefined,
				riveFileId: undefined
			});
			return;
		}

		setAttributes({
			riveFileUrl: media.url,
			riveFileId: media.id
		});
	};

	// Show placeholder if no Rive file is selected
	if (!riveFileUrl) {
		return (
			<div {...useBlockProps()}>
				<MediaPlaceholder
					icon={<BlockIcon icon={riveIcon} />}
					onSelect={onSelectRiveFile}
					accept=".riv"
					allowedTypes={['application/octet-stream']}
					labels={{
						title: __('Choose Rive Asset', 'rive-block'),
						instructions: __('Upload a Rive file or choose from your Media Library.', 'rive-block')
					}}
				/>
			</div>
		);
	}

	// Show canvas with Rive animation when file is selected
	return (
		<>
			<InspectorControls>
				<ToolsPanel
                    label={__("Settings", "rive-block")}
                    resetAll={() => {
                        setAttributes({
							width: undefined,
							height: undefined
						});
                    }}
                >
                    <ToolsPanelItem
                        hasValue={() => width !== undefined && width !== metadata.attributes.width.default}
                        label={__("Width", "rive-block")}
                        onDeselect={() => setAttributes({ width: undefined })}
                        isShownByDefault
                    >
                        <UnitControl
                            label={__("Width", "rive-block")}
                            value={width}
                            onChange={(value) => setAttributes({
								width: value || undefined
							})}
							units={[
								{ value: 'px', label: 'px' },
								{ value: '%', label: '%' },
								{ value: 'em', label: 'em' },
								{ value: 'rem', label: 'rem' },
								{ value: 'vh', label: 'vh' },
								{ value: 'dvh', label: 'dvw' }  // ← Din custom unit!
							]}
                        />
                    </ToolsPanelItem>
                    <ToolsPanelItem
                        hasValue={() => height !== undefined && height !== metadata.attributes.height.default}
                        label={__("Height", "rive-block")}
                        onDeselect={() => setAttributes({ height: undefined })}
                        isShownByDefault
                    >
                        <UnitControl
                            label={__("Height", "rive-block")}
                            value={height}
                            onChange={(value) => setAttributes({
								height: value || undefined
							})}
							units={[
								{ value: 'px', label: 'px' },
								{ value: '%', label: '%' },
								{ value: 'em', label: 'em' },
								{ value: 'rem', label: 'rem' },
								{ value: 'vh', label: 'vh' },
								{ value: 'dvh', label: 'dvh' }
							]}
                        />
                    </ToolsPanelItem>
                </ToolsPanel>
				<PanelBody title={__('Rive File', 'rive-block')}>
					<p><strong>{__('Current file:', 'rive-block')}</strong></p>
					<p style={{ wordBreak: 'break-all', fontSize: '12px', color: '#757575' }}>
						{riveFileUrl}
					</p>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={onSelectRiveFile}
							allowedTypes={['application/octet-stream']}
							value={riveFileId}
							render={({ open }) => (
								<Button
									onClick={open}
									variant="secondary"
									__next40pxDefaultSize
								>
									{__('Replace Rive File', 'rive-block')}
								</Button>
							)}
						/>
					</MediaUploadCheck>
				</PanelBody>
			</InspectorControls>

			<canvas { ...useBlockProps({
				className: 'rive-block-canvas',
				style: {
					width: width,
					height: height
				}
			}) }></canvas>
		</>
	);
}
