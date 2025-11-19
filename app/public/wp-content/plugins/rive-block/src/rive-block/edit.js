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
	ToggleControl,
	TextControl,
	TextareaControl,
	Notice,
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
import RiveCanvas from './components/RiveCanvas';

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
		height = metadata.attributes.height.default,
		enableAutoplay = metadata.attributes.enableAutoplay.default,
		respectReducedMotion = metadata.attributes.respectReducedMotion.default,
		ariaLabel = metadata.attributes.ariaLabel.default,
		ariaDescription = metadata.attributes.ariaDescription.default
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
								{ value: 'dvw', label: 'dvw' }  // ← Din custom unit!
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
				<PanelBody title={__('Accessibility', 'rive-block')} initialOpen={false}>
					<ToggleControl
						label={__('Enable Autoplay', 'rive-block')}
						help={
							enableAutoplay
								? __('Animation will start automatically. Consider accessibility: users with vestibular disorders may prefer animations that don\'t autoplay.', 'rive-block')
								: __('Animation will require user interaction to play. This is the recommended setting for WCAG AAA compliance.', 'rive-block')
						}
						checked={enableAutoplay}
						onChange={(value) => setAttributes({ enableAutoplay: value })}
					/>
					{enableAutoplay && (
						<Notice status="warning" isDismissible={false}>
							{__('Autoplay may violate WCAG AAA 2.3.3 (Animation from Interactions). Consider if this animation is essential to the user experience.', 'rive-block')}
						</Notice>
					)}
					<ToggleControl
						label={__('Respect Reduced Motion Preference', 'rive-block')}
						help={__('Disable animation for users who have set "prefers-reduced-motion" in their system settings. Highly recommended for accessibility.', 'rive-block')}
						checked={respectReducedMotion}
						onChange={(value) => setAttributes({ respectReducedMotion: value })}
					/>
					<TextControl
						label={__('ARIA Label', 'rive-block')}
						help={__('Accessible name for screen readers. Describe what this animation represents (e.g., "Company logo animation").', 'rive-block')}
						value={ariaLabel}
						onChange={(value) => setAttributes({ ariaLabel: value })}
						placeholder={__('e.g., Hero animation', 'rive-block')}
					/>
					<TextareaControl
						label={__('ARIA Description', 'rive-block')}
						help={__('Detailed description of the animation for screen readers. Explain what happens in the animation.', 'rive-block')}
						value={ariaDescription}
						onChange={(value) => setAttributes({ ariaDescription: value })}
						placeholder={__('e.g., An animated illustration showing...', 'rive-block')}
						rows={3}
					/>
				</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				<RiveCanvas
					riveFileUrl={riveFileUrl}
					width={width}
					height={height}
					enableAutoplay={enableAutoplay}
					respectReducedMotion={respectReducedMotion}
					ariaLabel={ariaLabel}
					ariaDescription={ariaDescription}
				/>
			</div>
		</>
	);
}
