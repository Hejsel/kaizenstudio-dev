<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'local' );

/** Database username */
define( 'DB_USER', 'root' );

/** Database password */
define( 'DB_PASSWORD', 'root' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'G#Q0Wp0h D:4)7GF`,wbD}T2WFTx_%~:{I@Y- 5(Oj8z?T<h^Dy!T2zyK{^y[[o*' );
define( 'SECURE_AUTH_KEY',   'F>c?PQ#PXw)H~-0eBHuJ:hg9uFwLdyZ/T*4rg6K#g =&VA%Kn~N9+F<S!rFTtA-=' );
define( 'LOGGED_IN_KEY',     '> UPU*cQF6A{ yhLIyDgPwUGz,(ji[6^k#xc>nowUbu(bS9pA>4i]yGXc.&bpb Z' );
define( 'NONCE_KEY',         '2lCEES@n{t;c.mbmn[$ElGMQSZ@p:-L`m!58^CYaI5a]z{>5j N4-Re+n)MDq#KL' );
define( 'AUTH_SALT',         'kX[fI)gB;Y%AUV$)+p0X8f|JX&.nIY:N|l0qgw!@ 8u[F-_VX=ind]a/.m{IA7w^' );
define( 'SECURE_AUTH_SALT',  'ZGK _}D~LtkY#0+[dx.KNdxD,1i`PI(3<V<B,GrAEdJh5x%Savs!7:>bHar><i%4' );
define( 'LOGGED_IN_SALT',    '$ H3khw,9rYCFP1zYCL L}r|!qH<k}Kh[FP!>@Tj<7/rufRKOvhnHrM0dM4)280i' );
define( 'NONCE_SALT',        'Ag*_+N^nM{szwt%d<NLXoPXVX7XP5r*Nl GvSQOTd7zw9qLAtl*m#86<2C@b*-i*' );
define( 'WP_CACHE_KEY_SALT', '7,ItvsbFep`)ti2qCE=|6q7l]x@kKsgZ/omX?$|@v-`)q&a{eZ;ZAqQeO0WxxsHS' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'WP_ENVIRONMENT_TYPE', 'local' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
