# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress development environment for the KaizenStudio project. It uses:
- A parent-child theme architecture based on Twenty Twenty-Five
- Custom block theme development with `@wordpress/scripts`
- Block-based development approach (Gutenberg blocks)

## Directory Structure

```
app/
├── public/               # WordPress installation root
│   └── wp-content/
│       ├── themes/
│       │   ├── twentytwentyfive/           # Parent theme (WordPress default)
│       │   ├── kaizenstudio/               # Custom block theme with custom blocks
│       │   └── kaizenstudio-dev-child/     # Active child theme
│       └── plugins/
│           ├── rive-block/                 # Rive animation block plugin
│           ├── create-block-theme/         # Theme creation tool
│           └── svg-support/                # SVG support plugin
├── sql/                  # Database dumps
conf/                     # Server configuration (nginx, php, mysql)
logs/                     # Server logs
```

## Theme Architecture

### kaizenstudio (Custom Block Theme)
Located at: `app/public/wp-content/themes/kaizenstudio/`

This theme contains custom Gutenberg blocks built with `@wordpress/scripts`:
- **myheader** - Custom header block
- **myfooter** - Custom footer block with attributes (headingText, showWeight)

**Build System:**
```bash
cd app/public/wp-content/themes/kaizenstudio
npm install
npm run start    # Development with live reload
npm run build    # Production build
npm run format   # Format code with Prettier
npm run lint:css # Lint styles with stylelint
npm run lint:js  # Lint JavaScript with ESLint
```

**Block Development:**
- Source files: `src/{block-name}/`
  - `block.json` - Block metadata (API v3)
  - `edit.js` - Editor component
  - `render.php` - Server-side rendering
  - `view.js` - Frontend interactivity
  - `*.scss` - Styles (editor and frontend)
- Build output: `build/{block-name}/`
- Uses `blocks-manifest.php` for efficient block registration (WordPress 6.7+)

### kaizenstudio-dev-child (Active Child Theme)
Located at: `app/public/wp-content/themes/kaizenstudio-dev-child/`
Template: `twentytwentyfive`

**Key Features:**
- Enqueues custom styles (required for WordPress 6.3+ block themes)
- Custom block variations (JavaScript-based registration)
  - 4-column layout variation for core/columns block
  - Located in `blocks/variations/columns-variation.js`
- Custom template part areas (hero-section-benjamin)
- Custom block pattern category ("Benjamin")
- Removes default WordPress core patterns and parent theme patterns
- Removes certain admin menu items (Posts, Pages, Comments)
- Custom block editor scripts via `myguten.js`

**Custom Files:**
- `functions.php` - Theme setup and customizations
- `style.css` - Custom styles (text-box-trim, custom classes like `kzs_underline_offset`)
- `blocks/variations/` - Block variations
- `patterns/` - Custom block patterns
- `templates/` - Custom page templates

## Development Workflow

### Working with the Custom Block Theme
When modifying blocks in `kaizenstudio`:

1. Navigate to theme directory:
   ```bash
   cd app/public/wp-content/themes/kaizenstudio
   ```

2. Start development server:
   ```bash
   npm run start
   ```

3. Make changes to source files in `src/{block-name}/`

4. Build for production:
   ```bash
   npm run build
   ```

### Working with the Child Theme
The child theme (`kaizenstudio-dev-child`) is the active theme and extends Twenty Twenty-Five.

**To add block variations:**
1. Create JavaScript file in `blocks/variations/`
2. Register via `enqueue_block_editor_assets` hook in `functions.php`
3. Use `wp.blocks.registerBlockVariation()` with proper dependencies

**To add patterns:**
1. Create PHP file in `patterns/`
2. Follow WordPress block pattern format

**To add templates:**
1. Create HTML file in `templates/`
2. Use block template syntax

## Block Registration Pattern

The `kaizenstudio` theme uses modern block registration:

```php
// functions.php - Registers blocks using blocks-manifest.php
wp_register_block_types_from_metadata_collection(
    __DIR__ . '/build',
    __DIR__ . '/build/blocks-manifest.php'
);
```

