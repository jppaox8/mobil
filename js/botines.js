const { useState, useEffect, useMemo } = React;

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
				const filtered = (data || []).filter(d => d.category === cat);
				setItems(filtered);
			})
			.catch(err => { console.error(err); setItems([]); });
	}, []);

	function addToCart(product) {
		Cart.add(product);
		alert('Añadido al carrito: ' + product.title);
	}

	const headingText = category.toLowerCase() === 'botines'
		? 'DESCUBRE LOS MEJORES BOTINES'
		: `DESCUBRE LOS MEJORES ${category.toUpperCase()}`;

	const cartCount = Cart.count();

	const visible = useMemo(() => filterProducts(items, query), [items, query]);

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

			<CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={Cart.get()} onRemove={(id)=>{ Cart.remove(id); window.location.reload(); }} onClear={()=>{ Cart.clear(); window.location.reload(); }} />
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
