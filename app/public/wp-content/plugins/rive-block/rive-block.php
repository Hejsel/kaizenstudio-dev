<?php
/**
 * Plugin Name:       Rive Block
 * Description:       Intergrate Rive assets to your wordpress block theme.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Benjamin Hejsel
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       rive-block
 *
 * @package CreateBlock
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
/**
 * Registers the block using a `blocks-manifest.php` file, which improves the performance of block type registration.
 * Behind the scenes, it also registers all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
 */
function create_block_rive_block_block_init() {
	/**
	 * Registers the block(s) metadata from the `blocks-manifest.php` and registers the block type(s)
	 * based on the registered block metadata.
	 * Added in WordPress 6.8 to simplify the block metadata registration process added in WordPress 6.7.
	 *
	 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
	 */
	if ( function_exists( 'wp_register_block_types_from_metadata_collection' ) ) {
		wp_register_block_types_from_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
		return;
	}

	/**
	 * Registers the block(s) metadata from the `blocks-manifest.php` file.
	 * Added to WordPress 6.7 to improve the performance of block type registration.
	 *
	 * @see https://make.wordpress.org/core/2024/10/17/new-block-type-registration-apis-to-improve-performance-in-wordpress-6-7/
	 */
	if ( function_exists( 'wp_register_block_metadata_collection' ) ) {
		wp_register_block_metadata_collection( __DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php' );
	}
	/**
	 * Registers the block type(s) in the `blocks-manifest.php` file.
	 *
	 * @see https://developer.wordpress.org/reference/functions/register_block_type/
	 */
	$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
	foreach ( array_keys( $manifest_data ) as $block_type ) {
		register_block_type( __DIR__ . "/build/{$block_type}" );
	}
}
add_action( 'init', 'create_block_rive_block_block_init' );

/**
 * Allow .riv file uploads to WordPress Media Library
 */
function rive_block_allow_riv_uploads( $mimes ) {
	// Add .riv to allowed MIME types
	$mimes['riv'] = 'application/octet-stream';
	return $mimes;
}
add_filter( 'upload_mimes', 'rive_block_allow_riv_uploads' );

/**
 * Fix MIME type check for .riv files
 */
function rive_block_fix_riv_mime_type( $data, $_file, $filename ) {
	$ext = pathinfo( $filename, PATHINFO_EXTENSION );

	if ( $ext === 'riv' ) {
		$data['ext']  = 'riv';
		$data['type'] = 'application/octet-stream';
	}

	return $data;
}
add_filter( 'wp_check_filetype_and_ext', 'rive_block_fix_riv_mime_type', 10, 3 );

/**
 * Localize plugin URL for JavaScript access to WASM files
 */
function rive_block_enqueue_scripts() {
	// Only enqueue on frontend (not in editor)
	if ( ! is_admin() ) {
		// Localize the plugin URL for view.js to access WASM files
		wp_localize_script(
			'create-block-rive-block-view-script', // Handle from block.json viewScript
			'riveBlockData',
			array(
				'pluginUrl' => plugin_dir_url( __FILE__ ),
			)
		);
	}
}
add_action( 'wp_enqueue_scripts', 'rive_block_enqueue_scripts', 20 );

/**
 * Preload WASM file for faster Rive animation initialization
 *
 * Adds a <link rel="preload"> tag in the <head> to tell the browser to start
 * downloading the WASM file as soon as possible, reducing animation load time.
 */
function rive_block_preload_wasm() {
	// Only preload on frontend (not in editor)
	if ( is_admin() ) {
		return;
	}

	// Check if page contains any Rive blocks before preloading
	global $post;
	if ( ! $post || ! has_block( 'create-block/rive-block', $post ) ) {
		return;
	}

	// Output preload link tag
	$wasm_url = plugins_url( 'rive-block/build/rive-block/webgl2_advanced.wasm' );
	echo '<link rel="preload" href="' . esc_url( $wasm_url ) . '" as="fetch" crossorigin="anonymous">' . "\n";
}
add_action( 'wp_head', 'rive_block_preload_wasm', 1 );
