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
