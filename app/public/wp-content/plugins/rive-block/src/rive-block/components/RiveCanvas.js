/**
 * RiveCanvas Component
 *
 * Wrapper component that handles Rive animation loading and display in the block editor.
 * Uses vanilla JavaScript @rive-app/canvas for identical markup to frontend.
 * Isolated component ensures proper cleanup when riveFileUrl changes.
 */

import { Rive } from '@rive-app/canvas';
import { useEffect, useState, useRef } from '@wordpress/element';
import { Spinner, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Scan Rive file for metadata (View Model properties, State Machines, Animations)
 */
function scanRiveMetadata(riveInstance) {
	const metadata = {
		stateMachines: [],
		animations: [],
		artboards: [],
		viewModelProperties: [],
		hasViewModel: false
	};

	try {
		// Get basic info
		metadata.stateMachines = riveInstance.stateMachineNames || [];
		metadata.animations = riveInstance.animationNames || [];

		// Get contents for complete file structure
		if (riveInstance.contents && riveInstance.contents.artboards) {
			metadata.artboards = riveInstance.contents.artboards.map(ab => ab.name);
		}

		// Scan for View Model
		if (riveInstance.viewModelInstance) {
			const vmi = riveInstance.viewModelInstance;

			// Try to get properties
			if (vmi._runtimeInstance && vmi._runtimeInstance.getProperties) {
				const properties = vmi._runtimeInstance.getProperties();

				if (properties && properties.length > 0) {
					metadata.hasViewModel = true;
					metadata.viewModelProperties = properties.map(prop => ({
						name: prop.name,
						type: prop.type // DataType enum value
					}));
				}
			}
		}
	} catch (error) {
		console.error('Error scanning Rive metadata:', error);
	}

	return metadata;
}

export default function RiveCanvas({ riveFileUrl, width, height, onMetadataDetected }) {
	const canvasRef = useRef(null);
	const riveInstanceRef = useRef(null);
	const [isLoading, setIsLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);

	// Initialize Rive animation when canvas is ready
	useEffect(() => {
		if (!canvasRef.current || !riveFileUrl) return;

		setIsLoading(true);
		setLoadError(null);

		// Create new Rive instance
		const riveInstance = new Rive({
			src: riveFileUrl,
			canvas: canvasRef.current,
			autoplay: true,
			autoBind: true, // Enable View Model auto-binding
			useOffscreenRenderer: true,
			onLoad: () => {
				setIsLoading(false);
				setLoadError(null);

				// Scan file metadata
				if (onMetadataDetected) {
					const metadata = scanRiveMetadata(riveInstance);
					console.log('🔍 Rive File Metadata Detected:', metadata);
					onMetadataDetected(metadata);
				}
			},
			onLoadError: () => {
				setLoadError(__('Unable to load Rive animation. Please check the file and try again.', 'rive-block'));
				setIsLoading(false);
			}
		});

		riveInstanceRef.current = riveInstance;

		// Cleanup on unmount or when riveFileUrl changes
		return () => {
			if (riveInstanceRef.current) {
				riveInstanceRef.current.cleanup();
				riveInstanceRef.current = null;
			}
		};
	}, [riveFileUrl]);

	return (
		<div style={{ position: 'relative', width, height }}>
			{/* Loading indicator */}
			{isLoading && (
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'rgba(255, 255, 255, 0.8)',
						zIndex: 1000
					}}
				>
					<Spinner />
				</div>
			)}

			{/* Error notice */}
			{loadError && (
				<Notice status="error" isDismissible={false}>
					{loadError}
				</Notice>
			)}

			{/* Rive animation canvas - identical markup to frontend */}
			<canvas
				ref={canvasRef}
				className="rive-block-canvas"
				style={{ width, height }}
			/>
		</div>
	);
}
