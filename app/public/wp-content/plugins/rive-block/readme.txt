=== Rive Block ===
Contributors:      KaizenStudio
Tags:              block, rive, animation, gutenberg, interactive, webgl2
Requires at least: 6.7
Tested up to:      6.9
Stable tag:        0.1.0
Requires PHP:      7.4
License:           GPL-2.0-or-later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

⚠️ DEVELOPMENT STATUS: This plugin is currently under active development.

Embed interactive Rive animations (.riv files) in your WordPress posts and pages with a custom Gutenberg block.

== ⚠️ IMPORTANT: DEVELOPMENT STATUS ==

This plugin is currently under active development. The API, features, and behavior may change without notice between releases. This documentation reflects the current state of the codebase but may become outdated as the plugin evolves.

**Before using this plugin in production environments, please:**
- Test thoroughly in a staging environment first
- Review recent commits and changelog for breaking changes
- Be prepared to update your integration code as new versions are released
- Report any documentation inaccuracies or missing features via the project repository

Thank you for your understanding as we continue to improve this plugin.

== Description ==

Rive Block is a high-performance WordPress Gutenberg block plugin that enables you to easily embed and display interactive Rive animations directly in the WordPress block editor.

Rive is a powerful design and animation tool that creates interactive graphics that run anywhere. With this plugin, you can:

* Upload .riv animation files to your WordPress Media Library
* Insert Rive animations using the block editor (Gutenberg)
* Customize animation width and height with multiple CSS units (px, %, em, rem, vh, dvh)
* Set loading priority (eager for hero animations, lazy for others)
* Enable/disable autoplay per block
* Add accessibility labels (ARIA) for compliance
* Automatically pause animations when scrolled out of view (GPU optimization)
* Enjoy smooth, crisp animations with multi-tier caching

The plugin uses the official `@rive-app/webgl2-advanced` runtime for optimal performance, vector feathering support, and advanced rendering features.

== Key Features ==

* 🎨 Upload .riv files to WordPress Media Library
* 🎭 Interactive animations with WebGL2-Advanced rendering
* 📐 Flexible sizing with px, %, em, rem, vh, dvh units
* ⚡ Smart loading strategies (eager/lazy loading)
* 🎮 Viewport-aware rendering (pauses animations out of view)
* 🔄 Multi-tier caching (memory, IndexedDB, HTTP)
* ♿ Full accessibility (WCAG, ARIA labels, reduced motion support)
* 🚀 Optimized rendering (offscreen, DPI-aware canvas, FPS-aware)
* ⚙️ Live editor preview with React component
* 🛠️ Developer-friendly with proper resource cleanup

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/rive-block` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. In the block editor, search for "Rive Block" and add it to your page
4. Upload or select a .riv file from your Media Library
5. Customize the width, height, and other settings as needed

== Block Settings ==

All settings are available in the block inspector (right sidebar):

* **Width/Height**: Set with px, %, em, rem, vh, or dvh units
* **Loading Priority**: High (eager) for above-fold, Low (lazy) for below-fold
* **Enable Autoplay**: Play animation on page load
* **Respect Reduced Motion**: Honor user's motion preference
* **ARIA Label**: Short description for screen readers
* **ARIA Description**: Longer description for complex animations

== Frequently Asked Questions ==

= What is Rive? =

Rive is a design and animation tool that allows you to create interactive graphics that run anywhere. Learn more at https://rive.app

= What file formats are supported? =

This plugin supports .riv files created with the Rive editor.

= Can I use multiple Rive animations on one page? =

Yes! The plugin fully supports multiple Rive blocks on a single page with intelligent caching and viewport-based pausing for GPU optimization.

= What CSS units are supported for sizing? =

The plugin supports px, %, em, rem, vh, and dvh units for both width and height, giving you full flexibility in responsive design.

= Can I disable autoplay? =

Yes! Set "Enable autoplay" to OFF in the block settings. This is useful for animations that should only play when user interacts.

= Does it respect user motion preferences? =

Yes! By default, the plugin respects the `prefers-reduced-motion` media query. Users with motion preferences enabled won't see animations unless explicitly enabled in block settings.

= Why do I see WASM errors in the console? =

By default, the plugin uses IndexedDB caching that works on all servers without configuration. If you see WASM fetch errors, the plugin has a fallback method. Check your browser's Network tab to see actual timing.

== Performance Optimization ==

The plugin implements intelligent multi-tier caching:

= Memory Cache (Built-in) =

Prevents duplicate .riv file downloads when multiple blocks use the same file on the same page. Works everywhere, no configuration needed.

= IndexedDB WASM Cache (Built-in) =

Stores WASM runtime bytes in browser IndexedDB for persistent caching across page navigations. Provides ~10-50ms load time on subsequent visits. Works everywhere, no configuration needed.

= HTTP Cache (Optional) =

Configure web server to cache .riv and .wasm files for 7 days. Provides 304 Not Modified responses on repeat visits.

**For Local by Flywheel:**
WASM MIME type and HTTP caching are already configured. No additional setup needed.

**For nginx Servers:**

Add to your nginx configuration:

`types {
    application/wasm wasm;
}

