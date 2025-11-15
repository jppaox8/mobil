console.warn('Warning: js/product.js is deprecated. Loading js/botas.js instead.');
(function(){
    const s = document.createElement('script');
    s.src = 'js/botas.js';
    s.type = 'text/babel';
    document.body.appendChild(s);
})();
