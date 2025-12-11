# Rive Block for WordPress

⚠️ **DEVELOPMENT STATUS WARNING**

This plugin is currently under active development. The API, features, and behavior may change without notice between releases. This documentation reflects the current state of the codebase but may become outdated as the plugin evolves. Before using this plugin in production environments, please:

1. Test thoroughly in a staging environment
2. Review recent commits and changelog for breaking changes
3. Be prepared to update documentation and integration code as new versions are released
4. Report any documentation inaccuracies or missing features via the project repository

Thank you for your understanding.

---

A high-performance WordPress Gutenberg block plugin for embedding interactive Rive animations (.riv files) in your posts and pages.

## Features

- 🎨 **Upload .riv files** to WordPress Media Library
- 🎭 **Interactive animations** powered by Rive WebGL2-Advanced renderer
- 📐 **Flexible sizing** with support for px, %, em, rem, vh, dvh units
- ⚡ **Smart loading strategies**: Eager loading for high-priority, lazy loading for low-priority animations
- 🎮 **Viewport-aware rendering**: Automatically pauses animations when scrolled out of view (GPU optimization)
- 🔄 **Multi-tier caching**: Memory cache, IndexedDB WASM cache, and HTTP cache
- ♿ **Accessibility-first**: Full WCAG support with ARIA labels, reduced motion respect, and data binding for color contrast
- 🚀 **Optimized rendering** with WebGL2-Advanced, offscreen rendering, and DPI-aware canvas sizing
- ⚙️ **Block Editor integration** with React component for live preview
- 🛠️ **Developer-friendly** with proper cleanup and resource management

## Installation

### From Source

1. Clone or download this repository to `wp-content/plugins/rive-block/`
2. Install dependencies:
   ```bash
   cd wp-content/plugins/rive-block
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. Activate the plugin in WordPress admin

### Development

For development with live reload:

```bash
npm run start
```

## Usage

### Basic Usage

1. In the block editor, click the "+" icon to add a new block
2. Search for "Rive Block" and insert it
3. Upload or select a .riv file from your Media Library
4. Adjust width and height in the block settings
5. (Optional) Configure accessibility labels in the Accessibility panel
6. Publish your page

### Block Settings

All settings are accessible in the block inspector (right sidebar):

#### Sizing
- **Width**: Set width with px, %, em, rem, vh, or dvw units (default: 100%)
- **Height**: Set height with px, %, em, rem, vh, or dvh units (default: auto)

#### Rive File
- **Current file**: Shows which .riv file is currently selected
- **Change file**: Click to replace with a different animation

#### Animation
- **Enable autoplay**: Play animation automatically on page load (default: enabled)
- **Respect reduced motion**: Pause animation for users with reduced motion preference (default: enabled)

#### Loading
- **Loading priority**:
  - **High**: Eager loading - fetch immediately (for hero/above-fold animations)
  - **Low**: Lazy loading - fetch when scrolled into view (default, best for performance)

#### Accessibility
- **ARIA label**: Short description for screen readers (required for images)
- **ARIA description**: Longer description for complex interactive animations

## Technical Architecture

### Runtime & Renderer

- **Runtime**: `@rive-app/webgl2-advanced` for full WebGL2 control
- **Features**: Vector feathering, advanced rendering, offscreen rendering support
- **FPS**: Respects animation's native FPS from .riv file (prevents wasted GPU cycles)

### Block Attributes

```json
{
  "riveFileUrl": {
    "type": "string",
    "description": "URL to the .riv animation file"
  },
  "riveFileId": {
    "type": "number",
    "description": "WordPress Media Library attachment ID"
  },
  "width": {
    "type": "string",
    "default": "100%",
    "description": "Block width with CSS unit (px, %, em, rem, vh, dvw)"
  },
  "height": {
    "type": "string",
    "default": "auto",
    "description": "Block height with CSS unit (px, %, em, rem, vh, dvh)"
  },
  "enableAutoplay": {
    "type": "boolean",
    "default": true,
    "description": "Play animation on page load"
  },
  "respectReducedMotion": {
    "type": "boolean",
    "default": true,
    "description": "Honor user's reduced motion preference"
  },
  "ariaLabel": {
    "type": "string",
    "default": "",
    "description": "ARIA label for screen readers (required if animation is essential content)"
  },
  "ariaDescription": {
    "type": "string",
    "default": "",
    "description": "ARIA description for complex interactive animations"
  },
  "loadingPriority": {
    "type": "string",
    "enum": ["high", "low"],
    "default": "low",
    "description": "Eager loading (high) or lazy loading (low) strategy"
  }
}
```

### Editor (Block Inspector)

**File**: `src/rive-block/edit.js`

- Uses `RiveCanvas` wrapper component for preview
- MediaPlaceholder for .riv file selection
- UnitControl for width/height with multiple CSS units
- ToolsPanel for resettable settings
- Accessibility controls for ARIA labels

**Component**: `src/rive-block/components/RiveCanvas.js`

- Renders Rive animation in block editor
- DPI-aware canvas sizing for crisp rendering
- Proper cleanup when file URL changes
- Loading states and error handling

### Frontend Rendering (view.js)

**File**: `src/rive-block/view.js`

Data flow:
```
Server (render.php)
  ↓