This provides better performance by registering blocks via manifest file generated during build.

## Plugin Architecture

### rive-block (Rive Animation Block Plugin)
Located at: `app/public/wp-content/plugins/rive-block/`

A production-ready WordPress block plugin that enables users to embed and display interactive Rive animations (.riv files) with advanced performance optimization, accessibility features, and intelligent caching.

**Key Features:**
- 🎨 **MediaPlaceholder workflow** for uploading/selecting .riv files from Media Library
- 📐 **Flexible sizing** with support for multiple CSS units (px, %, em, rem, vh, dvh, dvw)
- ⚡ **Smart loading strategies**: Eager loading (high priority) for hero animations, lazy loading (low priority) for below-fold content
- 🎮 **Viewport-aware rendering**: Automatically pauses animations when scrolled out of view (GPU optimization via IntersectionObserver)
- 🔄 **Multi-tier caching**: Memory cache → IndexedDB WASM cache → HTTP cache for optimal performance
- ♿ **Full WCAG accessibility**: ARIA labels, reduced motion support, autoplay control
- 🚀 **Advanced rendering**: WebGL2-Advanced runtime, DPI-aware canvas sizing, FPS-aware rendering, offscreen rendering
- ⚙️ **Block editor integration**: React component with live preview, loading states, and error handling
- 🛠️ **Production-ready**: Proper resource cleanup, ResizeObserver, bfcache support, WASM preloading

**Architecture Decisions:**

**Runtime & Renderer:**
- **Runtime**: `@rive-app/webgl2-advanced` - Full control over Rive runtime with WebGL2 support
- **Features**: Vector feathering, advanced rendering, offscreen rendering support
- **FPS**: Respects animation's native FPS from .riv file (prevents wasted GPU cycles)
- **DPI**: Automatic canvas scaling to device pixel ratio for crisp rendering on Retina displays

**Data Flow:**
```
Server (render.php)
  ↓
HTML canvas with data-rive-src attribute
  ↓
JavaScript (view.js)
  ↓
RiveAnimationManager
  ├─ RiveFileLoader (handles .riv file caching)
  ├─ RiveRuntimeLoader (loads WASM + IndexedDB caching)
  ├─ RiveAnimationManager (orchestrates lifecycle)
  └─ RiveViewportObserver (pauses when out of view)
  ↓
RiveRenderingEngine (shared render loop)
  ↓
WebGL2-Advanced Renderer on Canvas
```

**Modular Architecture:**

The plugin uses a highly modular architecture for maintainability and performance:

```
Core Modules:
├── RiveAnimationManager       # Lifecycle orchestration
│   ├── Handles eager/lazy loading strategies
│   ├── Detects page navigation vs reload (preserves cache)
│   └── Manages WASM runtime initialization
│
├── RiveFileLoader             # .riv file loading with caching
│   ├── Memory cache for same-page instances
│   ├── HTTP cache optimization
│   └── Tracks loaded URLs for preloading
│
├── RiveRuntimeLoader          # WASM runtime loading
│   ├── IndexedDB byte caching (persistent)
│   ├── Shared instance across all blocks
│   └── Fallback to network fetch
│
├── RiveViewportObserver       # Viewport detection
│   ├── IntersectionObserver for visibility
│   ├── Automatic pause/resume on scroll
│   └── User-friendly error messages
│
└── RiveRenderingEngine        # Unified rendering
    ├── FPS-aware frame limiting
    ├── Shared render loop (editor + frontend)
    └── Proper cleanup with frame ID tracking

Utility Modules:
├── canvas-utils.js            # DPI-aware canvas sizing
├── indexed-db-utils.js        # Generic IndexedDB operations
└── memory-cache-utils.js      # In-memory file caching helpers

Storage:
├── memory/rive-file-cache.js        # Frontend memory cache
├── memory/rive-editor-file-cache.js # Editor memory cache
└── indexeddb/wasm-cache.js          # Persistent WASM cache
```

