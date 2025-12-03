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
$loading_priority = $attributes['loadingPriority'] ?? 'low';

// Build wrapper attributes
$wrapper_attributes = [
	'style' => 'width: ' . esc_attr($width) . '; height: ' . esc_attr($height) . ';',
	'data-rive-src' => esc_url($rive_file_url),
	'data-enable-autoplay' => $enable_autoplay ? 'true' : 'false',
	'data-respect-reduced-motion' => $respect_reduced_motion ? 'true' : 'false',
	'data-loading-priority' => esc_attr($loading_priority),
];

// Add ARIA attributes if provided
if ( ! empty( $aria_label ) ) {
	$wrapper_attributes['role'] = 'img';
	$wrapper_attributes['aria-label'] = esc_attr( $aria_label );
}

if ( ! empty( $aria_description ) ) {
	$wrapper_attributes['aria-description'] = esc_attr( $aria_description );
}

// Calculate aspect ratio for placeholder (prevent layout shift during lazy load)
// Default to 16:9 if dimensions are not set or auto
$aspect_ratio = '56.25%'; // 16:9 default
if ( $width !== 'auto' && $height !== 'auto' && is_numeric( str_replace( ['px', '%', 'em', 'rem'], '', $width ) ) && is_numeric( str_replace( ['px', '%', 'em', 'rem'], '', $height ) ) ) {
	$width_val = floatval( str_replace( ['px', '%', 'em', 'rem'], '', $width ) );
	$height_val = floatval( str_replace( ['px', '%', 'em', 'rem'], '', $height ) );
	if ( $width_val > 0 ) {
		$aspect_ratio = ( $height_val / $width_val * 100 ) . '%';
	}
}
?>
<?php if ( $loading_priority === 'high' ) : ?>
	<?php
	// Prevent duplicate preload tags for the same Rive file
	static $preloaded_riv_files = [];
	if ( ! in_array( $rive_file_url, $preloaded_riv_files, true ) ) :
		$preloaded_riv_files[] = $rive_file_url;
	?>
<!-- Preload Rive animation file for faster initialization (high priority) -->
<link rel="preload" href="<?php echo esc_url( $rive_file_url ); ?>" as="fetch" crossorigin="anonymous">
	<?php endif; ?>
<?php endif; ?>
<div class="rive-block-container" style="position: relative; width: <?php echo esc_attr( $width ); ?>; padding-bottom: <?php echo esc_attr( $aspect_ratio ); ?>;">
	<canvas
		<?php echo get_block_wrapper_attributes( array_merge( $wrapper_attributes, [
			'style' => 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
		] ) ); ?>>
	</canvas>
</div>
