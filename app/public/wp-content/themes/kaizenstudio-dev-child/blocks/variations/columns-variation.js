wp.domReady(() => {
    // 4/4 Benjamin SVG Icon:
    const fireKolonnerIcon  = wp.element.createElement(
        wp.primitives.SVG,
        { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 48 48" },
        wp.element.createElement(
            wp.primitives.Path,
            {
                d: "M0 10a2 2 0 0 1 2-2h6c1.105 0 1.969.895 1.969 2v28c0 1.105-.864 2-1.969 2H2a2 2 0 0 1-2-2zm12 0c0-1.105.864-2 1.969-2h6c1.105 0 1.969.895 1.969 2v28c0 1.105-.864 2-1.969 2H14c-1.105 0-1.969-.895-1.969-2V10Zm12 0c0-1.105.864-2 1.969-2h6c1.105 0 1.969.895 1.969 2v28c0 1.105-.864 2-1.969 2H26c-1.105 0-1.969-.895-1.969-2V10Zm12 0c0-1.105.864-2 1.969-2h6c1.105 0 1.969.895 1.969 2v28c0 1.105-.864 2-1.969 2H38c-1.105 0-1.969-.895-1.969-2V10Z",
            }
        )
    );
    // 4/4 Benjamin columns variation
    wp.blocks.registerBlockVariation('core/columns', {
        name: 'fore-columns',
        title: '4/4 Benjamin',
        description: 'Fore columns; equal split + Gap:2rem',
        icon: fireKolonnerIcon,
        attributes: {
            columns: 4,
            style: {
                spacing: { blockGap: '2rem' }
            }
        },
        innerBlocks: [
            ['core/column', {}, [['core/paragraph', { placeholder: 'Skriv tekst i første kolonne' }]]],
            ['core/column', {}, [['core/paragraph', { placeholder: 'Skriv tekst i anden kolonne' }]]],
            ['core/column', {}, [['core/paragraph', { placeholder: 'Skriv tekst i tredje kolonne' }]]],
            ['core/column', {}, [['core/paragraph', { placeholder: 'Skriv tekst i fjere kolonne' }]]]
        ],
        isActive: [ 'columns', 'style' ],
        scope: ['block']
    });
});