**File Structure:**
```
rive-block/
├── src/
│   └── rive-block/
│       ├── block.json          # Block metadata and attributes
│       ├── index.js            # Block registration
│       ├── edit.js             # Editor component with MediaPlaceholder
│       ├── render.php          # Server-side rendering with data attributes
│       ├── view.js             # Frontend initialization
│       ├── icon.js             # Block icon (SVG)
│       │
│       ├── components/
│       │   └── RiveCanvas.js   # React editor component with preview
│       │
│       ├── modules/
│       │   ├── rive-animation-manager.js # Lifecycle orchestration
│       │   ├── rive-file-loader.js       # File loading with caching
│       │   ├── rive-runtime-loader.js    # WASM runtime loading
│       │   └── rive-viewport-observer.js # Viewport detection
│       │
│       ├── rendering/
│       │   └── rive-rendering-engine.js  # Unified render loop
│       │
│       ├── storage/
│       │   ├── memory/
│       │   │   ├── rive-file-cache.js       # Frontend memory cache
│       │   │   └── rive-editor-file-cache.js # Editor memory cache
│       │   └── indexeddb/
│       │       └── wasm-cache.js            # Persistent WASM cache
│       │
│       ├── utils/
│       │   ├── canvas-utils.js           # DPI-aware sizing
│       │   ├── indexed-db-utils.js       # Generic IDB operations
│       │   └── memory-cache-utils.js     # Cache utilities
│       │
│       ├── editor.scss         # Editor-specific styles
│       └── style.scss          # Frontend styles
│
├── build/                      # Production build output
│   └── rive-block/
│       └── webgl2_advanced.wasm # WebGL2-Advanced WASM runtime
├── rive-block.php              # Main plugin file
├── README.md                   # Full documentation
├── readme.txt                  # WordPress.org readme
└── package.json                # Dependencies and scripts
```

**Build System:**
```bash
cd app/public/wp-content/plugins/rive-block
npm install
npm run start    # Development with live reload
npm run build    # Production build
npm run format   # Format code with Prettier
npm run lint:css # Lint styles with stylelint
npm run lint:js  # Lint JavaScript with ESLint
```

**Block Attributes (block.json):**
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

**Performance Features:**

**1. Multi-Tier Caching Strategy:**
```
Memory Cache (In-Process)
├─ Scope: Same page only
├─ Behavior: Prevents duplicate .riv downloads when multiple blocks use same file
├─ Persistence: Cleared on page navigation
└─ Configuration: None required - works everywhere

IndexedDB WASM Cache (Persistent)
├─ Scope: Cross-page, cross-session
├─ Behavior: Stores raw WASM bytes (ArrayBuffer) to skip network download
├─ Storage: Browser IndexedDB database 'rive-block-wasm-cache'
├─ Persistence: Survives page reload and navigation
├─ Configuration: None required - works everywhere
└─ Capacity: Typically 50MB+ per origin (device-dependent)

HTTP Cache (Server-Level)
├─ Mechanism: Web server (nginx) cache headers
├─ Duration: 7 days (immutable)
├─ Files: .riv and .wasm files
└─ Configuration: Built-in to Local by Flywheel setup
```

**2. Viewport-Based Animation Pausing:**
- **IntersectionObserver**: Detects when animation enters/leaves viewport
- **Behavior**: Pauses rendering when animation scrolls out of view
- **Threshold**: 30% visible (aggressive setting minimizes GPU load)
- **Benefit**: Reduces GPU/CPU usage on pages with multiple animations

**3. DPI-Aware Canvas Sizing:**
- **Purpose**: Render crisp animations on high-DPI displays (Retina, OLED, etc.)
- **Mechanism**: Scales canvas resolution to device pixel ratio (DPR)
- **Benefit**: Prevents blurry animations on 2x/3x displays

**4. FPS-Aware Rendering:**
- **Mechanism**: Reads native animation FPS from .riv file metadata
- **Behavior**: Renders at animation's FPS (not always 60fps)
- **Benefit**: Avoids wasted GPU cycles rendering identical frames
- **Example**: 30fps animation renders 30 frames/sec, not 60