HTML canvas with data-rive-src attribute
  ↓
JavaScript (view.js)
  ↓
RiveAnimationManager
  ├─ RiveFileLoader (handles caching)
  ├─ RiveRuntimeLoader (loads WASM)
  ├─ RiveAnimationManager (orchestrates lifecycle)
  └─ RiveViewportObserver (pauses when out of view)
  ↓
RiveRenderingEngine (shared render loop)
  ↓
WebGL2-Advanced Renderer on Canvas
```

### Caching Strategy (Multi-Tier)

#### 1. **Memory Cache** (In-Process)
- **File**: `src/rive-block/storage/memory/rive-file-cache.js`
- **Scope**: Same page only
- **Behavior**: Prevents duplicate .riv file downloads when multiple blocks use same file
- **Persistence**: Cleared on page navigation
- **Configuration**: None required - works everywhere

#### 2. **IndexedDB WASM Cache** (Persistent)
- **File**: `src/rive-block/storage/indexeddb/wasm-cache.js`
- **Scope**: Cross-page, cross-session
- **Behavior**: Stores raw WASM bytes (ArrayBuffer) to skip network download
- **Storage**: Browser IndexedDB database `rive-block-wasm-cache`
- **Persistence**: Survives page reload and navigation
- **Configuration**: None required - works everywhere
- **Capacity**: Typically 50MB+ per origin (device-dependent)

#### 3. **HTTP Cache** (Server-Level)
- **Mechanism**: Web server (nginx) cache headers
- **Duration**: 7 days (immutable)
- **Files**: `.riv` and `.wasm` files
- **Configuration**: Built-in to Local by Flywheel setup

### Performance Optimizations

#### Viewport-Based Animation Pausing
**Module**: `src/rive-block/modules/rive-viewport-observer.js`

- **IntersectionObserver**: Detects when animation enters/leaves viewport
- **Behavior**: Pauses rendering when animation scrolls out of view
- **Threshold**: 30% visible (aggressive setting minimizes GPU load)
- **Benefit**: Reduces GPU/CPU usage on pages with multiple animations
- **Compatibility**: All modern browsers

#### DPI-Aware Canvas Sizing
**Module**: `src/rive-block/utils/canvas-utils.js`

- **Purpose**: Render crisp animations on high-DPI displays (Retina, OLED, etc.)
- **Mechanism**: Scales canvas resolution to device pixel ratio (DPR)
- **Behavior**: Automatically applied in editor and frontend
- **Benefit**: Prevents blurry animations on 2x/3x displays

#### FPS-Aware Rendering
**Module**: `src/rive-block/rendering/rive-rendering-engine.js`

- **Mechanism**: Reads native animation FPS from .riv file metadata
- **Behavior**: Renders at animation's FPS (not always 60fps)
- **Benefit**: Avoids wasted GPU cycles rendering identical frames
- **Example**: 30fps animation renders 30 frames/sec, not 60

#### Offscreen Rendering
- **Mechanism**: WebGL2-Advanced renderer with offscreen support
- **Benefit**: Enables multiple animations on single page without conflicts
- **Performance**: No viewport recompilation overhead

### Module Architecture

#### Core Modules

**RiveAnimationManager** (`src/rive-block/modules/rive-animation-manager.js`)
- Orchestrates animation lifecycle
- Handles eager loading (high priority) and lazy loading (low priority)
- Detects page navigation vs reload (preserves memory cache for reload)
- Manages WASM runtime initialization

**RiveFileLoader** (`src/rive-block/modules/rive-file-loader.js`)
- Loads .riv files with caching
- Supports memory cache and IndexedDB WASM cache
- Tracks loaded URLs for smart preloading

**RiveRuntimeLoader** (`src/rive-block/modules/rive-runtime-loader.js`)
- Lazy-loads WebGL2-Advanced WASM runtime
- Handles IndexedDB WASM byte caching
- Shared instance across all blocks on page

**RiveViewportObserver** (`src/rive-block/modules/rive-viewport-observer.js`)
- Sets up IntersectionObserver for viewport detection
- Controls startRenderLoop/pauseRenderLoop
- Shows user-friendly error messages

**RiveRenderingEngine** (`src/rive-block/rendering/rive-rendering-engine.js`)
- Unified rendering loop for editor and frontend
- FPS-aware frame limiting
- Proper cleanup with frame ID tracking

#### Utility Modules

- **canvas-utils.js**: DPI-aware canvas sizing
- **indexed-db-utils.js**: Generic IndexedDB operations (open, save, load)
- **memory-cache-utils.js**: In-memory file caching helpers

#### Storage

- **memory/rive-file-cache.js**: In-memory .riv file cache (frontend)
- **memory/rive-editor-file-cache.js**: In-memory .riv file cache (editor)
- **indexeddb/wasm-cache.js**: IndexedDB WASM byte storage (both)

### Server-Side Rendering (render.php)

- Outputs canvas element with block wrapper attributes
- Adds `data-rive-src` attribute containing animation file URL
- Applies width/height styles from block attributes
- Includes aspect ratio padding for responsive layouts
- Adds ARIA attributes from accessibility settings
- Adds data attributes for loading priority and autoplay flags

### File Structure

```
rive-block/
├── src/rive-block/
│   ├── block.json                    # Block metadata & attributes
│   ├── index.js                      # Block registration
│   ├── edit.js                       # Editor component
│   ├── render.php                    # Server-side rendering
│   ├── view.js                       # Frontend initialization
│   ├── icon.js                       # Block icon (SVG)
│   │
│   ├── components/
│   │   └── RiveCanvas.js             # React editor component with preview
│   │
│   ├── modules/
│   │   ├── rive-animation-manager.js # Lifecycle orchestration
│   │   ├── rive-file-loader.js       # File loading with caching
│   │   ├── rive-runtime-loader.js    # WASM runtime loading
│   │   └── rive-viewport-observer.js # Viewport detection
│   │
│   ├── rendering/
│   │   └── rive-rendering-engine.js  # Unified render loop
│   │
│   ├── storage/
│   │   ├── memory/
│   │   │   ├── rive-file-cache.js       # Frontend memory cache
│   │   │   └── rive-editor-file-cache.js # Editor memory cache
│   │   └── indexeddb/
│   │       └── wasm-cache.js            # Persistent WASM cache
│   │
│   ├── utils/
│   │   ├── canvas-utils.js           # DPI-aware sizing
│   │   ├── indexed-db-utils.js       # Generic IDB operations
│   │   └── memory-cache-utils.js     # Cache utilities
│   │
│   ├── editor.scss                   # Editor-specific styles
│   └── style.scss                    # Frontend styles
│
├── build/                            # Production build output
├── rive-block.php                    # Main plugin file
├── README.md                         # This file
├── readme.txt                        # WordPress.org readme
├── package.json                      # Dependencies & scripts
└── webpack.config.js                 # Custom webpack config
```

## Web Server Configuration

### nginx (Local by Flywheel)

The plugin includes optimized nginx configuration. Verify these are active:

**WASM MIME Type** (`conf/nginx/includes/mime-types.conf.hbs`)
```nginx
types {
    application/wasm wasm;
}
```

**.riv File Caching** (`conf/nginx/site.conf.hbs` - lines 71-83)
```nginx
location ~* \.riv$ {
    access_log        off;
    log_not_found     off;
    add_header        Cache-Control "max-age=604800, public, immutable" always;
    add_header        Content-Type "application/octet-stream" always;
    add_header        Access-Control-Allow-Origin * always;
}
```

**.wasm File Caching** (`conf/nginx/site.conf.hbs` - lines 89-100)
```nginx
location ~* \.wasm$ {
    access_log        off;
    log_not_found     off;
    expires           7d;
    add_header        Cache-Control "public, immutable" always;
    add_header        Content-Type "application/wasm" always;
    add_header        Access-Control-Allow-Origin * always;
}
```

**What these do:**
- WASM MIME type: Tells browser `.wasm` files are WebAssembly (not needed with IndexedDB fallback, but improves load time ~50-200ms)
- .riv caching: 7-day HTTP cache for animation files
- .wasm caching: 7-day HTTP cache for runtime
- CORS headers: Allows editor (different port) to access files

## Performance Benchmarks

### Load Time Improvements

With proper nginx configuration (WASM MIME type):
- Small animations (<500KB): ~50-100ms faster
- Medium animations (500KB-2MB): ~100-200ms faster
- Large animations (>2MB): ~200-500ms faster

### Caching Strategy Comparison

| Scenario | Memory Cache | IndexedDB Cache | HTTP Cache |
|----------|--------------|-----------------|------------|
| **Multiple instances, same page** | ✅ 0 requests after first (instant) | 1 network request | 1 network request |
| **Navigate to different page** | ❌ Full download (new context) | ✅ ~10-50ms (disk) | ✅ 304 Not Modified |
| **After browser restart** | ❌ Full download | ✅ ~10-50ms (disk) | ✅ 304 Not Modified |
| **Configuration needed** | ✅ None (everywhere) | ✅ None (everywhere) | With web server |

**Recommendation:**
- Use **memory cache** by default (no config needed)
- IndexedDB cache (automatic) provides persistent fallback
- HTTP cache (automatic via nginx) gives 304 Not Modified responses
- Combined: Best possible performance without any configuration!

## Accessibility

### WCAG Compliance

The plugin is built with accessibility-first principles:

#### Color Contrast
- Use ARIA labels to describe animations for color-dependent content
- Bind Rive animation colors to ViewModel properties for runtime control
- Test with color contrast checker tools

#### Motion Control
- **Autoplay Control**: Can be disabled per block (default: enabled)
- **Reduced Motion Support**: Automatically respects `prefers-reduced-motion` media query
- **User Control**: Low-priority animations can be triggered by user interaction

#### Interactive Elements
- ARIA labels and descriptions for complex animations
- Semantic HTML with proper element roles
- Keyboard navigation support (via Rive animation interaction)

#### Text Content
- Minimum 14pt font size recommended for embedded text
- Use Data Binding for dynamic text (supports localization)
- Left-aligned text (best for readability)

### ARIA Attributes

**ARIA Label** (required for image animations)
```
Short, concise description (1-2 words)
Example: "Loading animation" or "Product demo"
```

**ARIA Description** (optional, for complex animations)
```
Longer description of what happens when user interacts
Example: "Click to see product rotating in 3D space"
```

### Implementation

Set in block inspector → "Accessibility" panel, then Rive runtime will:
1. Apply attributes to canvas element
2. Allow screen readers to find and describe animation
3. Enable users to skip animations if needed

## Development

### Build Commands

```bash
npm run start    # Development with live reload
npm run build    # Production build
npm run format   # Format code with Prettier
npm run lint:css # Lint styles with stylelint
npm run lint:js  # Lint JavaScript with ESLint
```

### Debugging

Enable debug logging by setting `WP_DEBUG` in `wp-config.php`:

```php
define( 'WP_DEBUG', true );
```

Then check browser console for messages like:
```
[Rive Block] Render loop FPS: 30 (matching animation FPS)
[Rive Block IDB] Loaded WASM from IndexedDB cache (234ms)
[Rive Block] Resuming animation (entered viewport)
```

## Dependencies

- `@rive-app/webgl2-advanced` - Rive WebGL2-Advanced runtime
- `@wordpress/scripts` - Build tooling
- `copy-webpack-plugin` - Copy WASM files during build

## Browser Support

The plugin supports all modern browsers that support:
- WebAssembly (all modern browsers)
- Canvas API (all modern browsers)
- ES6+ JavaScript (all modern browsers)
- IntersectionObserver (for viewport pausing)
- IndexedDB (for WASM caching, with HTTP fallback)

Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

- Rive files must be uploaded to WordPress Media Library
- Browser must support WebAssembly for animations to work
- Very large .riv files (>10MB) may impact initial load
- IndexedDB quota varies by browser (~50MB per origin typically)
- Some enterprise environments may restrict IndexedDB access

## Performance Tips

### For Content Authors
1. Use **high priority** only for above-fold hero animations
2. Use **low priority** (default) for below-fold animations
3. Set **autoplay: disabled** for animations that are supplemental
4. Provide **ARIA labels** for all essential animations

### For Site Administrators
1. Verify nginx configuration is active (check console for WASM load time)
2. Monitor IndexedDB quota usage in browser DevTools
3. Use WebPageTest to measure animation impact on Core Web Vitals
4. Consider CDN caching for frequently-used .riv files

### For Developers
1. Read Rive's [Best Practices](https://rive.app/docs/getting-started/best-practices)
2. Use WebGL2-Advanced renderer for vector feathering effects
3. Keep animations under 500KB for optimal load time
4. Use `data-binding` for runtime color control (accessibility)

## Troubleshooting

### WASM Load Errors

**Error**: "Failed to fetch .wasm" or "undefined is not an object (evaluating 'instance.exports')"

**Solution**:
1. Check browser console for full error message
2. Verify nginx MIME type configuration
3. If using managed hosting, contact provider to add `application/wasm` MIME type
4. Plugin has fallback method that works everywhere

**To enable debug mode**:
```php
// In wp-config.php
define( 'WP_DEBUG', true );
```

### Animation Not Playing

**Possible causes:**
1. .riv file not uploaded (check block settings)
2. Browser doesn't support WebAssembly (very rare)
3. JavaScript disabled (unlikely)
4. CORS error from different domain (check console)

**Solution**:
1. Clear browser cache (Cmd/Ctrl + Shift + R)
2. Try on different browser
3. Check browser console for error messages
4. Verify .riv file is valid (open in Rive Editor)

### High Memory Usage

**Possible causes:**
1. Multiple animations on same page
2. Very large .riv files
3. IndexedDB cache accumulating files

**Solution**:
1. Use **low priority** loading for non-critical animations
2. Split large animations into smaller segments
3. Clear IndexedDB cache: DevTools → Application → IndexedDB → Delete

## License

GPL-2.0-or-later

## Credits

Built with [@wordpress/create-block](https://github.com/WordPress/gutenberg/tree/trunk/packages/create-block) and powered by [Rive](https://rive.app).

## Support

For issues and feature requests, please contact the plugin author.

---

# Rive Block til WordPress (Dansk)

En højperformant WordPress Gutenberg block plugin til at indlejre interaktive Rive animationer (.riv filer) i dine indlæg og sider.

## Funktioner

- 🎨 **Upload .riv filer** til WordPress Mediebibliotek
- 🎭 **Interaktive animationer** drevet af Rive WebGL2-Advanced renderer
- 📐 **Fleksibel størrelse** med support for px, %, em, rem, vh, dvh enheder
- ⚡ **Intelligente indlæsningsstrategier**: Hurtig indlæsning for synlige animationer, lazy loading for skjulte
- 🎮 **Viewport-aware rendering**: Pauser automatisk animationer når de scrolles ud af billedet (GPU optimering)
- 🔄 **Multi-lag caching**: Memory cache, IndexedDB WASM cache, og HTTP cache
- ♿ **Accessibility-first**: Fuld WCAG support med ARIA labels, respekt for reduced motion preference
- 🚀 **Optimeret rendering** med WebGL2-Advanced, offscreen rendering, og DPI-aware canvas sizing
- ⚙️ **Block editor integration** med React component til live preview
- 🛠️ **Udvikler-venlig** med korrekt cleanup og resource management

## Teknisk Arkitektur

Se ovenstående engelske dokumentation for detaljer om:
- Runtime & Renderer
- Block Attributes
- Editor & Frontend arkitektur
- Caching strategi
- Performance optimiseringer
- Modul arkitektur
- Web server konfiguration
