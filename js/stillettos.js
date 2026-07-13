const { useState, useEffect, useMemo } = React;

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
        Cart.add(product);
        alert('Añadido al carrito: ' + product.title);
    }

    const cartCount = Cart.count();

    const visible = useMemo(() => filterProducts(items, query), [items, query]);

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

            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={Cart.get()} onRemove={(id)=>{ Cart.remove(id); window.location.reload(); }} onClear={()=>{ Cart.clear(); window.location.reload(); }} />

            <SiteFooter />
        </div>
    );
}

try {
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(StilletosApp));
} catch (err) {
    console.error('Error al renderizar StilletosApp:', err);
}
