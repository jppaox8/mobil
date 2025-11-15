const { useState, useEffect, useMemo } = React;

function formatPrice(v) {
	return 'S/ ' + Number(v).toFixed(2);
}
window.formatPrice = formatPrice;

function Navbar({ onSearchChange, cartCount, onToggleCart }) {
	return (
		<header className="site-header shadow-sm sticky top-0 z-40">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="-ml-6 text-2xl md:text-3xl font-extrabold">𝓐𝓻𝓪𝓫𝓮𝓵𝓵𝓪 𝓬𝓱𝓲𝓬</div>
					<nav className="hidden md:flex space-x-4 text-lg md:text-xl">
						<a href="index.html" className="hover:underline">Home</a>
						<a href="contacto.html" className="hover:underline">Contacto</a>
						<a href="#promos" className="hover:underline">Promos</a>
						<a href="game.html" className="hover:underline">Game</a>
					</nav>
				</div>

				<div className="flex-1 max-w-xl mx-4">
					<input
						aria-label="Buscar productos"
						onChange={(e) => onSearchChange(e.target.value)}
						className="w-full border rounded-full px-4 py-2 text-sm shadow-sm"
						placeholder="Buscar productos..."
					/>
				</div>

				<div className="flex items-center space-x-4">
					<button onClick={onToggleCart} className="relative p-2">
						<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
						</svg>
						{cartCount > 0 && (
							<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">{cartCount}</span>
						)}
					</button>
				</div>
			</div>
		</header>
	);
}

function ProductCard({ product, onAdd }) {
	return (
		<a href={`producto.html?id=${encodeURIComponent(product.id)}`} className="product-card" aria-label={`Ver detalles de ${product.title}`}>
			<div className="product-img-wrap">
				<img src={encodeURI(product.image)} alt={product.title} />
			</div>
			<h3 className="product-title">{product.title}</h3>
			<div className="product-price">Precio: <span className="amount">{window.formatPrice(product.price)}</span></div>
			<button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(product); }} className="add-btn" aria-label={`Agregar ${product.title} al carrito`}>
				<span>Agregar al carrito</span>
				<span aria-hidden>🛒</span>
			</button>
		</a>
	);
}

function CartDrawer({ open, onClose, cart, onRemove, onClear }) {
	const total = cart.reduce((s, it) => s + it.price * it.qty, 0);
	return (
		<div className={`${open ? 'block' : 'hidden'} fixed inset-0 z-50`}> 
			<div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
			<aside className="absolute right-0 top-0 h-full w-full md:w-96 bg-white shadow-lg p-4">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Carrito</h3>
					<div className="space-x-2">
						<button onClick={onClear} className="text-sm text-gray-500">Vaciar</button>
						<button onClick={onClose} className="text-sm">Cerrar</button>
					</div>
				</div>
				<div className="space-y-3 overflow-auto" style={{maxHeight: '60vh'}}>
					{cart.length === 0 && <div className="text-gray-500">Tu carrito está vacío</div>}
					{cart.map(item => (
						<div key={item.id} className="flex items-center space-x-3">
							<img className="w-16 h-16 object-contain" src={encodeURI(item.image)} alt={item.title} />
							<div className="flex-1">
								<div className="font-medium text-sm">{item.title}</div>
								<div className="text-xs text-gray-500">{window.formatPrice(item.price)} x {item.qty}</div>
							</div>
							<div>
								<button onClick={() => onRemove(item.id)} className="text-red-500 text-sm">Eliminar</button>
							</div>
						</div>
					))}
				</div>
				<div className="mt-4 border-t pt-4">
					<div className="flex items-center justify-between font-semibold mb-3">Total: <span>{window.formatPrice(total)}</span></div>
					<button className="w-full bg-black text-white py-2 rounded">Ir a pagar</button>
				</div>
			</aside>
		</div> 
	);
}

function App() {
	const [query, setQuery] = useState('');
	const [cartOpen, setCartOpen] = useState(false);
	const [cart, setCart] = useState(() => {
		try {
			const raw = localStorage.getItem('arabella_cart');
			return raw ? JSON.parse(raw) : [];
		} catch (e) { return []; }
	});

	useEffect(() => {
		localStorage.setItem('arabella_cart', JSON.stringify(cart));
	}, [cart]);

	const products = window.SHOES || [];

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return products;
		return products.filter(p => (p.title + ' ' + p.description + ' ' + p.category).toLowerCase().includes(q));
	}, [products, query]);

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
		
		<footer className="site-footer mt-12 bg-gray-800 text-gray-200">
			<div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
				<div>
					<h4 className="footer-title">SERVICIO AL CLIENTE</h4>
					<ul className="footer-list">
						<li>Atención al cliente</li>
						<li>Cambios y devoluciones</li>
						<li>Seguir mi pedido</li>
						<li>Términos y condiciones</li>
					</ul>
				</div>
				<div>
					<h4 className="footer-title">CONTACTO</h4>
					<ul className="footer-list">
						<li>facebook: ArabellaChic</li>
						<li>Instagram: arabellachic_</li>
						<li>TikTok: Arabella_chic</li>
						<li>WhatsApp: 926 049 270</li>
					</ul>
				</div>
				<div>
					<h4 className="footer-title">NOSTROS</h4>
					<ul className="footer-list">
						<li>Nosotros</li>
						<li>Libros de reclamaciones</li>
					</ul>
				</div>
			</div>
			<div className="container mx-auto px-4 py-4 border-t border-gray-700 text-xs text-gray-400">© 2025 Arabellachic - Todos los derechos reservados</div>
		</footer>
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