location ~* \.riv$ {
    add_header        Cache-Control "max-age=604800, public, immutable";
    add_header        Content-Type "application/octet-stream";
    add_header        Access-Control-Allow-Origin *;
}

location ~* \.wasm$ {
    expires           7d;
    add_header        Cache-Control "public, immutable";
    add_header        Content-Type "application/wasm";
    add_header        Access-Control-Allow-Origin *;
}`

Then reload nginx: `sudo nginx -s reload`

**For Apache Servers:**

Add to your `.htaccess` file:

`<IfModule mod_headers.c>
    <FilesMatch "\.riv$">
        Header set Cache-Control "public, max-age=604800, immutable"
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
    <FilesMatch "\.wasm$">
        Header set Cache-Control "public, max-age=604800, immutable"
        Header set Content-Type "application/wasm"
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>

AddType application/wasm .wasm`

**For Managed Hosting:**

Contact your hosting provider's support to add:
- `application/wasm` MIME type for `.wasm` files
- 7-day cache headers for `.riv` and `.wasm` files

== Technical Details ==

= Architecture =

* **Runtime**: `@rive-app/webgl2-advanced` for full WebGL2 control
* **Renderer**: Offscreen rendering for multi-instance support
* **FPS**: Respects animation's native FPS from .riv file
* **Loading**: Eager (high priority) or lazy (low priority) strategies
* **Caching**: Memory → IndexedDB → HTTP (multi-tier)
* **GPU Optimization**: Viewport-based animation pausing (IntersectionObserver)
* **Rendering**: DPI-aware canvas sizing for crisp results

= Block Attributes =

* `riveFileUrl` (string): URL to the .riv file
* `riveFileId` (number): Media Library attachment ID
* `width` (string, default: "100%"): Block width with CSS unit
* `height` (string, default: "auto"): Block height with CSS unit
* `enableAutoplay` (boolean, default: true): Play on page load
* `respectReducedMotion` (boolean, default: true): Honor motion preferences
* `ariaLabel` (string): Short accessibility description
* `ariaDescription` (string): Long accessibility description
* `loadingPriority` (string: high|low, default: "low"): Loading strategy

= Accessibility =

The plugin is built with WCAG accessibility in mind:

* **ARIA Labels**: Set short descriptions for screen readers
* **ARIA Descriptions**: Set longer descriptions for complex animations
* **Reduced Motion Support**: Automatically respects user preferences
* **Keyboard Support**: Full keyboard navigation via Rive interactions
* **Color Binding**: Use Rive data binding for runtime color control

= Performance Benchmarks =

With proper nginx configuration (WASM MIME type):
* Small animations (<500KB): ~50-100ms faster load
* Medium animations (500KB-2MB): ~100-200ms faster load
* Large animations (>2MB): ~200-500ms faster load

= Caching Performance =

| Scenario | Memory Cache | IndexedDB Cache | HTTP Cache |
|----------|--------------|-----------------|------------|
| Multiple instances, same page | ✅ 0 requests | 1 network request | 1 network request |
| Navigate to different page | ❌ Full download | ✅ ~10-50ms (disk) | ✅ 304 response |
| After browser restart | ❌ Full download | ✅ ~10-50ms (disk) | ✅ 304 response |
| Configuration required | ✅ None | ✅ None | With web server |

= Browser Support =

The plugin supports all modern browsers that support:
* WebAssembly (all modern browsers)
* Canvas API (all modern browsers)
* ES6+ JavaScript (all modern browsers)
* IntersectionObserver (for viewport pausing)
* IndexedDB (for WASM caching, with HTTP fallback)

Tested on: Chrome 90+, Firefox 88+, Safari 14+, Mobile browsers

= Known Limitations =

* Rive files must be uploaded to the WordPress Media Library
* Browser must support WebAssembly for animations to work
* Very large .riv files (>10MB) may impact initial load
* IndexedDB quota varies by browser (~50MB per origin typically)
* Some enterprise environments may restrict IndexedDB access

== Screenshots ==

1. Rive Block in the block editor with file selection
2. Rive animation preview in the editor with live rendering
3. Block settings with sizing, loading priority, and accessibility controls
4. Viewport-based rendering showing paused animations outside viewport
5. Multi-instance animations on same page with shared WASM runtime

== Changelog ==

= 0.1.0 =
* Initial release
* Upload and display .riv animation files with WebGL2-Advanced rendering
* Customizable width and height with multiple CSS units
* Support for multiple animations per page with intelligent caching
* Viewport-based animation pausing for GPU optimization
* Multi-tier caching: memory, IndexedDB WASM, and HTTP
* Accessibility features: ARIA labels, reduced motion support
* Editor preview with React component and DPI-aware canvas sizing
* Smart loading strategies: eager loading (high priority) and lazy loading (low priority)
* Built with @rive-app/webgl2-advanced runtime for vector feathering and advanced rendering

== Support & Documentation ==

For detailed documentation, see README.md in the plugin folder.

For issues and feature requests, please contact the plugin author.

== Credits ==

Built with [@wordpress/create-block](https://github.com/WordPress/gutenberg/tree/trunk/packages/create-block) and powered by [Rive](https://rive.app).