**5. Smart Loading Strategies:**
- **High Priority (Eager Loading)**: Loads immediately for hero/above-fold animations
- **Low Priority (Lazy Loading)**: Loads when scrolled into view (default, best for performance)
- **IntersectionObserver**: Triggers load 50px before entering viewport

**Editor Implementation (RiveCanvas.js):**
```javascript
import { useEffect, useState, useRef } from '@wordpress/element';
import { setCanvasDPIAwareSize } from '../utils/canvas-utils';
import { RiveFileLoader } from '../modules/rive-file-loader';
import { riveRuntimeLoader } from '../modules/rive-runtime-loader';
import { startRenderLoop, renderFrame } from '../rendering/rive-rendering-engine';

// Load Rive runtime
const rive = await riveRuntimeLoader.load();

// Load .riv file (uses editor memory cache)
const file = await fileLoader.load(rive, riveFileUrl);

// Get artboard and create renderer
const artboard = file.defaultArtboard();
setCanvasDPIAwareSize(canvasRef.current, '[Rive Editor]');
const renderer = rive.makeRenderer(canvasRef.current, true);

// Create animation instance
const animation = artboard.animationByIndex(0);
const animationInstance = new rive.LinearAnimationInstance(animation, artboard);
const animationFPS = animation.fps || 60; // Native FPS from .riv

// Start render loop
const context = { rive, artboard, renderer, animation: animationInstance, canvas: canvasRef.current, animationFPS };
startRenderLoop(context);
```

**Frontend Implementation (view.js):**
```javascript
import { RiveAnimationManager } from './modules/rive-animation-manager';
import { RiveFileLoader } from './modules/rive-file-loader';

// Initialize file loader with frontend cache
const fileLoader = new RiveFileLoader(getCachedFile, setCachedFile, isUrlLoaded, '[Rive Block]');

// Initialize animation manager
const animationManager = new RiveAnimationManager(fileLoader);

// Initialize when DOM is ready
animationManager.initialize();

// Re-initialize when page is restored from bfcache (back/forward cache)
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    animationManager.initialize();
  }
});
```

**Server-Side Rendering (render.php):**
```php
<?php
// Build wrapper attributes with data attributes for JavaScript
$wrapper_attributes = [
  'style' => 'width: ' . esc_attr($width) . '; height: ' . esc_attr($height) . ';',
  'data-rive-src' => esc_url($rive_file_url),
  'data-enable-autoplay' => $enable_autoplay ? 'true' : 'false',
  'data-respect-reduced-motion' => $respect_reduced_motion ? 'true' : 'false',
  'data-loading-priority' => esc_attr($loading_priority),
];

// Add ARIA attributes if provided
if (!empty($aria_label)) {
  $wrapper_attributes['role'] = 'img';
  $wrapper_attributes['aria-label'] = esc_attr($aria_label);
}
if (!empty($aria_description)) {
  $wrapper_attributes['aria-description'] = esc_attr($aria_description);
}
?>
<div class="rive-block-container" style="position: relative; width: <?php echo esc_attr($width); ?>; padding-bottom: <?php echo esc_attr($aspect_ratio); ?>;">
  <canvas <?php echo wp_kses_post(get_block_wrapper_attributes(array_merge($wrapper_attributes, [
    'style' => 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
  ]))); ?>></canvas>
</div>
```

**MIME Type Support:**
The plugin adds support for .riv file uploads in WordPress:

```php
// rive-block.php
function rive_block_allow_riv_uploads( $mimes ) {
  $mimes['riv'] = 'application/octet-stream';
  return $mimes;
}
add_filter( 'upload_mimes', 'rive_block_allow_riv_uploads' );
```

**WASM Preloading:**
The plugin preloads the WASM file for faster initialization:

```php
function rive_block_preload_wasm() {
  if (is_admin()) return;

  global $post;
  if (!$post || !has_block('create-block/rive-block', $post)) return;

  $wasm_url = plugins_url('rive-block/build/rive-block/webgl2_advanced.wasm');
  echo '<link rel="preload" href="' . esc_url($wasm_url) . '" as="fetch" type="application/wasm" crossorigin="anonymous">' . "\n";
}
add_action('wp_head', 'rive_block_preload_wasm', 1);
```

