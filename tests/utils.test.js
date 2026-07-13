const utils = require('../js/utils');

describe('formatPrice', () => {
	test('formats integers with two decimals and the S/ prefix', () => {
		expect(utils.formatPrice(80)).toBe('S/ 80.00');
	});

	test('rounds to two decimals', () => {
		expect(utils.formatPrice(19.999)).toBe('S/ 20.00');
		expect(utils.formatPrice(19.994)).toBe('S/ 19.99');
	});

	test('coerces numeric strings', () => {
		expect(utils.formatPrice('100')).toBe('S/ 100.00');
	});

	test('handles zero', () => {
		expect(utils.formatPrice(0)).toBe('S/ 0.00');
	});
});

describe('addToCart', () => {
	const product = { id: 1, title: 'Stiletto', price: 100 };

	test('appends a new line with qty 1 by default', () => {
		const cart = utils.addToCart([], product);
		expect(cart).toEqual([{ id: 1, title: 'Stiletto', price: 100, qty: 1 }]);
	});

	test('does not mutate the original cart', () => {
		const original = [];
		utils.addToCart(original, product);
		expect(original).toEqual([]);
	});

	test('increments qty when the product already exists', () => {
		const first = utils.addToCart([], product);
		const second = utils.addToCart(first, product);
		expect(second).toEqual([{ id: 1, title: 'Stiletto', price: 100, qty: 2 }]);
	});

	test('respects a custom qty', () => {
		const cart = utils.addToCart([], product, { qty: 3 });
		expect(cart[0].qty).toBe(3);
		const more = utils.addToCart(cart, product, { qty: 2 });
		expect(more[0].qty).toBe(5);
	});

	test('treats null/undefined cart as empty', () => {
		expect(utils.addToCart(null, product)).toHaveLength(1);
		expect(utils.addToCart(undefined, product)).toHaveLength(1);
	});

	describe('with matchSize', () => {
		test('adds separate lines for different sizes of the same product', () => {
			let cart = utils.addToCart([], product, { matchSize: true, size: 37, qty: 1 });
			cart = utils.addToCart(cart, product, { matchSize: true, size: 38, qty: 1 });
			expect(cart).toHaveLength(2);
			expect(cart[0].size).toBe(37);
			expect(cart[1].size).toBe(38);
		});

		test('merges lines with the same id and size', () => {
			let cart = utils.addToCart([], product, { matchSize: true, size: 37, qty: 1 });
			cart = utils.addToCart(cart, product, { matchSize: true, size: 37, qty: 2 });
			expect(cart).toHaveLength(1);
			expect(cart[0].qty).toBe(3);
		});
	});
});

describe('removeFromCart', () => {
	const cart = [
		{ id: 1, qty: 1 },
		{ id: 2, qty: 3 }
	];

	test('removes the matching line', () => {
		expect(utils.removeFromCart(cart, 1)).toEqual([{ id: 2, qty: 3 }]);
	});

	test('is a no-op for an unknown id', () => {
		expect(utils.removeFromCart(cart, 99)).toEqual(cart);
	});

	test('does not mutate the original cart', () => {
		utils.removeFromCart(cart, 1);
		expect(cart).toHaveLength(2);
	});

	test('handles a null cart', () => {
		expect(utils.removeFromCart(null, 1)).toEqual([]);
	});
});

describe('cartCount', () => {
	test('sums quantities', () => {
		expect(utils.cartCount([{ qty: 1 }, { qty: 4 }])).toBe(5);
	});

	test('treats missing qty as 0', () => {
		expect(utils.cartCount([{ qty: 2 }, {}])).toBe(2);
	});

	test('returns 0 for empty or null carts', () => {
		expect(utils.cartCount([])).toBe(0);
		expect(utils.cartCount(null)).toBe(0);
	});
});

describe('cartTotal', () => {
	test('sums price * qty', () => {
		const cart = [{ price: 100, qty: 2 }, { price: 50, qty: 1 }];
		expect(utils.cartTotal(cart)).toBe(250);
	});

	test('returns 0 for empty or null carts', () => {
		expect(utils.cartTotal([])).toBe(0);
		expect(utils.cartTotal(null)).toBe(0);
	});
});

describe('filterProducts', () => {
	const products = [
		{ id: 1, title: 'Stiletto Negro', description: 'elegante', category: 'Stilletos' },
		{ id: 2, title: 'Botin Marron', description: 'cuero', category: 'Botines' }
	];

	test('returns all products for an empty query', () => {
		expect(utils.filterProducts(products, '')).toEqual(products);
		expect(utils.filterProducts(products, '   ')).toEqual(products);
	});

	test('matches on title', () => {
		expect(utils.filterProducts(products, 'stiletto')).toEqual([products[0]]);
	});

	test('matches on description', () => {
		expect(utils.filterProducts(products, 'cuero')).toEqual([products[1]]);
	});

	test('matches on category and is case-insensitive', () => {
		expect(utils.filterProducts(products, 'BOTINES')).toEqual([products[1]]);
	});

	test('returns empty array when nothing matches', () => {
		expect(utils.filterProducts(products, 'zzz')).toEqual([]);
	});

	test('tolerates missing fields and null input', () => {
		expect(utils.filterProducts([{ id: 3 }], 'anything')).toEqual([]);
		expect(utils.filterProducts(null, 'x')).toEqual([]);
	});
});

