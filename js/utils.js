/*
 * Shared business logic for the Arabella Chic store.
 *
 * This module is written so it works both:
 *  - in the browser, where it attaches helpers to `window` (loaded as a plain
 *    <script> before the Babel-compiled page scripts), and
 *  - in Node/Jest, where it is required via CommonJS for unit testing.
 */
(function (root, factory) {
	const api = factory();
	if (typeof module === 'object' && module.exports) {
		module.exports = api;
	}
	if (root) {
		Object.keys(api).forEach(function (key) {
			root[key] = api[key];
		});
		root.ArabellaUtils = api;
	}
})(typeof window !== 'undefined' ? window : null, function () {
	const CART_KEY = 'arabella_cart';

	function formatPrice(v) {
		return 'S/ ' + Number(v).toFixed(2);
	}

	function matchesLine(line, product, matchSize) {
		if (line.id !== product.id) return false;
		if (matchSize) return line.size === product.size;
		return true;
	}

	// Returns a NEW cart array with `product` added. If a matching line exists
	// its quantity is increased by `qty`, otherwise a new line is appended.
	function addToCart(cart, product, options) {
		const opts = options || {};
		const qty = opts.qty != null ? opts.qty : 1;
		const matchSize = !!opts.matchSize;
		const list = Array.isArray(cart) ? cart : [];
		const target = matchSize ? { id: product.id, size: opts.size } : { id: product.id };
		const exists = list.some(function (i) { return matchesLine(i, target, matchSize); });
		if (exists) {
			return list.map(function (i) {
				return matchesLine(i, target, matchSize) ? Object.assign({}, i, { qty: i.qty + qty }) : i;
			});
		}
		const line = Object.assign({}, product, { qty: qty });
		if (matchSize) line.size = opts.size;
		return list.concat([line]);
	}

	// Returns a NEW cart array without the line matching `id`.
	function removeFromCart(cart, id) {
		const list = Array.isArray(cart) ? cart : [];
		return list.filter(function (i) { return i.id !== id; });
	}

	function cartCount(cart) {
		const list = Array.isArray(cart) ? cart : [];
		return list.reduce(function (s, i) { return s + (i.qty || 0); }, 0);
	}

	function cartTotal(cart) {
		const list = Array.isArray(cart) ? cart : [];
		return list.reduce(function (s, i) { return s + i.price * i.qty; }, 0);
	}

	// Case-insensitive search over title + description + category.
	function filterProducts(products, query) {
		const list = Array.isArray(products) ? products : [];
		const q = (query || '').trim().toLowerCase();
		if (!q) return list;
		return list.filter(function (p) {
			const hay = ((p.title || '') + ' ' + (p.description || '') + ' ' + (p.category || '')).toLowerCase();
			return hay.indexOf(q) !== -1;
		});
	}

	function filterByCategory(products, category) {
		const list = Array.isArray(products) ? products : [];
		return list.filter(function (d) { return d.category === category; });
	}

	// Groups products into an object keyed by category, preserving order.
	function groupByCategory(products) {
		const list = Array.isArray(products) ? products : [];
		const byCategory = {};
		list.forEach(function (p) {
			if (!byCategory[p.category]) byCategory[p.category] = [];
			byCategory[p.category].push(p);
		});
		return byCategory;
	}

	function categoryHeading(category) {
		const cat = category || '';
		return cat.toLowerCase() === 'botines'
			? 'DESCUBRE LOS MEJORES BOTINES'
			: 'DESCUBRE LOS MEJORES ' + cat.toUpperCase();
	}

	// Extracts a color name from a product title, or 'Variante' if none found.
	function colorFromTitle(title) {
		const m = (title || '').match(/NEGRO|BEIGE|ROJO|BURDEOS|MARR\u00d3N|NUDE/i);
		return m ? m[0] : 'Variante';
	}

	// Wraps `index + delta` around [0, length).
	function cycleIndex(index, delta, length) {
		if (!length || length <= 0) return 0;
		return ((index + delta) % length + length) % length;
	}

	// Chooses the images array for the product detail carousel.
	function productImages(product) {
		if (!product) return [];
		return (product.images && product.images.length) ? product.images : [product.image];
	}

	// Validation for the contact form. Returns a map of field -> error message.
	function validateContactForm(form) {
		const f = form || {};
		const e = {};
		if (!(f.nombre || '').trim()) e.nombre = 'Requerido';
		if (!(f.correo || '').trim()) e.correo = 'Requerido';
		else if (!/^\S+@\S+\.\S+$/.test(f.correo)) e.correo = 'Email inv\u00e1lido';
		if (!(f.mensaje || '').trim()) e.mensaje = 'Escribe tu mensaje';
		if (!f.telefono || !f.telefono.trim()) e.telefono = 'Requerido';
		else if (!/^[+0-9()\-\s]{6,}$/.test(f.telefono)) e.telefono = 'Tel\u00e9fono inv\u00e1lido';
		return e;
	}

	function isContactFormValid(form) {
		return Object.keys(validateContactForm(form)).length === 0;
	}

	function buildMailtoHref(form) {
		const f = form || {};
		const body = 'Nombre: ' + (f.nombre || '') + '\nEmail: ' + (f.correo || '') +
			'\nTel\u00e9fono: ' + (f.telefono || '') + '\nPais: ' + (f.pais || '') +
			'\n\n' + (f.mensaje || '');
		return 'mailto:contacto@tutienda.com?subject=' + encodeURIComponent('Consulta desde web') +
			'&body=' + encodeURIComponent(body);
	}

	return {
		CART_KEY: CART_KEY,
		formatPrice: formatPrice,
		addToCart: addToCart,
		removeFromCart: removeFromCart,
		cartCount: cartCount,
		cartTotal: cartTotal,
		filterProducts: filterProducts,
		filterByCategory: filterByCategory,
		groupByCategory: groupByCategory,
		categoryHeading: categoryHeading,
		colorFromTitle: colorFromTitle,
		cycleIndex: cycleIndex,
		productImages: productImages,
		validateContactForm: validateContactForm,
		isContactFormValid: isContactFormValid,
		buildMailtoHref: buildMailtoHref
	};
});