**Accessibility Implementation:**

The plugin implements WCAG accessibility features:

**Block Inspector Controls (edit.js):**
- **ToggleControl** for Enable Autoplay (with WCAG AAA warning)
- **ToggleControl** for Respect Reduced Motion
- **TextControl** for ARIA Label
- **TextareaControl** for ARIA Description
- **SelectControl** for Loading Priority

**Frontend Accessibility (view.js):**
```javascript
// Check user's motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Determine if autoplay should be enabled
const shouldAutoplay = enableAutoplay && !(respectReducedMotion && prefersReducedMotion);
```

**Important Configurations:**
- **WebGL2-Advanced Runtime**: Full control over rendering, vector feathering support
- **Offscreen Rendering**: `rive.makeRenderer(canvas, true)` - Enables multiple instances on one page
- **DPI-Aware Canvas**: `setCanvasDPIAwareSize()` - Crisp rendering on Retina displays
- **FPS-Aware Rendering**: Reads `animation.fps` from .riv file - Prevents wasted GPU cycles
- **Viewport Pausing**: IntersectionObserver with 30% threshold - GPU optimization
- **Multi-Tier Caching**: Memory → IndexedDB → HTTP - Optimal load times
- **Smart Loading**: Eager (high priority) vs lazy (low priority) - Performance optimization
- **bfcache Support**: Re-initializes on `pageshow` event - Handles browser back/forward
- **ResizeObserver**: Debounced resize handler (150ms) - Handles window resize/orientation change
- **Proper Cleanup**: Deletes animation, renderer, artboard instances - Prevents memory leaks

**Known Patterns:**
- Loading states managed via useState hooks in editor
- Error handling with WordPress Notice component
- RiveCanvas wrapper component ensures proper cleanup when riveFileUrl changes
- Width/height controls use UnitControl with multiple CSS unit support
- ToolsPanel with ToolsPanelItem for resettable settings
- Accessibility panel with WCAG level indicators
- Performance panel with loading priority explanation

**Performance Benchmarks:**

With proper nginx configuration (WASM MIME type):
- Small animations (<500KB): ~50-100ms faster
- Medium animations (500KB-2MB): ~100-200ms faster
- Large animations (>2MB): ~200-500ms faster

Caching strategy comparison:

| Scenario | Memory Cache | IndexedDB Cache | HTTP Cache |
|----------|--------------|-----------------|------------|
| Multiple instances, same page | ✅ 0 requests after first (instant) | 1 network request | 1 network request |
| Navigate to different page | ❌ Full download (new context) | ✅ ~10-50ms (disk) | ✅ 304 Not Modified |
| After browser restart | ❌ Full download | ✅ ~10-50ms (disk) | ✅ 304 Not Modified |
| Configuration needed | ✅ None (everywhere) | ✅ None (everywhere) | With web server |

### CRITICAL: Rive Accessibility Guidelines (HIGHEST PRIORITY)

**Context:** With the European Accessibility Act in effect (2025), accessible design is both a legal requirement and best practice. All Rive implementations MUST prioritize accessibility from the start, not as an afterthought.

**WCAG Compliance Targets:**
- Minimum: AA level (recommended standard)
- Goal: AAA level where achievable
- Reference: Web Content Accessibility Guidelines (WCAG 2.x)

#### 1. Color Contrast (WCAG 2.3.2, 2.3.3)

**CRITICAL REQUIREMENTS:**
- Use Data Binding for all colors in Rive animations
- Bind colors to Color Properties in View Models for easy runtime control
- Test all text/background combinations with color contrast checkers
- Target: AA minimum (4.5:1 for normal text, 3:1 for large text)
- Goal: AAA level (7:1 for normal text, 4.5:1 for large text)

