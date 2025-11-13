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

$width = $attributes['width'] ?? '100%';
$height = $attributes['height'] ?? 'auto';
$rive_file_url = $attributes['riveFileUrl'];
?>
<canvas
	<?php echo get_block_wrapper_attributes([
		'class' => 'rive-block-canvas',
		'style' => 'width: ' . esc_attr($width) . '; height: ' . esc_attr($height) . ';'
	]); ?>>
</canvas>
