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
			'width' => array(
				'type' => 'string'
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