**Implementation Pattern:**
```javascript
// In Rive: Bind fill colors to ViewModel Color Properties
// In WordPress: Add color controls that update data-bound values
const riveInstance = new Rive({
  canvas: canvas,
  src: riveSrc,
  autoplay: true,
  onLoad: () => {
    // Update colors via Data Binding for contrast
    const inputs = riveInstance.stateMachineInputs('StateMachineName');
    const bgColor = inputs.find(i => i.name === 'backgroundColor');
    const textColor = inputs.find(i => i.name === 'textColor');
    // Set AAA-compliant colors
  }
});
```

**Tools:** Bookmark multiple color contrast checkers (e.g., WebAIM, Coolors, Adobe Color)

#### 2. Text Accessibility

**CRITICAL REQUIREMENTS:**
- Minimum font size: 14pt (18.5px)
- Text alignment: Left-aligned (primary), center-aligned (acceptable), NEVER fully justified
- Wrap all text in Rive Layouts with background colors for contrast flexibility
- Use Rive Text with Data Binding for localization support (RTL languages, etc.)
- Layouts auto-scale with text, maintaining readability at all zoom levels

**Layout Pattern:**
- Create Layout container around text elements
- Add background color to Layout (not directly to text)
- Layout automatically fits text regardless of zoom/resolution
- Supports dynamic text changes via Data Binding

#### 3. Draw Order for Visual Hierarchy

**Purpose:** Prevent important content from being obscured by animations

**Implementation:**
- Use Draw Order property (not hierarchy reordering) to control layer visibility
- Target actual layers/shapes, NOT groups
- Keep vital text and UI elements always visible above decorative animations
- Test with screen readers to ensure logical reading order

#### 4. Motion Control via State Machines (WCAG AAA 2.3.3)

**CRITICAL REQUIREMENTS - Motion Safety:**

**Autoplay Control:**
- Question every autoplay decision: Is it essential to the experience?
- Prefer user-initiated animations over autoplay
- Use State Machine triggers + playback speed control
- Set timeline playback to 0x for full user control
- This achieves WCAG AAA "Animation from Interactions" (2.3.3)

**Implementation Pattern:**
```javascript
// State Machine with user control
const riveInstance = new Rive({
  canvas: canvas,
  src: riveSrc,
  autoplay: false, // User-initiated
  stateMachines: 'ControlledAnimation',
  onLoad: () => {
    const inputs = riveInstance.stateMachineInputs('ControlledAnimation');
    const playbackSpeed = inputs.find(i => i.name === 'speed');
    playbackSpeed.value = 0; // User controls playback
  }
});
```

**Framerate Standard:**
- Always use 60fps (Rive default) - provides smooth, jitter-free motion
- Reduces motion blur that can overwhelm users with vestibular disorders
- Never reduce framerate for "artistic" effect if it increases jitter

**Flashing Content (WCAG AAA 2.3.2 - Three Flashes):**
- Maximum: 3 flashes per second OR less than 25% of view area
- At 60fps: 1 flash per 20 frames minimum
- Test all transitions and effects for flash patterns
- Meeting this criterion = AAA level compliance

**Reduced Motion Support:**
```javascript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const riveInstance = new Rive({
  canvas: canvas,
  src: riveSrc,
  autoplay: !prefersReducedMotion, // Disable for reduced motion users
  onLoad: () => {
    if (prefersReducedMotion) {
      // Show static state or simplified version
      const inputs = riveInstance.stateMachineInputs('StateMachine');
      const motionControl = inputs.find(i => i.name === 'reduceMotion');
      if (motionControl) motionControl.value = true;
    }
  }
});
```

#### 5. Interactive Elements & Touch Targets

**Button Sizing (WCAG 2.5.5):**
- Minimum size: 24x24 pixels (consider HDPI displays make this smaller visually)
- Recommended: 44x44 pixels or larger for better accessibility
- Use Rive Layouts with Padding to create larger hit areas
- Ensure adequate spacing between interactive elements (minimum 8px)

**Implementation:**
- Design buttons with Layouts, not raw shapes
- Add Padding property to Layout for touch target expansion
- Test on mobile devices with various screen densities
- Consider thumb zones on mobile (bottom and middle of screen easiest)

#### 6. Future-Proofing with Rive Features

