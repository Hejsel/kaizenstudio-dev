<?php
/**
 * PHP file to use when rendering the block type on the server to show on the front end.
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

// Don't render anything if no Rive file is selected
if ( empty( $attributes['riveFileUrl'] ) ) {
	return;
}

// Get block attributes with defaults
$width = $attributes['width'] ?? '100%';
$height = $attributes['height'] ?? 'auto';
$rive_file_url = $attributes['riveFileUrl'];
$enable_autoplay = $attributes['enableAutoplay'] ?? false;
$respect_reduced_motion = $attributes['respectReducedMotion'] ?? true;
$aria_label = $attributes['ariaLabel'] ?? '';
$aria_description = $attributes['ariaDescription'] ?? '';

// Build wrapper attributes
$wrapper_attributes = [
	'style' => 'width: ' . esc_attr($width) . '; height: ' . esc_attr($height) . '; display: block;',
	'data-rive-src' => esc_url($rive_file_url),
	'data-enable-autoplay' => $enable_autoplay ? 'true' : 'false',
	'data-respect-reduced-motion' => $respect_reduced_motion ? 'true' : 'false',
	'data-width' => esc_attr($width),
	'data-height' => esc_attr($height),
];

// Add ARIA attributes if provided
if ( ! empty( $aria_label ) ) {
	$wrapper_attributes['role'] = 'img';
	$wrapper_attributes['aria-label'] = esc_attr( $aria_label );
}

if ( ! empty( $aria_description ) ) {
	$wrapper_attributes['aria-description'] = esc_attr( $aria_description );
}
?>
<canvas
	<?php echo get_block_wrapper_attributes( $wrapper_attributes ); ?>>
</canvas>