describe('filterByCategory', () => {
	const products = [
		{ id: 1, category: 'Stilletos' },
		{ id: 2, category: 'Botines' },
		{ id: 3, category: 'Stilletos' }
	];

	test('keeps only products in the given category', () => {
		expect(utils.filterByCategory(products, 'Stilletos')).toEqual([products[0], products[2]]);
	});

	test('returns empty array for an unknown category', () => {
		expect(utils.filterByCategory(products, 'Sandalias')).toEqual([]);
	});

	test('handles null input', () => {
		expect(utils.filterByCategory(null, 'Botines')).toEqual([]);
	});
});

describe('groupByCategory', () => {
	test('groups products preserving insertion order', () => {
		const products = [
			{ id: 1, category: 'A' },
			{ id: 2, category: 'B' },
			{ id: 3, category: 'A' }
		];
		const grouped = utils.groupByCategory(products);
		expect(Object.keys(grouped)).toEqual(['A', 'B']);
		expect(grouped.A).toHaveLength(2);
		expect(grouped.B).toHaveLength(1);
	});

	test('returns an empty object for null input', () => {
		expect(utils.groupByCategory(null)).toEqual({});
	});
});

describe('categoryHeading', () => {
	test('uses the special copy for botines (case-insensitive)', () => {
		expect(utils.categoryHeading('Botines')).toBe('DESCUBRE LOS MEJORES BOTINES');
		expect(utils.categoryHeading('botines')).toBe('DESCUBRE LOS MEJORES BOTINES');
	});

	test('uppercases other categories', () => {
		expect(utils.categoryHeading('Stilletos')).toBe('DESCUBRE LOS MEJORES STILLETOS');
	});

	test('handles empty/undefined category', () => {
		expect(utils.categoryHeading('')).toBe('DESCUBRE LOS MEJORES ');
		expect(utils.categoryHeading(undefined)).toBe('DESCUBRE LOS MEJORES ');
	});
});

describe('colorFromTitle', () => {
	test('extracts a known color', () => {
		expect(utils.colorFromTitle('STILLETO NEGRO CHAROL')).toBe('NEGRO');
		expect(utils.colorFromTitle('bota beige alta')).toBe('beige');
	});

	test('returns Variante when no color is present', () => {
		expect(utils.colorFromTitle('STILLETO MATRIX CAMEL')).toBe('Variante');
		expect(utils.colorFromTitle('')).toBe('Variante');
		expect(utils.colorFromTitle(undefined)).toBe('Variante');
	});
});

describe('cycleIndex', () => {
	test('advances forward within range', () => {
		expect(utils.cycleIndex(0, 1, 3)).toBe(1);
	});

	test('wraps around the end', () => {
		expect(utils.cycleIndex(2, 1, 3)).toBe(0);
	});

	test('wraps around the start when going backwards', () => {
		expect(utils.cycleIndex(0, -1, 3)).toBe(2);
	});

	test('returns 0 for empty length', () => {
		expect(utils.cycleIndex(0, 1, 0)).toBe(0);
	});
});

describe('productImages', () => {
	test('returns the images array when present', () => {
		const p = { image: 'a.png', images: ['x.png', 'y.png'] };
		expect(utils.productImages(p)).toEqual(['x.png', 'y.png']);
	});

	test('falls back to the single image', () => {
		const p = { image: 'a.png' };
		expect(utils.productImages(p)).toEqual(['a.png']);
	});

	test('falls back to single image when images is empty', () => {
		const p = { image: 'a.png', images: [] };
		expect(utils.productImages(p)).toEqual(['a.png']);
	});

	test('returns empty array for null product', () => {
		expect(utils.productImages(null)).toEqual([]);
	});
});

describe('validateContactForm', () => {
	const valid = {
		nombre: 'Ana',
		correo: 'ana@example.com',
		telefono: '926 049 270',
		mensaje: 'Hola',
		pais: 'Peru'
	};

	test('returns no errors for a valid form', () => {
		expect(utils.validateContactForm(valid)).toEqual({});
		expect(utils.isContactFormValid(valid)).toBe(true);
	});

	test('flags missing required fields', () => {
		const errors = utils.validateContactForm({});
		expect(errors.nombre).toBe('Requerido');
		expect(errors.correo).toBe('Requerido');
		expect(errors.mensaje).toBe('Escribe tu mensaje');
		expect(errors.telefono).toBe('Requerido');
		expect(utils.isContactFormValid({})).toBe(false);
	});

	test('flags an invalid email', () => {
		const errors = utils.validateContactForm(Object.assign({}, valid, { correo: 'no-an-email' }));
		expect(errors.correo).toBe('Email inv\u00e1lido');
	});

	test('flags an invalid phone', () => {
		const errors = utils.validateContactForm(Object.assign({}, valid, { telefono: 'abc' }));
		expect(errors.telefono).toBe('Tel\u00e9fono inv\u00e1lido');
	});

	test('does not require pais', () => {
		const errors = utils.validateContactForm(Object.assign({}, valid, { pais: '' }));
		expect(errors.pais).toBeUndefined();
	});

	test('handles a null form', () => {
		expect(utils.isContactFormValid(null)).toBe(false);
	});
});

describe('buildMailtoHref', () => {
	test('builds a mailto link with an encoded body', () => {
		const href = utils.buildMailtoHref({
			nombre: 'Ana',
			correo: 'ana@example.com',
			telefono: '123456',
			pais: 'Peru',
			mensaje: 'Hola mundo'
		});
		expect(href.startsWith('mailto:contacto@tutienda.com?subject=')).toBe(true);
		expect(href).toContain(encodeURIComponent('Consulta desde web'));
		expect(href).toContain('Hola%20mundo');
		expect(href).toContain('Ana');
	});

	test('handles a null form without throwing', () => {
		expect(() => utils.buildMailtoHref(null)).not.toThrow();
	});
});
