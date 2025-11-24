<?php
/*
I Twenty Twenty-Five (og nyere block themes) bliver style.css i child themes ikke automatisk indlæst på frontend længere.
Det er en ændring fra WordPress 6.3 og frem.

Du skal derfor selv enqueue din style.css i functions.php.
*/
add_action('wp_enqueue_scripts', function() {
    wp_enqueue_style(
        'kaizenstudio-dev-child-style',
        get_stylesheet_uri(),
        [],
        wp_get_theme()->get('Version')
    );
});

/* 
// PHP Metoden:
// Tilføj block variation script fra child theme
add_filter('get_block_type_variations', function($variations, $block_type) {

    // Kun for core/columns
    if ('core/columns' === $block_type->name) {
        $variations[] = array(
            'name'        => 'fore-columns',
            'title'       => __('4/4 Benjamin', 'twentytwentyfive-child'),
            'description' => __('Fore columns; equal split + Gap:2rem', 'twentytwentyfive-child'),
            'icon'        => 'columns', // Dashicon: columns
            'attributes'  => array(
                'columns' => 4,
                'style'   => array(
                    'spacing' => array(
                        'blockGap' => '2rem'
                    )
                )
            ),
            'innerBlocks' => array(
                array('core/column', array(), array(array('core/paragraph', array('placeholder' => 'Skriv tekst i første kolonne')))),
                array('core/column', array(), array(array('core/paragraph', array('placeholder' => 'Skriv tekst i anden kolonne')))),
                array('core/column', array(), array(array('core/paragraph', array('placeholder' => 'Skriv tekst i tredje kolonne')))),
                array('core/column', array(), array(array('core/paragraph', array('placeholder' => 'Skriv tekst i fjerde kolonne')))),
            ),
            'isActive' => array('columns', 'style'),
            'scope'    => array('block')
        );
    }

    return $variations;

}, 10, 2);
*/

// JavaScript Metoden:
// Tilføj block variation script fra child theme
add_action('enqueue_block_editor_assets', function() {
    // peg på JS-fil i child theme
    $js_fil = get_stylesheet_directory() . '/blocks/variations/columns-variation.js';

    wp_enqueue_script(
        'child-columns-variation', // unikt handle
        get_stylesheet_directory_uri() . '/blocks/variations/columns-variation.js',
        array('wp-blocks', 'wp-dom-ready', 'wp-edit-post'),
        filemtime($js_fil)
    );
}, 10);
function remove_dashboard_menu_items() {
	global $menu;
	unset($menu[5]);	// Removes "Posts"
	//	unset($menu[10]);	// Removes "Media"
	unset($menu[20]);	// Removes "Pages"
	unset($menu[25]);	// Removes "Comments"
	//	unset($menu[60]);	// Removes "Apprearance"
	//	unset($menu[65]);	// Removes "Plugins"
	//	unset($menu[70]);	// Removes "Users"
	//	unset($menu[75]);	// Removes "Tools"
	//	unset($menu[80]);	// Removes "Settings"
	//	remove_menu_page('index.php');
}
add_action( 'admin_menu', 'remove_dashboard_menu_items' );

function myguten_remove_block_style() {
    wp_enqueue_script(
        'myguten-script',
        get_stylesheet_directory_uri() . '/assets/js/editor/myguten.js', // URL, ikke lokal sti
        array( 'wp-blocks', 'wp-dom-ready', 'wp-edit-post' ),
        filemtime( get_stylesheet_directory() . '/assets/js/editor/myguten.js' )
    );
}
add_action( 'enqueue_block_editor_assets', 'myguten_remove_block_style' );
/*
add_filter( 'default_wp_template_part_areas', 'themeslug_template_part_areas' );
function themeslug_template_part_areas( array $areas ) {
	$areas[] = array(
		'area'        => 'hero-section',
		'area_tag'    => 'section',
		'label'       => __( 'Hero section Benjamin', 'themeslug' ),
		'description' => __( 'Denne sektion er beregnet til at blive vist som den første sektion på en side.', 'themslug' ),
		'icon'        => 'layout'
	);
	return $areas;
}
*/
// Tilføj hero-section area til editoren i child theme
add_filter( 'default_wp_template_part_areas', 'kaizenstudio_template_part_areas' );

function kaizenstudio_template_part_areas( array $areas ) {
    $areas[] = array(
        'area'        => 'hero-section-benjamin',
        'area_tag'    => 'section',
        'label'       => __( 'Hero section Benjamin', 'kaizenstudio-dev-child' ),
        'description' => __( 'Denne sektion er beregnet til at blive vist som den første sektion på en side.', 'kaizenstudio-dev-child' ),
        'icon'        => 'layout'
    );

    return $areas;
}

add_action( 'init', 'themeslug_register_pattern_categories' );
function themeslug_register_pattern_categories() {
    register_block_pattern_category( 'themeslug-custom', array( 
    'label'       => __( 'Benjamin', 'themeslug' ),
    'description' => __( 'Custom patterns for Theme Name.', 'themeslug' )
	) );
}

add_action( 'init', function() {
    if ( ! class_exists( 'WP_Block_Patterns_Registry' ) ) {
        return;
    }

    // Fjern WordPress' egne patterns
    remove_theme_support( 'core-block-patterns' );

    // Parent tema slug (Twenty Twenty-Five)
    $parent_tema_slug = 'twentytwentyfive';

    // Hent alle registrerede patterns
    $mønstre = (array) WP_Block_Patterns_Registry::get_instance()->get_all_registered();

    // Gennemløb og fjern alle mønstre fra parent-temaet
    foreach ( $mønstre as $mønster ) {
        if ( isset( $mønster['name'] ) && str_starts_with( $mønster['name'], $parent_tema_slug . '/' ) ) {
            unregister_block_pattern( $mønster['name'] );
        }
    }
});
