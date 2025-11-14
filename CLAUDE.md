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

A custom WordPress block plugin that enables users to embed and display Rive animations (.riv files) in the WordPress editor and frontend.

**Key Features:**
- MediaPlaceholder workflow for uploading/selecting .riv files from Media Library
- Width and height controls with support for multiple CSS units (px, %, em, rem, vh, dvh)
- Separate implementations for editor (React) and frontend (vanilla JavaScript)
- Loading states and error handling
- Support for multiple Rive blocks on a single page via offscreen rendering

**Architecture Decisions:**
- **Editor (edit.js)**: Uses `@rive-app/react-canvas` for React integration
- **Frontend (view.js)**: Uses `@rive-app/canvas` for vanilla JavaScript
- **Data Flow**: PHP render.php → data attributes → JavaScript initialization
- **Isolation**: RiveCanvas wrapper component ensures proper cleanup when file URL changes

**File Structure:**
```
rive-block/
├── src/
│   └── rive-block/
│       ├── block.json          # Block metadata and attributes
│       ├── index.js            # Block registration
│       ├── edit.js             # Editor component with MediaPlaceholder
│       ├── render.php          # Server-side rendering with data attributes
│       ├── view.js             # Frontend Rive initialization
│       ├── icon.js             # Block icon (SVG)
│       ├── components/
│       │   └── RiveCanvas.js   # React wrapper for Rive in editor
│       ├── editor.scss         # Editor-specific styles
│       └── style.scss          # Frontend and editor shared styles
├── build/                      # Production build output
├── rive-block.php              # Main plugin file with MIME type support
└── package.json                # Dependencies and scripts
```

**Build System:**
```bash
cd app/public/wp-content/plugins/rive-block
npm install
npm run start    # Development with live reload
npm run build    # Production build
```

**Block Attributes (block.json):**
```json
{
  "riveFileUrl": {"type": "string"},
  "riveFileId": {"type": "number"},
  "width": {"type": "string", "default": "100%"},
  "height": {"type": "string", "default": "auto"}
}
```

**Data Flow Pattern:**
1. User uploads/selects .riv file via MediaPlaceholder
2. File URL and ID stored in block attributes
3. **Editor**: RiveCanvas component uses useRive hook to display animation
4. **Frontend**: render.php outputs canvas with `data-rive-src` attribute
5. view.js reads data attribute and initializes vanilla Rive instance

**Key Implementation Details:**

*Editor (RiveCanvas.js):*
```javascript
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

const { rive, RiveComponent } = useRive({
  src: riveFileUrl,
  autoplay: true,
  useOffscreenRenderer: true,
  layout: new Layout({
    fit: Fit.Contain,
    alignment: Alignment.Center
  })
});
```

*Frontend (view.js):*
```javascript
import { Rive } from '@rive-app/canvas';

const canvases = document.querySelectorAll('canvas.wp-block-create-block-rive-block');
canvases.forEach((canvas) => {
  const riveSrc = canvas.dataset.riveSrc;
  const riveInstance = new Rive({
    canvas: canvas,
    src: riveSrc,
    autoplay: true,
    useOffscreenRenderer: true
  });
});
```

*Server-side Rendering (render.php):*
```php
<canvas
  <?php echo get_block_wrapper_attributes([
    'class' => 'rive-block-canvas',
    'style' => 'width: ' . esc_attr($width) . '; height: ' . esc_attr($height) . ';',
    'data-rive-src' => esc_url($rive_file_url)
  ]); ?>>
</canvas>
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

**Important Configurations:**
- `useOffscreenRenderer: true` - Critical for supporting multiple Rive instances on one page
- `Layout` with `Fit.Contain` and `Alignment.Center` - Ensures consistent sizing between editor and frontend
- Reset functionality uses default values from block.json (single source of truth)
- Canvas selector: `'canvas.wp-block-create-block-rive-block'` (class directly on canvas element)

**Known Patterns:**
- Loading states managed via useState hooks in editor
- Error handling with WordPress Notice component
- RiveCanvas wrapper component ensures proper cleanup when riveFileUrl changes
- Width/height controls use UnitControl with multiple CSS unit support

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
