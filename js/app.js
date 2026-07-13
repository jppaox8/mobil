const { useState, useEffect, useMemo } = React;

function App() {
	const [query, setQuery] = useState('');
	const [cartOpen, setCartOpen] = useState(false);
	const [cart, setCart] = useState(() => Cart.get());

	useEffect(() => {
		Cart.save(cart);
	}, [cart]);

	const products = window.SHOES || [];

	const filtered = useMemo(() => filterProducts(products, query), [products, query]);

	function addToCart(product) {
		setCart(prev => {
			const exists = prev.find(i => i.id === product.id);
			if (exists) return prev.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i);
			return [...prev, {...product, qty: 1}];
		});
	}

	function removeFromCart(id) {
		setCart(prev => prev.filter(i => i.id !== id));
	}

	function clearCart() {
		setCart([]);
	}

	return (
		<div>
			<Navbar onSearchChange={setQuery} cartCount={cart.reduce((s,i)=>s+i.qty,0)} onToggleCart={() => setCartOpen(true)} />

			<main className="container mx-auto px-4 py-12" id="home">
				{!query && (
					<section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-14">
						<div>
							<h1 className="text-5xl md:text-6xl font-extrabold mb-4 leading-tight">DESCUBRE TU ESTILO</h1>
							<p className="text-lg md:text-xl text-gray-700 mb-6">Zapato de tacón color nude con acabado chalorado y diseño de corte lateral</p>
							<div className="bg-white inline-block px-6 py-5 rounded-lg shadow-lg">
								<div className="text-sm md:text-base text-gray-400 line-through">ANTES S/100.00</div>
								<div className="text-3xl md:text-4xl font-bold text-red-600">AHORA S/80.00</div>
								<button className="mt-4 md:mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">COMPRAR</button>
							</div>
						</div>
						<div className="flex justify-center">
							<img className="w-80 md:w-[420px] lg:w-[520px] object-contain rounded-lg shadow-md" src={encodeURI('imagenes/fotodepromocion.jpeg')} alt="hero" />
						</div>
					</section>
				)}

				{(() => {
					const byCategory = {};
					(filtered || []).forEach(p => {
						if (!byCategory[p.category]) byCategory[p.category] = [];
						byCategory[p.category].push(p);
					});

					return Object.keys(byCategory).map(cat => (
						<section key={cat} className="category-section">
							<h2 className="category-title">{cat}</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
								{byCategory[cat].slice(0, 3).map(p => (
									<ProductCard key={p.id} product={p} onAdd={addToCart} />
								))}
							</div>
							<div className="category-footer">
								{cat === 'Stilletos' ? (
									<a href={`stillettos.html?category=${encodeURIComponent(cat)}`} className="see-more" aria-label={`Ver más ${cat}`}>Ver más</a>
								) : (
									<a href={`botines.html?category=${encodeURIComponent(cat)}`} className="see-more" aria-label={`Ver más ${cat}`}>Ver más</a>
								)}
							</div>
						</section>
					));
				})()}

			</main>

			<CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onRemove={removeFromCart} onClear={clearCart} />

			<SiteFooter />
		</div>
	);
}

const rootEl = document.getElementById('root');

function safeRenderApp() {
	if (!rootEl) {
		// No #root on this page (e.g., contacto.html) — nothing to mount for the main app
		return;
	}
	ReactDOM.createRoot(rootEl).render(React.createElement(App));
}

fetch('data/shoes.json')
	.then(res => {
		if (!res.ok) throw new Error('Network response was not ok');
		return res.json();
	})
	.then(data => {
		window.SHOES = data;
		safeRenderApp();
	})
	.catch(err => {
		console.error('No se pudo cargar data/shoes.json, arrancando con lista vacía', err);
		window.SHOES = [];
		safeRenderApp();
	});
