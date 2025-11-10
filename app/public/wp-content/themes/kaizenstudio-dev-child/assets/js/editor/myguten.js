// Unregister Block Styles from core/blocks comming from WordPress Core via JavaScript.
wp.domReady(() => {
    setTimeout(() => {
        wp.blocks.unregisterBlockStyle('core/quote', 'plain');
    }, 500); // 500ms delay
});
