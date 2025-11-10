# Project Overview

This is a WordPress project. The directory contains a standard WordPress installation.

The theme, located in `app/public/wp-content/themes/kaizenstudio`, is a custom theme developed using modern WordPress development practices. It utilizes the `@wordpress/scripts` package for its development workflow.

## Building and Running

The theme's development workflow is managed through npm scripts defined in `app/public/wp-content/themes/kaizenstudio/package.json`.

To work with the theme, navigate to the theme's directory:

```bash
cd app/public/wp-content/themes/kaizenstudio
```

Then, you can use the following commands:

*   **`npm install`**: To install the dependencies.
*   **`npm run build`**: To build the theme's assets.
*   **`npm run start`**: To start the development server with live reloading.
*   **`npm run format`**: To format the code.
*   **`npm run lint:css`**: To lint the CSS files.
*   **`npm run lint:js`**: To lint the JavaScript files.

## Development Conventions

The project uses the default conventions provided by `@wordpress/scripts`. This includes:

*   **Coding Style**: The `npm run format` command uses Prettier to format the code.
*   **Linting**: The `npm run lint:css` and `npm run lint:js` commands use stylelint and ESLint to enforce coding standards.
*   **Testing**: There are no explicit testing scripts defined in the `package.json` file.

## Key Files

*   `app/public/wp-config.php`: The main WordPress configuration file.
*   `app/public/wp-content/themes/kaizenstudio/package.json`: The theme's `package.json` file, which defines the development scripts and dependencies.
*   `app/public/wp-content/themes/kaizenstudio/src`: The source directory for the theme's assets (JavaScript, CSS, etc.).
*   `app/public/wp-content/themes/kaizenstudio/build`: The output directory for the theme's built assets.
