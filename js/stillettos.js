const { useState, useEffect, useMemo } = React;

// Business logic lives in js/utils.js (`ArabellaUtils` / `window.formatPrice`)
// and shared UI components in js/components.js (`Navbar`, `ProductCard`,
// `CartDrawer`, `SiteFooter`). Both are loaded before this script.

function StilletosApp() {
    const [items, setItems] = useState([]);
    const [query, setQuery] = useState('');
    const [cartOpen, setCartOpen] = useState(false);

    useEffect(() => {
        fetch('data/shoes.json')
            .then(r => r.json())
            .then(data => {
                setItems(ArabellaUtils.filterByCategory(data, 'Stilletos'));
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

            <SiteFooter />
        </div>
    );
}

try {
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(StilletosApp));
} catch (err) {
    console.error('Error al renderizar StilletosApp:', err);
}
