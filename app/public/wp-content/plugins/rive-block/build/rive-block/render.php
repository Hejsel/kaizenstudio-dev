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
$rive_block_width = $attributes['width'] ?? '100%';
$rive_block_height = $attributes['height'] ?? 'auto';
$rive_block_rive_file_url = $attributes['riveFileUrl'];
$rive_block_enable_autoplay = $attributes['enableAutoplay'] ?? false;
$rive_block_respect_reduced_motion = $attributes['respectReducedMotion'] ?? true;
$rive_block_aria_label = $attributes['ariaLabel'] ?? '';
$rive_block_aria_description = $attributes['ariaDescription'] ?? '';
$rive_block_loading_priority = $attributes['loadingPriority'] ?? 'low';

// Build wrapper attributes
$rive_block_wrapper_attributes = [
	'style' => 'width: ' . esc_attr($rive_block_width) . '; height: ' . esc_attr($rive_block_height) . ';',
	'data-rive-src' => esc_url($rive_block_rive_file_url),
	'data-enable-autoplay' => $rive_block_enable_autoplay ? 'true' : 'false',
	'data-respect-reduced-motion' => $rive_block_respect_reduced_motion ? 'true' : 'false',
	'data-loading-priority' => esc_attr($rive_block_loading_priority),
];

// Add ARIA attributes if provided
if ( ! empty( $rive_block_aria_label ) ) {
	$rive_block_wrapper_attributes['role'] = 'img';
	$rive_block_wrapper_attributes['aria-label'] = esc_attr( $rive_block_aria_label );
}

if ( ! empty( $rive_block_aria_description ) ) {
	$rive_block_wrapper_attributes['aria-description'] = esc_attr( $rive_block_aria_description );
}

// Calculate aspect ratio for placeholder (prevent layout shift during lazy load)
// Default to 16:9 if dimensions are not set or auto
$rive_block_aspect_ratio = '56.25%'; // 16:9 default
if ( $rive_block_width !== 'auto' && $rive_block_height !== 'auto' && is_numeric( str_replace( ['px', '%', 'em', 'rem'], '', $rive_block_width ) ) && is_numeric( str_replace( ['px', '%', 'em', 'rem'], '', $rive_block_height ) ) ) {
	$rive_block_width_val = floatval( str_replace( ['px', '%', 'em', 'rem'], '', $rive_block_width ) );
	$rive_block_height_val = floatval( str_replace( ['px', '%', 'em', 'rem'], '', $rive_block_height ) );
	if ( $rive_block_width_val > 0 ) {
		$rive_block_aspect_ratio = ( $rive_block_height_val / $rive_block_width_val * 100 ) . '%';
	}
}
?>
<?php if ( $rive_block_loading_priority === 'high' ) : ?>
	<?php
	// Prevent duplicate preload tags for the same Rive file
	static $rive_block_preloaded_riv_files = [];
	if ( ! in_array( $rive_block_rive_file_url, $rive_block_preloaded_riv_files, true ) ) :
		$rive_block_preloaded_riv_files[] = $rive_block_rive_file_url;
	?>
<!-- Preload Rive animation file for faster initialization (high priority) -->
<link rel="preload" href="<?php echo esc_url( $rive_block_rive_file_url ); ?>" as="fetch" crossorigin="anonymous">
	<?php endif; ?>
<?php endif; ?>
<div class="rive-block-container" style="position: relative; width: <?php echo esc_attr( $rive_block_width ); ?>; padding-bottom: <?php echo esc_attr( $rive_block_aspect_ratio ); ?>;">
	<canvas
		<?php echo wp_kses_post( get_block_wrapper_attributes( array_merge( $rive_block_wrapper_attributes, [
			'style' => 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
		] ) ) ); ?>>
	</canvas>
</div>
