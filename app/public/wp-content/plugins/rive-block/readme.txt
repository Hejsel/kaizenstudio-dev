=== Rive Block ===
Contributors:      KaizenStudio
Tags:              block, rive, animation, gutenberg, interactive
Requires at least: 6.3
Tested up to:      6.8
Stable tag:        0.1.0
Requires PHP:      7.4
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

Embed interactive Rive animations (.riv files) in your WordPress posts and pages with a custom Gutenberg block.

== Description ==

Rive Block enables you to easily embed and display Rive animations (.riv files) directly in the WordPress block editor.

Rive is a powerful design and animation tool that creates interactive graphics that run anywhere. With this plugin, you can:

* Upload .riv animation files to your WordPress Media Library
* Insert Rive animations using the block editor (Gutenberg)
* Customize animation width and height with multiple CSS units (px, %, em, rem, vh, dvh)
* Display multiple Rive animations on a single page
* Enjoy smooth animations with loading states and error handling

The plugin uses the official `@rive-app/canvas` runtime for optimal performance and compatibility.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/rive-block` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. In the block editor, search for "Rive Block" and add it to your page
4. Upload or select a .riv file from your Media Library
5. Customize the width and height as needed

== Frequently Asked Questions ==

= What is Rive? =

Rive is a design and animation tool that allows you to create interactive graphics that run anywhere. Learn more at https://rive.app

= What file formats are supported? =

This plugin supports .riv files created with the Rive editor.

= Can I use multiple Rive animations on one page? =

Yes! The plugin supports multiple Rive blocks on a single page using offscreen rendering for optimal performance.

= What CSS units are supported for sizing? =

The plugin supports px, %, em, rem, vh, and dvh units for both width and height.

= Why do I see a WASM error in the console? =

By default, the plugin uses a fallback method for loading WebAssembly files that works on all servers. See the "Performance Optimization" section below for details on improving load times.

== Performance Optimization (Optional) ==

By default, this plugin uses a fallback method for loading Rive's WebAssembly (WASM) files that works on all servers without configuration. For optimal performance (~50-200ms faster initial load), you can configure your web server to serve .wasm files with the correct MIME type.

= Performance Impact =

* Small animations (<500KB): ~50-100ms difference
* Medium animations (500KB-2MB): ~100-200ms difference
* Large animations (>2MB): ~200-500ms difference

For most use cases, the fallback method provides excellent performance. Advanced users may optimize if needed.

= For Apache Servers =

Create or edit the `.htaccess` file in your WordPress root directory and add:

`AddType application/wasm .wasm`

= For nginx Servers =

Add the following to your nginx server configuration:

`types {
    application/wasm wasm;
}`

Then reload nginx:

`sudo nginx -s reload`

Note: If you're using managed hosting (e.g., Simply.com, WP Engine, etc.), contact your hosting provider's support to add this MIME type configuration.

= For Local by Flywheel =

Edit the file: `conf/nginx/includes/mime-types.conf.hbs` in your site folder and add:

`application/wasm wasm;`

Then restart the site in Local.

== Screenshots ==

1. Rive Block in the block editor with MediaPlaceholder
2. Rive animation playing in the editor
3. Block settings with width and height controls

== Changelog ==

= 0.1.0 =
* Initial release
* Upload and display .riv animation files
* Customizable width and height with multiple CSS units
* Support for multiple animations per page
* Loading states and error handling
* Built with @rive-app/canvas runtime

== Technical Details ==

= Architecture =

* **Editor**: Uses `@rive-app/react-canvas` for React integration in Gutenberg
* **Frontend**: Uses `@rive-app/canvas` for vanilla JavaScript rendering
* **Data Flow**: PHP render.php outputs canvas with data attributes → JavaScript initialization
* **Rendering**: Offscreen rendering enabled for multi-instance support

= Block Attributes =

* `riveFileUrl` (string): URL to the .riv file
* `riveFileId` (number): Media Library attachment ID
* `width` (string, default: "100%"): Block width with CSS unit
* `height` (string, default: "auto"): Block height with CSS unit

= Browser Support =

The plugin supports all modern browsers that support:
* WebAssembly
* Canvas API
* ES6 JavaScript

= Known Limitations =

* Rive files must be uploaded to the WordPress Media Library
* Browser must support WebAssembly for animations to work
* Very large .riv files (>10MB) may impact page load performance
