<?php
// This file is generated. Do not modify it manually.
return array(
	'rive-block' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'create-block/rive-block',
		'version' => '0.1.0',
		'title' => 'Rive Block',
		'category' => 'widgets',
		'icon' => 'format-video',
		'description' => 'Import and use your Rive assets to add animated graphics, epic hero sections, and interactive product demos to your website.',
		'example' => array(
			
		),
		'attributes' => array(
			'height' => array(
				'type' => 'string',
				'default' => 'auto'
			),
			'width' => array(
				'type' => 'string',
				'default' => '100%'
			),
			'riveFileUrl' => array(
				'type' => 'string'
			),
			'riveFileId' => array(
				'type' => 'number'
			),
			'enableAutoplay' => array(
				'type' => 'boolean',
				'default' => false
			),
			'respectReducedMotion' => array(
				'type' => 'boolean',
				'default' => true
			),
			'ariaLabel' => array(
				'type' => 'string',
				'default' => ''
			),
			'ariaDescription' => array(
				'type' => 'string',
				'default' => ''
			)
		),
		'supports' => array(
			'html' => false,
			'position' => array(
				'sticky' => true
			),
			'color' => array(
				'background' => true,
				'text' => false
			)
		),
		'textdomain' => 'rive-block',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'render' => 'file:./render.php',
		'viewScript' => 'file:./view.js'
	)
);
