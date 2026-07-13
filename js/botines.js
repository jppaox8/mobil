const { useState, useEffect, useMemo } = React;

// Business logic lives in js/utils.js (`ArabellaUtils` / `window.formatPrice`)
// and shared UI components in js/components.js (`Navbar`, `ProductCard`,
// `CartDrawer`, `SiteFooter`). Both are loaded before this script.

function BotinesApp() {
	const [items, setItems] = useState([]);
	const [category, setCategory] = useState('Botines');
	const [query, setQuery] = useState('');
	const [cartOpen, setCartOpen] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const cat = params.get('category') || 'Botines';
		setCategory(cat);
		fetch('data/shoes.json')
			.then(r => r.json())
			.then(data => {
				setItems(ArabellaUtils.filterByCategory(data, cat));
			})
			.catch(err => { console.error(err); setItems([]); });
	}, []);

	function addToCart(product) {
		try {
			const raw = localStorage.getItem('arabella_cart');
			const cart = raw ? JSON.parse(raw) : [];
			const updated = ArabellaUtils.addToCart(cart, product);
			localStorage.setItem('arabella_cart', JSON.stringify(updated));
			alert('Añadido al carrito: ' + product.title);
		} catch(e) { console.error(e); }
	}

	const headingText = ArabellaUtils.categoryHeading(category);

	// cart count from localStorage
	const cartCount = (() => {
		try {
			const raw = localStorage.getItem('arabella_cart');
			const c = raw ? JSON.parse(raw) : [];
			return ArabellaUtils.cartCount(c);
		} catch(e) { return 0; }
	})();

	const visible = useMemo(() => ArabellaUtils.filterProducts(items, query), [items, query]);

	return (
		<div>
			<Navbar onSearchChange={setQuery} cartCount={cartCount} onToggleCart={() => setCartOpen(true)} />
			<main className="container mx-auto px-4 py-8">
				<section className="page-hero">
					<h1 className="text-4xl md:text-5xl font-extrabold">{headingText}</h1>
					<p className="text-gray-700 max-w-2xl mx-auto mt-4">Descubre estos botines femeninos de silueta refinada, diseñados para acompañarte con estilo desde la oficina hasta una salida especial. Con caña al tobillo, tacón medio y acabado impecable, combinan sofisticación y versatilidad en un solo par.</p>
				</section>

				<section className="category-section">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
						{visible.map(p => (
							<ProductCard key={p.id} product={p} onAdd={addToCart} />
						))}
						{visible.length === 0 && <div className="text-center text-gray-500">No se encontraron productos en esta búsqueda.</div>}
					</div>
				</section>
			</main>

			<SiteFooter />

			<CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={(() => { try { const r = localStorage.getItem('arabella_cart'); return r?JSON.parse(r):[] } catch(e){return []} })()} onRemove={(id)=>{ const raw = localStorage.getItem('arabella_cart'); const cart = raw?JSON.parse(raw):[]; const updated = cart.filter(i=>i.id!==id); localStorage.setItem('arabella_cart', JSON.stringify(updated)); window.location.reload(); }} onClear={()=>{ localStorage.removeItem('arabella_cart'); window.location.reload(); }} />
		</div>
	);
}

try {
	ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(BotinesApp));
} catch (err) {
	console.error('Error al renderizar BotinesApp:', err);
	const root = document.getElementById('root');
	if (root) {
		root.innerHTML = '<div style="padding:20px;background:#fee; color:#600;border:1px solid #f88">' +
			'<h3>Error al cargar la página de categoría</h3>' +
			'<pre style="white-space:pre-wrap">' + (err && err.message ? err.message : String(err)) + '</pre>' +
			'</div>';
	}
}

window.addEventListener('error', function (e) {
	console.error('Unhandled error:', e.error || e.message);
	const root = document.getElementById('root');
	if (root) {
		root.insertAdjacentHTML('afterbegin', '<div style="padding:12px;background:#fff3f2;color:#7a1414;border:1px solid #f5c6c6;margin:12px;border-radius:6px;">' +
			'<strong>Error:</strong> ' + (e.message || 'Un error ocurrió') + '</div>');
	}
});
