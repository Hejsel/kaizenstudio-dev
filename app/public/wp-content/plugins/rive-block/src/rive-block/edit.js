/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 * @see https://www.w3.org/International/i18n-drafts/nav/about
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
	MediaUploadCheck,
} from '@wordpress/block-editor';

import {
	PanelBody,
	Button,
	ToggleControl,
	TextControl,
	TextareaControl,
	SelectControl,
	Notice,
	Spinner,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * React hooks
 */
import { useEffect, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import riveIcon from './icon';
import RiveCanvas from './components/RiveCanvas';
import { riveRuntime } from './utils/RiveRuntime';

/**
 * Automatically generate poster frame from first frame of Rive animation
 * Uses off-screen canvas to render and capture the first frame as a data URL
 *
 * @param {string} riveFileUrl - URL of the .riv file
 * @returns {Promise<string|null>} Data URL of poster frame (WebP), or null if failed
 */
async function generatePosterFrame( riveFileUrl ) {
	try {
		// Get Rive runtime instance
		const rive = await riveRuntime.awaitInstance();

		// Fetch and decode .riv file
		const response = await fetch( riveFileUrl, { cache: 'default' } );
		if ( ! response.ok ) {
			throw new Error( `Failed to fetch Rive file: ${ response.statusText }` );
		}

		const arrayBuffer = await response.arrayBuffer();
		const fileBytes = new Uint8Array( arrayBuffer );
		const file = await rive.load( fileBytes );

		// Get default artboard
		const artboard = file.defaultArtboard();

		// Create off-screen canvas for rendering
		// Use reasonable size for poster frame (optimize for file size vs quality)
		const posterWidth = 800;
		const posterHeight = Math.round(
			( artboard.bounds.maxY / artboard.bounds.maxX ) * posterWidth
		);

		const offscreenCanvas = document.createElement( 'canvas' );
		offscreenCanvas.width = posterWidth;
		offscreenCanvas.height = posterHeight;

		// Create renderer on off-screen canvas
		const renderer = rive.makeRenderer( offscreenCanvas, true );

		// Render first frame
		renderer.clear();
		renderer.save();
		renderer.align(
			rive.Fit.contain,
			rive.Alignment.center,
			{
				minX: 0,
				minY: 0,
				maxX: posterWidth,
				maxY: posterHeight,
			},
			artboard.bounds
		);
		artboard.draw( renderer );
		renderer.restore();
		renderer.flush();

		// Convert canvas to data URL (WebP format for best compression)
		// Quality 0.85 balances file size and visual quality
		const posterDataURL = offscreenCanvas.toDataURL( 'image/webp', 0.85 );

		// Cleanup
		renderer.delete();
		artboard.delete();
		file.delete();

		// Debug log in development
		if (
			window.location.hostname === 'localhost' ||
			window.location.hostname.includes( 'local' )
		) {
			// Calculate approximate size in KB
			const sizeKB = Math.round( ( posterDataURL.length * 0.75 ) / 1024 );
			console.log( `[Rive Block] Auto-generated poster frame: ~${ sizeKB } KB` );
		}

		return posterDataURL;
	} catch ( error ) {
		console.error( '[Rive Block] Failed to generate poster frame:', error );
		return null;
	}
}

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */
export default function Edit( { attributes, setAttributes } ) {
	const {
		riveFileUrl,
		riveFileId,
		posterFrameUrl,
		posterFrameId,
		width = metadata.attributes.width.default,
		height = metadata.attributes.height.default,
		enableAutoplay = metadata.attributes.enableAutoplay.default,
		respectReducedMotion = metadata.attributes.respectReducedMotion.default,
		ariaLabel = metadata.attributes.ariaLabel.default,
		ariaDescription = metadata.attributes.ariaDescription.default,
		loadingPriority = metadata.attributes.loadingPriority.default,
	} = attributes;

	// Track poster frame generation status
	const [ isGeneratingPoster, setIsGeneratingPoster ] = useState( false );

	// Auto-generate poster frame when Rive file URL changes
	useEffect( () => {
		if ( ! riveFileUrl ) {
			// No Rive file, clear poster frame
			if ( posterFrameUrl ) {
				setAttributes( {
					posterFrameUrl: undefined,
					posterFrameId: undefined,
				} );
			}
			return;
		}

		// Generate poster frame automatically
		( async () => {
			setIsGeneratingPoster( true );

			const posterDataURL = await generatePosterFrame( riveFileUrl );

			if ( posterDataURL ) {
				// Successfully generated poster frame
				setAttributes( {
					posterFrameUrl: posterDataURL,
					posterFrameId: undefined, // Data URLs don't have Media Library IDs
				} );
			} else {
				// Failed to generate, clear poster
				setAttributes( {
					posterFrameUrl: undefined,
					posterFrameId: undefined,
				} );
			}

			setIsGeneratingPoster( false );
		} )();
	}, [ riveFileUrl ] ); // Re-run when Rive file URL changes

	// Handle Rive file selection from Media Library or Upload
	const onSelectRiveFile = ( media ) => {
		if ( ! media || ! media.url ) {
			setAttributes( {
				riveFileUrl: undefined,
				riveFileId: undefined,
			} );
			return;
		}

		setAttributes( {
			riveFileUrl: media.url,
			riveFileId: media.id,
		} );
	};

	// Show placeholder if no Rive file is selected
	if ( ! riveFileUrl ) {
		return (
			<div { ...useBlockProps() }>
				<MediaPlaceholder
					icon={ <BlockIcon icon={ riveIcon } /> }
					onSelect={ onSelectRiveFile }
					accept=".riv"
					allowedTypes={ [ 'application/octet-stream' ] }
					labels={ {
						title: __( 'Choose Rive Asset', 'rive-block' ),
						instructions: __(
							'Upload a Rive file or choose from your Media Library.',
							'rive-block'
						),
					} }
				/>
			</div>
		);
	}

	// Show canvas with Rive animation when file is selected
	return (
		<>
			<InspectorControls>
				<ToolsPanel
					label={ __( 'Settings', 'rive-block' ) }
					resetAll={ () => {
						setAttributes( {
							width: undefined,
							height: undefined,
						} );
					} }
				>
					<ToolsPanelItem
						hasValue={ () =>
							width !== undefined &&
							width !== metadata.attributes.width.default
						}
						label={ __( 'Width', 'rive-block' ) }
						onDeselect={ () =>
							setAttributes( { width: undefined } )
						}
						isShownByDefault
					>
						<UnitControl
							label={ __( 'Width', 'rive-block' ) }
							value={ width }
							onChange={ ( value ) =>
								setAttributes( {
									width: value || undefined,
								} )
							}
							units={ [
								{ value: 'px', label: 'px' },
								{ value: '%', label: '%' },
								{ value: 'em', label: 'em' },
								{ value: 'rem', label: 'rem' },
								{ value: 'vh', label: 'vh' },
								{ value: 'dvw', label: 'dvw' }, // ← Din custom unit!
							] }
							__next40pxDefaultSize
						/>
					</ToolsPanelItem>
					<ToolsPanelItem
						hasValue={ () =>
							height !== undefined &&
							height !== metadata.attributes.height.default
						}
						label={ __( 'Height', 'rive-block' ) }
						onDeselect={ () =>
							setAttributes( { height: undefined } )
						}
						isShownByDefault
					>
						<UnitControl
							label={ __( 'Height', 'rive-block' ) }
							value={ height }
							onChange={ ( value ) =>
								setAttributes( {
									height: value || undefined,
								} )
							}
							units={ [
								{ value: 'px', label: 'px' },
								{ value: '%', label: '%' },
								{ value: 'em', label: 'em' },
								{ value: 'rem', label: 'rem' },
								{ value: 'vh', label: 'vh' },
								{ value: 'dvh', label: 'dvh' },
							] }
							__next40pxDefaultSize
						/>
					</ToolsPanelItem>
				</ToolsPanel>
				<PanelBody
					title={ __( 'Rive File', 'rive-block' ) }
					initialOpen={ false }
				>
					<p>
						<strong>{ __( 'Current file:', 'rive-block' ) }</strong>
					</p>
					<p
						style={ {
							wordBreak: 'break-all',
							fontSize: '12px',
							color: '#757575',
						} }
					>
						{ riveFileUrl }
					</p>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ onSelectRiveFile }
							allowedTypes={ [ 'application/octet-stream' ] }
							value={ riveFileId }
							render={ ( { open } ) => (
								<Button
									onClick={ open }
									variant="secondary"
									__next40pxDefaultSize
								>
									{ __( 'Replace Rive File', 'rive-block' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
				</PanelBody>
				<PanelBody
					title={ __( 'Poster Frame (Instant Loading)', 'rive-block' ) }
					initialOpen={ false }
				>
					<p>
						{ __(
							'A poster frame is automatically generated from the first frame of your Rive animation. This creates a perceived instant load time - users see the animation immediately!',
							'rive-block'
						) }
					</p>

					{ /* Generating state */ }
					{ isGeneratingPoster && (
						<div
							className="rive-block-notice"
							style={ { marginTop: '12px' } }
						>
							<Notice status="info" isDismissible={ false }>
								<div
									style={ {
										display: 'flex',
										alignItems: 'center',
										gap: '8px',
									} }
								>
									<Spinner />
									{ __(
										'Generating poster frame from first frame...',
										'rive-block'
									) }
								</div>
							</Notice>
						</div>
					) }

					{ /* Success state with preview */ }
					{ posterFrameUrl && ! isGeneratingPoster && (
						<>
							<div
								style={ {
									marginBottom: '12px',
									border: '1px solid #ddd',
									borderRadius: '4px',
									overflow: 'hidden',
								} }
							>
								<img
									src={ posterFrameUrl }
									alt={ __(
										'Auto-generated poster frame preview',
										'rive-block'
									) }
									style={ {
										width: '100%',
										height: 'auto',
										display: 'block',
									} }
								/>
							</div>
							<div
								className="rive-block-notice"
								style={ { marginTop: '12px' } }
							>
								<Notice status="success" isDismissible={ false }>
									{ __(
										'✓ Poster frame auto-generated! Animation will appear instantly on page load.',
										'rive-block'
									) }
								</Notice>
							</div>
						</>
					) }

					{ /* Error/no poster state */ }
					{ ! posterFrameUrl && ! isGeneratingPoster && riveFileUrl && (
						<div
							className="rive-block-notice"
							style={ { marginTop: '12px' } }
						>
							<Notice status="warning" isDismissible={ false }>
								{ __(
									'Failed to auto-generate poster frame. The animation will still work, but may have a brief loading delay.',
									'rive-block'
								) }
							</Notice>
						</div>
					) }
				</PanelBody>
				<PanelBody
					title={ __( 'Accessibility', 'rive-block' ) }
					initialOpen={ false }
				>
					<p>
						<strong>
							{ __(
								'Animation from Interactions',
								'rive-block'
							) }
							<br />
							{ __( '(Level AAA)', 'rive-block' ) }
						</strong>
					</p>
					<ToggleControl
						label={ __( 'Enable Autoplay', 'rive-block' ) }
						help={
							enableAutoplay
								? __(
										"Animation will start automatically. Consider accessibility: users with vestibular disorders may prefer animations that don't autoplay.",
										'rive-block'
								  )
								: __(
										'Animation will require user interaction to play. This is the recommended setting for WCAG AAA compliance.',
										'rive-block'
								  )
						}
						checked={ enableAutoplay }
						onChange={ ( value ) =>
							setAttributes( { enableAutoplay: value } )
						}
					/>
					{ enableAutoplay && (
						<div className="rive-block-notice">
							<Notice status="warning" isDismissible={ false }>
								{ __(
									'Autoplay may violate WCAG AAA 2.3.3 (Animation from Interactions). Consider if this animation is essential to the user experience.',
									'rive-block'
								) }
							</Notice>
						</div>
					) }
					<p>
						<strong>
							{ __( 'Pause, Stop, Hide', 'rive-block' ) }
							<br />
							{ __( '(Level A)', 'rive-block' ) }
						</strong>
					</p>
					<ToggleControl
						label={ __(
							'Respect Reduced Motion Preference',
							'rive-block'
						) }
						help={ __(
							'Disable animation for users who have set "prefers-reduced-motion" in their system settings. Highly recommended for accessibility.',
							'rive-block'
						) }
						checked={ respectReducedMotion }
						onChange={ ( value ) =>
							setAttributes( { respectReducedMotion: value } )
						}
					/>
					<p>
						<strong>
							{ __( 'Non-text Content', 'rive-block' ) }
							<br />
							{ __( '(Level A)', 'rive-block' ) }
						</strong>
					</p>
					<TextControl
						label={ __( 'ARIA Label', 'rive-block' ) }
						help={ __(
							'Accessible name for screen readers. Describe what this animation represents (e.g., "Company logo animation").',
							'rive-block'
						) }
						value={ ariaLabel }
						onChange={ ( value ) =>
							setAttributes( { ariaLabel: value } )
						}
						placeholder={ __(
							'e.g., Hero animation',
							'rive-block'
						) }
						__next40pxDefaultSize
					/>
					<TextareaControl
						label={ __( 'ARIA Description', 'rive-block' ) }
						help={ __(
							'Detailed description of the animation for screen readers. Explain what happens in the animation.',
							'rive-block'
						) }
						value={ ariaDescription }
						onChange={ ( value ) =>
							setAttributes( { ariaDescription: value } )
						}
						placeholder={ __(
							'e.g., An animated illustration showing...',
							'rive-block'
						) }
						rows={ 3 }
						__next40pxDefaultSize
					/>
				</PanelBody>
				<PanelBody
					title={ __( 'Performance', 'rive-block' ) }
					initialOpen={ false }
				>
					<SelectControl
						label={ __( 'Loading Priority', 'rive-block' ) }
						value={ loadingPriority }
						options={ [
							{
								label: __(
									'High - Load immediately (above the fold)',
									'rive-block'
								),
								value: 'high',
							},
							{
								label: __(
									'Low - Load when visible (below the fold)',
									'rive-block'
								),
								value: 'low',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { loadingPriority: value } )
						}
						help={
							loadingPriority === 'high'
								? __(
										'Animation will be preloaded and initialized immediately. Use for critical above-the-fold content like hero animations.',
										'rive-block'
								  )
								: __(
										'Animation will only load when scrolled into view. Recommended for below-the-fold content to improve initial page load performance.',
										'rive-block'
								  )
						}
						__next40pxDefaultSize
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...useBlockProps() }>
				<RiveCanvas
					riveFileUrl={ riveFileUrl }
					width={ width }
					height={ height }
					enableAutoplay={ enableAutoplay }
					respectReducedMotion={ respectReducedMotion }
					ariaLabel={ ariaLabel }
					ariaDescription={ ariaDescription }
				/>
			</div>
		</>
	);
}
