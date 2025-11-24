# Rive Block for WordPress

A WordPress Gutenberg block plugin for embedding interactive Rive animations (.riv files) in your posts and pages.

## Features

- 🎨 **Upload .riv files** to WordPress Media Library
- 🎭 **Interactive animations** powered by official Rive runtime
- 📐 **Flexible sizing** with support for px, %, em, rem, vh, dvh units
- 🚀 **Optimized rendering** with offscreen rendering for multiple instances
- ⚡ **Loading states** and error handling
- 🔧 **Editor preview** with React integration

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

1. In the block editor, click the "+" icon to add a new block
2. Search for "Rive Block" and insert it
3. Upload or select a .riv file from your Media Library
4. Adjust width and height in the block settings
5. Publish your page

## Performance Optimization (Optional)

By default, the plugin uses a fallback method for loading WebAssembly (WASM) files that works on all servers without configuration.

For optimal performance (~50-200ms faster initial load), configure your web server to serve `.wasm` files with the correct MIME type.

### Performance Impact

| Animation Size | Load Time Difference |
|----------------|---------------------|
| Small (<500KB) | ~50-100ms |
| Medium (500KB-2MB) | ~100-200ms |
| Large (>2MB) | ~200-500ms |

**For most use cases, the fallback method provides excellent performance.**

### Apache Configuration

Add to your `.htaccess` file:

```apache
AddType application/wasm .wasm
```

### nginx Configuration

Add to your nginx `mime.types` or server configuration:

```nginx
types {
    application/wasm wasm;
}
```

Then reload nginx:

```bash
sudo nginx -s reload
```

### Managed Hosting

Contact your hosting provider's support to add the `application/wasm` MIME type for `.wasm` files.

## Technical Architecture

### Editor (edit.js)
- Uses `@rive-app/react-canvas` for React integration
- `RiveCanvas` wrapper component for proper cleanup
- WordPress MediaPlaceholder for file selection
- UnitControl for width/height with multiple CSS units

### Frontend (view.js)
- Uses `@rive-app/canvas` for vanilla JavaScript
- Reads `data-rive-src` attribute from canvas elements
- Initializes Rive instances with offscreen rendering
- Supports multiple animations per page

### Server-side Rendering (render.php)
- Outputs canvas element with block wrapper attributes
- Adds `data-rive-src` attribute for JavaScript initialization
- Applies custom width/height styles

### Data Flow

```
PHP (render.php) → data attributes → JavaScript (view.js) → Rive runtime
```

## Block Attributes

```json
{
  "riveFileUrl": {
    "type": "string"
  },
  "riveFileId": {
    "type": "number"
  },
  "width": {
    "type": "string",
    "default": "100%"
  },
  "height": {
    "type": "string",
    "default": "auto"
  }
}
```

## File Structure

```
rive-block/
├── src/
│   └── rive-block/
│       ├── block.json          # Block metadata
│       ├── index.js            # Block registration
│       ├── edit.js             # Editor component
│       ├── render.php          # Server-side rendering
│       ├── view.js             # Frontend initialization
│       ├── icon.js             # Block icon
│       ├── components/
│       │   └── RiveCanvas.js   # React wrapper for Rive
│       ├── editor.scss         # Editor styles
│       └── style.scss          # Frontend styles
├── build/                      # Production build output
├── rive-block.php              # Main plugin file
├── package.json
└── README.md
```

## Dependencies

- `@rive-app/canvas` - Rive runtime for vanilla JavaScript
- `@rive-app/react-canvas` - Rive runtime for React
- `@wordpress/scripts` - Build tooling

## Browser Support

- Modern browsers with WebAssembly support
- Canvas API support
- ES6 JavaScript support

## Development

### Build Commands

```bash
npm run start    # Development with live reload
npm run build    # Production build
npm run format   # Format code with Prettier
npm run lint:css # Lint styles with stylelint
npm run lint:js  # Lint JavaScript with ESLint
```

## License

GPL-2.0-or-later

## Credits

Built with [@wordpress/create-block](https://github.com/WordPress/gutenberg/tree/trunk/packages/create-block) and powered by [Rive](https://rive.app).

---

# Rive Block til WordPress (Dansk)

Et WordPress Gutenberg block plugin til at indlejre interaktive Rive animationer (.riv filer) i dine indlæg og sider.

## Funktioner

- 🎨 **Upload .riv filer** til WordPress Mediebibliotek
- 🎭 **Interaktive animationer** drevet af officiel Rive runtime
- 📐 **Fleksibel størrelse** med support for px, %, em, rem, vh, dvh enheder
- 🚀 **Optimeret rendering** med offscreen rendering til flere instanser
- ⚡ **Loading states** og fejlhåndtering
- 🔧 **Editor preview** med React integration

## Performance Optimering (Valgfrit)

Som standard bruger plugin'et en fallback-metode til at loade WebAssembly (WASM) filer, der virker på alle servere uden konfiguration.

For optimal performance (~50-200ms hurtigere indledende load), kan du konfigurere din webserver til at serve `.wasm` filer med den korrekte MIME type.

### Performance Påvirkning

| Animations Størrelse | Load Tid Forskel |
|---------------------|------------------|
| Små (<500KB) | ~50-100ms |
| Medium (500KB-2MB) | ~100-200ms |
| Store (>2MB) | ~200-500ms |

**For de fleste anvendelser giver fallback-metoden fremragende performance.**

### Apache Konfiguration

Tilføj til din `.htaccess` fil:

```apache
AddType application/wasm .wasm
```

### nginx Konfiguration

Tilføj til din nginx `mime.types` eller server konfiguration:

```nginx
types {
    application/wasm wasm;
}
```

Genindlæs derefter nginx:

```bash
sudo nginx -s reload
```

### Managed Hosting (f.eks. Simply.com)

Kontakt din hosting udbyders support for at tilføje `application/wasm` MIME type for `.wasm` filer.

## Teknisk Arkitektur

### Editor (edit.js)
- Bruger `@rive-app/react-canvas` til React integration
- `RiveCanvas` wrapper component til proper cleanup
- WordPress MediaPlaceholder til fil-valg
- UnitControl til bredde/højde med flere CSS enheder

### Frontend (view.js)
- Bruger `@rive-app/canvas` til vanilla JavaScript
- Læser `data-rive-src` attribut fra canvas elementer
- Initialiserer Rive instanser med offscreen rendering
- Understøtter flere animationer per side

### Server-side Rendering (render.php)
- Outputter canvas element med block wrapper attributter
- Tilføjer `data-rive-src` attribut til JavaScript initialisering
- Anvender custom bredde/højde styles

## Licens

GPL-2.0-or-later

## Credits

Bygget med [@wordpress/create-block](https://github.com/WordPress/gutenberg/tree/trunk/packages/create-block) og drevet af [Rive](https://rive.app).