**Data Binding Preparation:**
Rive's team is developing built-in accessibility features:
- Semantic roles (button, heading, label, etc.)
- Navigation order
- ARIA labels
- Direct .riv file metadata for screen readers

**Current Approach:**
- Manually create semantic information at runtime
- Use Data Binding to expose accessibility values
- Structure View Models with accessibility in mind
- Document semantic structure for developers

**Example Structure:**
```javascript
// Prepare for future semantic support
const accessibilityData = {
  role: 'button',
  label: 'Play Animation',
  description: 'Starts the hero animation sequence'
};

// Expose via data attributes for screen readers
canvas.setAttribute('role', accessibilityData.role);
canvas.setAttribute('aria-label', accessibilityData.label);
canvas.setAttribute('aria-description', accessibilityData.description);
```

#### 7. Testing Checklist

**Before Every Rive Implementation:**
- [ ] Run color contrast checker on all text/background combinations
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Verify keyboard navigation works (Tab, Enter, Space)
- [ ] Check reduced motion preference handling
- [ ] Validate button/touch target sizes (inspect mode)
- [ ] Test at 200% and 400% zoom levels
- [ ] Count flashes in any blinking/transitioning elements (max 3/second)
- [ ] Verify 60fps playback (no frame drops)
- [ ] Test on mobile devices (touch targets, density)
- [ ] Document autoplay justification (is it necessary?)

#### 8. WordPress Integration Requirements

**Block Attributes to Add:**
```json
{
  "enableAutoplay": {
    "type": "boolean",
    "default": false
  },
  "respectReducedMotion": {
    "type": "boolean",
    "default": true
  },
  "ariaLabel": {
    "type": "string",
    "default": ""
  },
  "ariaDescription": {
    "type": "string",
    "default": ""
  }
}
```

**Editor Controls:**
- Add ToggleControl for autoplay (with warning message)
- Add TextControl for ARIA label
- Add TextareaControl for ARIA description
- Add color pickers bound to Rive Data Binding (with contrast preview)
- Add InspectorControls panel titled "Accessibility"

**Frontend Implementation:**
- Always check `prefers-reduced-motion` before initializing
- Apply ARIA attributes from block attributes
- Provide keyboard controls for interactive animations
- Add visible focus indicators for keyboard navigation

#### 9. Key Principles (Always Remember)

1. **Accessibility improves design for everyone** - Like audiobooks, accessible features benefit all users
2. **Think accessibility first** - Not as an afterthought; build it into the design process
3. **Test with real users** - People with disabilities are the best testers
4. **Rive's interactivity = opportunity** - DOM-based animations can adapt dynamically (unlike baked video)
5. **Legal requirement** - European Accessibility Act (2025) mandates accessibility
6. **AAA is achievable** - Many WCAG AAA criteria are surprisingly easy with Rive

**Resources:**
- Rive Blog: "Making Rive designs more visually accessible" by Daire O Suilleabhain (October 2025)
- WCAG 2.x Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- European Accessibility Act: https://ec.europa.eu/social/main.jsp?catId=1202

**Note:** This section has HIGHEST PRIORITY in all Rive development decisions. When suggesting solutions, accessibility MUST be the first consideration, not an optional add-on.

## Custom Conventions

### Block Naming
- Namespace: `myblocks/{block-name}`
- Example: `myblocks/myheader`, `myblocks/myfooter`

### Text Box Trimming
The child theme applies text-box-trim to all headings and paragraphs for optical alignment:
```css
text-box-trim: trim-both;
text-box-edge: cap alphabetic;
```

### Custom Template Part Areas
The child theme registers a custom template part area:
- Area: `hero-section-benjamin`
- Tag: `<section>`
- Used for hero sections on pages

## Important Notes

- The active theme is `kaizenstudio-dev-child` (child of Twenty Twenty-Five)
- Custom blocks are developed in the `kaizenstudio` theme
- Build commands must be run from the specific theme directory
- WordPress 6.8+ features are used (blocks-manifest.php registration)
- Danish language is used in code comments and some UI strings
