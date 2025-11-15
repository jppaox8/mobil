const { useState, useEffect } = React;

function formatPrice(v) { return 'S/ ' + Number(v).toFixed(2); }

function ProductDetail() {
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [selectedSize, setSelectedSize] = useState(null);
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        fetch('data/shoes.json')
            .then(r => r.json())
            .then(data => {
                const p = (data || []).find(x => String(x.id) === String(id));
                setProduct(p || null);
                setImageIndex(0);
            })
            .catch(err => { console.error(err); setProduct(null); });
    }, []);

    function addToCart() {
        try {
            const raw = localStorage.getItem('arabella_cart');
            const cart = raw ? JSON.parse(raw) : [];
            if (!product) return;
            const exists = cart.find(i => i.id === product.id && i.size === selectedSize);
            if (exists) {
                const updated = cart.map(i => (i.id === product.id && i.size === selectedSize) ? {...i, qty: i.qty + qty} : i);
                localStorage.setItem('arabella_cart', JSON.stringify(updated));
            } else {
                cart.push({...product, qty, size: selectedSize});
                localStorage.setItem('arabella_cart', JSON.stringify(cart)); 
            }
            alert('Añadido al carrito: ' + product.title + (selectedSize ? (' (Talla ' + selectedSize + ')') : ''));
        } catch(e) { console.error(e); }
    }

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center text-gray-500">Producto no encontrado.</div>
            </div>
        );
    }

    const sizes = [35,36,37,38,39];

    const imgs = (product.images && product.images.length) ? product.images : [product.image];

    function prevImage(e){ e && e.stopPropagation(); setImageIndex(i => (i - 1 + imgs.length) % imgs.length); }
    function nextImage(e){ e && e.stopPropagation(); setImageIndex(i => (i + 1) % imgs.length); }

    return (
        <div>
            <header className="site-header shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <a href="index.html" className="font-extrabold">Arabella chic</a>
                    <div></div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center">
                        <div className="relative w-full flex items-center justify-center">
                            <button onClick={prevImage} aria-label="Imagen anterior" className="absolute left-2 z-10 bg-white/80 rounded-full p-2">◀</button>
                            <img src={encodeURI(imgs[imageIndex])} alt={product.title} className="max-w-sm w-full object-contain rounded shadow" style={{maxHeight: '420px'}} />
                            <button onClick={nextImage} aria-label="Siguiente imagen" className="absolute right-2 z-10 bg-white/80 rounded-full p-2">▶</button>
                        </div>
                        {imgs.length > 1 && (
                            <div className="mt-3 flex gap-2">
                                {imgs.map((it, idx) => (
                                    <button key={idx} onClick={(e)=>{e.stopPropagation(); setImageIndex(idx);}} className={`w-16 h-16 rounded overflow-hidden border ${imageIndex===idx? 'border-gray-800' : 'border-gray-200'}`}>
                                        <img src={encodeURI(it)} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold mb-2">{product.title}</h1>
                        <div className="text-3xl font-bold text-gray-800 mb-4">{formatPrice(product.price)}</div>

                        <div className="mb-4">
                            <div className="text-sm font-semibold mb-2">TALLA</div>
                            <div className="flex gap-2">
                                {sizes.map(s => (
                                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-3 py-2 rounded-full border ${selectedSize===s? 'bg-gray-800 text-white' : 'bg-gray-100'}`}>{s}</button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm font-semibold mb-2">CANTIDAD</div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-2 py-1 border rounded">-</button>
                                <div className="px-3">{qty}</div>
                                <button onClick={() => setQty(q => q+1)} className="px-2 py-1 border rounded">+</button>
                            </div>
                        </div>

                        <div className="mb-6 text-sm text-gray-700">
                            <strong>CARACTERÍSTICAS</strong>
                            {product.features && Array.isArray(product.features) ? (
                                <ul className="list-disc ml-5 mt-2">
                                    {product.features.map((f, idx) => (
                                        <li key={idx}>{f}</li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="mt-2">
                                    <div className="text-sm font-semibold">COLOR</div>
                                    <div className="mb-2">{product.title.match(/NEGRO|BEIGE|ROJO|BURDEOS|MARRÓN|NUDE/i)? (product.title.match(/NEGRO|BEIGE|ROJO|BURDEOS|MARRÓN|NUDE/i)[0]) : 'Variante'}</div>
                                    <div className="text-sm font-semibold">Descripción</div>
                                    <p className="mt-1">{product.description}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <button onClick={addToCart} className="add-btn">AGREGAR AL CARRITO</button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

try {
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(ProductDetail));
} catch (err) {
    console.error('Error al renderizar ProductDetail:', err);
}
