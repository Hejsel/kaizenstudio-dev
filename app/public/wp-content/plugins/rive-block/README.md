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

## HTTP Caching for .riv Files (Advanced - Optional)

By default, the plugin uses **in-memory JavaScript caching** that automatically prevents duplicate loading when the **same .riv file is used multiple times on the same page**. This works perfectly on all servers without any configuration.

**Important:** JavaScript in-memory cache does NOT persist across page navigations. When you navigate from Page A to Page B, the browser terminates the JavaScript execution context, and the cache is cleared. This is normal browser behavior.

For **persistent cross-page caching**, you can optionally configure HTTP cache headers on your web server. This allows browsers to cache .riv files on disk, so they're instantly available on subsequent page loads.

### Performance Comparison

| Scenario | In-Memory Cache (Built-in) | HTTP Cache (Optional) |
|----------|----------------------------|----------------------|
| **Multiple instances on same page** | ✅ 0 requests after first (instant) | 1 request per file |
| **Navigating to different page** | Full download (new context) | ✅ 304 Not Modified |
| **After browser restart** | Full download | ✅ 304 Not Modified |
| **Configuration required** | ✅ None (works everywhere) | Server configuration needed |

**Recommendation:**
- If you use the **same .riv file multiple times on one page** → In-memory cache handles it perfectly ✅
- If you use the **same .riv file across different pages** → Configure HTTP cache headers for instant loading 🚀

### Apache Configuration

Add to your `.htaccess` file:

```apache
<IfModule mod_headers.c>
    <FilesMatch "\.riv$">
        # Cache for 7 days
        Header set Cache-Control "public, max-age=604800, immutable"

        # Allow CORS if needed
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>
```

### nginx Configuration

Add to your nginx server configuration or site.conf:

```nginx
# Rive animation files (.riv)
location ~* \.riv$ {
    access_log        off;
    log_not_found     off;

    expires           7d;
    add_header        Cache-Control "public, immutable";

    # Allow CORS if needed
    add_header        Access-Control-Allow-Origin *;
}
```

Then reload nginx:

```bash
sudo nginx -s reload
```

### Local by Flywheel

For local development, edit `conf/nginx/site.conf.hbs` in your Local site folder and add the nginx configuration above before the `# PHP-FPM` section.

Then restart the site in Local.

### Managed Hosting

Contact your hosting provider's support to add cache headers for `.riv` files. Some hosts (like WP Engine, Kinsta) may already cache static files automatically.

### Cache Duration Explained

- **7 days (604800 seconds)**: Good balance for production sites
- **immutable**: Tells browser file will never change (rename file if updated)
- **public**: Allows CDNs and proxies to cache the file

**Important:** If you update a .riv file, either:
1. Upload it with a new filename, or
2. Clear browser cache manually, or
3. Add cache busting query parameters (handled automatically by WordPress Media Library)

---

## HTTP Caching for .riv Filer (Avanceret - Valgfrit)

Som standard bruger plugin'et **in-memory JavaScript caching**, der automatisk forhindrer duplikat indlæsning når **samme .riv fil bruges flere gange på samme side**. Dette virker perfekt på alle servere uden konfiguration.

**Vigtigt:** JavaScript in-memory cache persisterer IKKE på tværs af side-navigationer. Når du navigerer fra Side A til Side B, terminerer browseren JavaScript execution context, og cachen bliver ryddet. Dette er normal browser-adfærd.

For **persistent cross-page caching** kan du valgfrit konfigurere HTTP cache headers på din webserver. Dette gør det muligt for browsere at cache .riv filer på disk, så de er øjeblikkeligt tilgængelige ved efterfølgende side-loads.

### Performance Sammenligning

| Scenario | In-Memory Cache (Indbygget) | HTTP Cache (Valgfrit) |
|----------|-----------------------------|-----------------------|
| **Flere instanser på samme side** | ✅ 0 requests efter første (øjeblikkelig) | 1 request per fil |
| **Navigering til anden side** | Fuld download (ny context) | ✅ 304 Not Modified |
| **Efter browser genstart** | Fuld download | ✅ 304 Not Modified |
| **Konfiguration påkrævet** | ✅ Ingen (virker overalt) | Server konfiguration nødvendig |

**Anbefaling:**
- Hvis du bruger **samme .riv fil flere gange på én side** → In-memory cache håndterer det perfekt ✅
- Hvis du bruger **samme .riv fil på tværs af forskellige sider** → Konfigurer HTTP cache headers for øjeblikkelig loading 🚀

### Apache Konfiguration

Tilføj til din `.htaccess` fil:

```apache
<IfModule mod_headers.c>
    <FilesMatch "\.riv$">
        # Cache i 7 dage
        Header set Cache-Control "public, max-age=604800, immutable"

        # Tillad CORS hvis nødvendigt
        Header set Access-Control-Allow-Origin "*"
    </FilesMatch>
</IfModule>
```

### nginx Konfiguration

Tilføj til din nginx server konfiguration eller site.conf:

```nginx
# Rive animations filer (.riv)
location ~* \.riv$ {
    access_log        off;
    log_not_found     off;

    expires           7d;
    add_header        Cache-Control "public, immutable";

    # Tillad CORS hvis nødvendigt
    add_header        Access-Control-Allow-Origin *;
}
```

Genindlæs derefter nginx:

```bash
sudo nginx -s reload
```

### Local by Flywheel

Til lokal udvikling, rediger `conf/nginx/site.conf.hbs` i din Local site mappe og tilføj nginx konfigurationen ovenfor før `# PHP-FPM` sektionen.

Genstart derefter site'en i Local.

### Managed Hosting

Kontakt din hosting udbyders support for at tilføje cache headers til `.riv` filer. Nogle hosts (som WP Engine, Kinsta) cacher muligvis allerede statiske filer automatisk.

### Cache Varighed Forklaret

- **7 dage (604800 sekunder)**: God balance til produktions-sites
- **immutable**: Fortæller browseren at filen aldrig ændres (omdøb fil hvis opdateret)
- **public**: Tillader CDN'er og proxies at cache filen

**Vigtigt:** Hvis du opdaterer en .riv fil, skal du enten:
1. Uploade den med et nyt filnavn, eller
2. Rydde browser cache manuelt, eller
3. Tilføje cache busting query parameters (håndteres automatisk af WordPress Media Library)

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
