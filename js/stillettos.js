const { useState, useEffect, useMemo } = React;

function formatPrice(v) {
    return 'S/ ' + Number(v).toFixed(2);
}

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
        <a href={`producto.html?id=${product.id}`} className="product-card" style={{textDecoration: 'none', color: 'inherit'}}>
            <div className="product-img-wrap">
                <img src={encodeURI(product.image)} alt={product.title} />
            </div>
            <h3 className="product-title">{product.title}</h3>
            <div className="product-price">Precio: <span className="amount">{formatPrice(product.price)}</span></div>
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
                                <div className="text-xs text-gray-500">{formatPrice(item.price)} x {item.qty}</div>
                            </div>
                            <div>
                                <button onClick={() => onRemove(item.id)} className="text-red-500 text-sm">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between font-semibold mb-3">Total: <span>{formatPrice(total)}</span></div>
                    <button className="w-full bg-black text-white py-2 rounded">Ir a pagar</button>
                </div>
            </aside>
        </div> 
    );
}

function StilletosApp() {
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        fetch('data/shoes.json')
            .then(r => r.json())
            .then(data => {
                const filtered = (data || []).filter(d => d.category === 'Stilletos');
                setItems(filtered);
            })
            .catch(err => { console.error(err); setItems([]); });
    }, []);

    function addToCart(product) {
        try {
            const raw = localStorage.getItem('arabella_cart');
            const cart = raw ? JSON.parse(raw) : [];
            const exists = cart.find(i => i.id === product.id);
            if (exists) {
                const updated = cart.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i);
                localStorage.setItem('arabella_cart', JSON.stringify(updated));
            } else {
                cart.push({...product, qty: 1});
                localStorage.setItem('arabella_cart', JSON.stringify(cart));
            }
            alert('Añadido al carrito: ' + product.title);
        } catch(e) { console.error(e); }
    }

    const cartCount = (() => {
        try {
            const raw = localStorage.getItem('arabella_cart');
            const c = raw ? JSON.parse(raw) : [];
            return c.reduce((s,i) => s + (i.qty || 0), 0);
        } catch(e) { return 0; }
    })();

    const visible = useMemo(() => {
        const q = (query || '').trim().toLowerCase();
        if (!q) return items;
        return (items || []).filter(p => {
            const hay = ((p.title || '') + ' ' + (p.description || '') + ' ' + (p.category || '')).toLowerCase();
            return hay.indexOf(q) !== -1;
        });
    }, [items, query]);

    return (
        <div>
            <Navbar onSearchChange={setQuery} cartCount={cartCount} onToggleCart={() => setCartOpen(true)} />
            <main className="container mx-auto px-4 py-8">
                <section className="page-hero">
                    <h1 className="text-4xl md:text-5xl font-extrabold">DESCUBRE NUESTROS STILLETTOS</h1>
                    <p className="text-gray-700 max-w-2xl mx-auto mt-4">Tacones elegantes y clásicos, perfectos para ocasiones especiales con un toque femenino.</p>
                </section>

                <section className="category-section">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {visible.map(p => (
                            <ProductCard key={p.id} product={p} onAdd={addToCart} />
                        ))}
                        {visible.length === 0 && <div className="text-center text-gray-500">No se encontraron productos en esta categoría.</div>}
                    </div>
                </section>
            </main>

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={(() => { try { const r = localStorage.getItem('arabella_cart'); return r?JSON.parse(r):[] } catch(e){return []} })()} onRemove={(id)=>{ const raw = localStorage.getItem('arabella_cart'); const cart = raw?JSON.parse(raw):[]; const updated = cart.filter(i=>i.id!==id); localStorage.setItem('arabella_cart', JSON.stringify(updated)); window.location.reload(); }} onClear={()=>{ localStorage.removeItem('arabella_cart'); window.location.reload(); }} />

            <footer className="site-footer mt-12 bg-gray-800 text-gray-200">
                <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h4 className="footer-title">SERVICIO AL CLIENTE</h4>
                        <ul className="footer-list">
                            <li>Atención al cliente</li>
                            <li>Cambios y devoluciones</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-title">CONTACTO</h4>
                        <ul className="footer-list">
                            <li>facebook: ArabellaChic</li>
                            <li>Instagram: arabellachic_</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="footer-title">NOSTROS</h4>
                        <ul className="footer-list">
                            <li>Nosotros</li>
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto px-4 py-4 border-t border-gray-700 text-xs text-gray-400">© 2025 Arabellachic - Todos los derechos reservados</div>
            </footer>
        </div>
    );
}

try {
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(StilletosApp));
} catch (err) {
    console.error('Error al renderizar StilletosApp:', err);
}
