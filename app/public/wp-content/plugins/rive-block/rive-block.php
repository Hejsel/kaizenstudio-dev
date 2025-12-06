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
 * Localize plugin URL for JavaScript access to WASM files (frontend)
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
				'debug' => defined( 'WP_DEBUG' ) && WP_DEBUG,
			)
		);
	}
}
add_action( 'wp_enqueue_scripts', 'rive_block_enqueue_scripts', 20 );

/**
 * Localize plugin URL for JavaScript access to WASM files (editor)
 */
function rive_block_enqueue_editor_scripts() {
	// Localize the plugin URL for editor scripts to access WASM files
	wp_localize_script(
		'create-block-rive-block-editor-script', // Handle from block.json editorScript
		'riveBlockData',
		array(
			'pluginUrl' => plugin_dir_url( __FILE__ ),
			'debug' => defined( 'WP_DEBUG' ) && WP_DEBUG,
		)
	);
}
add_action( 'enqueue_block_editor_assets', 'rive_block_enqueue_editor_scripts', 20 );

/**
 * Preload WASM file for faster Rive animation initialization
 *
 * Adds a <link rel="preload"> tag in the <head> to tell the browser to start
 * downloading the WASM file as soon as possible, reducing animation load time.
 *
 * Note: Browser may show warning on subsequent loads when IndexedDB cache is active.
 * This is expected behavior - IndexedDB cache serves WASM bytes directly, bypassing
 * the preloaded resource. The warning is harmless and indicates optimal caching.
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

	// Output preload link tag for WASM file
	// Using type="application/wasm" to ensure correct MIME type matching
	$wasm_url = plugins_url( 'rive-block/build/rive-block/webgl2_advanced.wasm' );
	echo '<link rel="preload" href="' . esc_url( $wasm_url ) . '" as="fetch" type="application/wasm" crossorigin="anonymous">' . "\n";
}
add_action( 'wp_head', 'rive_block_preload_wasm', 1 );

/**
 * Add HTTP cache headers for .riv files
 *
 * Sets aggressive caching for .riv files since they are immutable assets.
 * This works in combination with in-memory caching on the client side:
 * - In-memory cache: Prevents duplicate decoding on the same page
 * - HTTP cache: Prevents duplicate downloads across page loads
 *
 * Cache-Control directives:
 * - public: Can be cached by browsers and CDNs
 * - max-age=604800: Cache for 7 days (matches Nginx configuration)
 * - immutable: Tells browser the file will never change at this URL
 *
 * Note: This is a backup for environments without Nginx custom config.
 * Nginx configuration takes precedence when available.
 */
function rive_block_add_cache_headers( $headers, $wp_object ) {
	// Only apply to frontend requests
	if ( is_admin() ) {
		return $headers;
	}

	// Check if this is a .riv file request
	$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? $_SERVER['REQUEST_URI'] : '';
	if ( strpos( $request_uri, '.riv' ) !== false ) {
		// Set caching headers for immutable .riv files (7 days, matching Nginx config)
		$headers['Cache-Control'] = 'public, max-age=604800, immutable';
		$headers['Expires'] = gmdate( 'D, d M Y H:i:s', time() + 604800 ) . ' GMT';
	}

	return $headers;
}
add_filter( 'wp_headers', 'rive_block_add_cache_headers', 10, 2 );

/**
 * Register REST API endpoint for auto-generated poster frame upload
 */
function rive_block_register_rest_routes() {
	register_rest_route(
		'rive-block/v1',
		'/upload-poster-frame',
		array(
			'methods'             => 'POST',
			'callback'            => 'rive_block_upload_poster_frame',
			'permission_callback' => function() {
				// Only allow users who can upload files
				return current_user_can( 'upload_files' );
			},
		)
	);
}
add_action( 'rest_api_init', 'rive_block_register_rest_routes' );

/**
 * Handle poster frame upload from base64 data
 *
 * @param WP_REST_Request $request The REST request object.
 * @return WP_REST_Response|WP_Error Response object or error.
 */
function rive_block_upload_poster_frame( $request ) {
	// Get parameters
	$base64_data = $request->get_param( 'imageData' );
	$rive_file_id = $request->get_param( 'riveFileId' );
	$block_id = $request->get_param( 'blockId' );

	// Validate required parameters
	if ( empty( $base64_data ) ) {
		return new WP_Error(
			'missing_image_data',
			__( 'Image data is required.', 'rive-block' ),
			array( 'status' => 400 )
		);
	}

	// Remove data URI scheme if present (data:image/webp;base64,)
	$base64_data = preg_replace( '/^data:image\/\w+;base64,/', '', $base64_data );

	// Decode base64 data
	$image_data = base64_decode( $base64_data );
	if ( $image_data === false ) {
		return new WP_Error(
			'invalid_image_data',
			__( 'Invalid base64 image data.', 'rive-block' ),
			array( 'status' => 400 )
		);
	}

	// Generate unique filename
	$upload_dir = wp_upload_dir();
	$filename = 'rive-poster-' . $block_id . '-' . time() . '.webp';
	$filepath = $upload_dir['path'] . '/' . $filename;

	// Save image data to temporary file
	$saved = file_put_contents( $filepath, $image_data );
	if ( $saved === false ) {
		return new WP_Error(
			'upload_failed',
			__( 'Failed to save poster frame image.', 'rive-block' ),
			array( 'status' => 500 )
		);
	}

	// Prepare file array for media_handle_sideload
	$file_array = array(
		'name'     => $filename,
		'tmp_name' => $filepath,
	);

	// Import file into Media Library
	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';

	// Upload file to Media Library
	$attachment_id = media_handle_sideload(
		$file_array,
		0, // No parent post
		__( 'Auto-generated Rive poster frame', 'rive-block' )
	);

	// Check for upload errors
	if ( is_wp_error( $attachment_id ) ) {
		// Clean up temporary file
		@unlink( $filepath );
		return $attachment_id;
	}

	// Add custom meta to link poster frame to Rive file
	if ( ! empty( $rive_file_id ) ) {
		update_post_meta( $attachment_id, '_rive_source_file_id', intval( $rive_file_id ) );
	}
	update_post_meta( $attachment_id, '_rive_auto_generated', true );

	// Get attachment URL
	$attachment_url = wp_get_attachment_url( $attachment_id );

	// Return success response
	return new WP_REST_Response(
		array(
			'success' => true,
			'id'      => $attachment_id,
			'url'     => $attachment_url,
		),
		200
	);
}
