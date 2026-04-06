import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, CheckCircle, ShoppingCart } from 'lucide-react';

// Data Mock
import productosDataRaw from '../data/productos.json';
import clientesData from '../data/clientes.json';

// Normalize products for display
const productosData = productosDataRaw.map((p, i) => ({
    id: p.Codigo || `P-${i}`,
    nombre: p.Articulo || 'Sin Nombre',
    marca: p.Marca || 'Genérico',
    precio: p.Precio || parseFloat((Math.random() * 50 + 5).toFixed(2)), // Random price if missing
    existencia: p.Existencia !== undefined ? p.Existencia : Math.floor(Math.random() * 100),
}));

export default function CrearPedido() {
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1); // 1: Cliente, 2: Productos, 3: Resumen
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [carrito, setCarrito] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSelectClient = (cliente) => {
        setClienteSeleccionado(cliente);
        setPaso(2);
    };

    const agregarAlCarrito = (producto) => {
        setCarrito(prev => {
            const exists = prev.find(p => p.id === producto.id);
            if (exists) {
                return prev.map(p => p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p);
            }
            return [...prev, { ...producto, cantidad: 1 }];
        });
    };

    const quitarDelCarrito = (productoId) => {
        setCarrito(prev => {
            const exists = prev.find(p => p.id === productoId);
            if (exists && exists.cantidad > 1) {
                return prev.map(p => p.id === productoId ? { ...p, cantidad: p.cantidad - 1 } : p);
            }
            return prev.filter(p => p.id !== productoId);
        });
    };

    const total = useMemo(() => carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0), [carrito]);

    const productosFiltrados = useMemo(() => {
        if (!searchQuery) return productosData.slice(0, 20); // show only 20 max to avoid lag
        return productosData.filter(p =>
            p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.id.toLowerCase().includes(searchQuery.toLowerCase())
        ).slice(0, 20);
    }, [searchQuery]);

    const finalizar = (tipoDocumento) => {
        alert(`¡${tipoDocumento} generado con éxito!\nTotal: $${total.toFixed(2)}`);
        navigate('/ventas');
    };

    return (
        <div className="h-full flex flex-col bg-gray-50 pb-16">
            {/* Header */}
            <div className="bg-bevalRed text-white p-4 shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => paso === 1 ? navigate('/ventas') : setPaso(paso - 1)} className="active:scale-95">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-lg font-bold">
                        {paso === 1 ? 'Seleccionar Cliente' : paso === 2 ? 'Catálogo de Productos' : 'Resumen'}
                    </h1>
                </div>
                {paso === 2 && (
                    <div className="relative" onClick={() => setPaso(3)}>
                        <ShoppingCart size={24} />
                        {carrito.length > 0 && (
                            <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {carrito.reduce((acc, i) => acc + i.cantidad, 0)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Content based on Paso */}
            <div className="flex-1 overflow-y-auto p-4">

                {/* PASO 1: CLIENTES */}
                {paso === 1 && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500 mb-2">Selecciona un cliente para iniciar el pedido</p>
                        {clientesData.slice(0, 15).map((c, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleSelectClient(c)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center active:bg-red-50 cursor-pointer"
                            >
                                <div>
                                    <h3 className="font-bold text-gray-800 text-sm">{c.RAZONSOCIAL || `Cliente Demo ${idx + 1}`}</h3>
                                    <p className="text-xs text-gray-500">{c.CODIGO || '0000X'}</p>
                                </div>
                                <CheckCircle size={20} className="text-gray-300" />
                            </div>
                        ))}
                    </div>
                )}

                {/* PASO 2: PRODUCTOS */}
                {paso === 2 && (
                    <div className="space-y-4">
                        {/* Buscador */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar artículo o código..."
                                className="w-full p-3 pl-10 rounded-xl border border-gray-200 focus:outline-none focus:border-bevalRed text-sm"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                        </div>

                        <div className="space-y-3">
                            {productosFiltrados.map(p => {
                                const inCart = carrito.find(item => item.id === p.id);
                                return (
                                    <div key={p.id} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                                        <div className="flex justify-between">
                                            <span className="text-[10px] font-bold text-bevalRed bg-red-50 px-2 py-1 rounded">{p.marca}</span>
                                            <span className="text-[10px] text-gray-500">Disp: {p.existencia}</span>
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-800 leading-tight">{p.nombre}</h3>
                                        <div className="flex justify-between items-end mt-1">
                                            <span className="font-bold text-green-600">${p.precio.toFixed(2)}</span>

                                            {/* Controles cantidad */}
                                            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                                <button onClick={() => quitarDelCarrito(p.id)} className="p-1 text-gray-500 disabled:opacity-30" disabled={!inCart}>
                                                    <Minus size={16} />
                                                </button>
                                                <span className="font-bold text-sm min-w-[20px] text-center">{inCart ? inCart.cantidad : 0}</span>
                                                <button onClick={() => agregarAlCarrito(p)} className="p-1 text-bevalRed disabled:opacity-30" disabled={p.existencia === 0}>
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* PASO 3: RESUMEN */}
                {paso === 3 && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 border-b pb-2 mb-2">Datos del Cliente</h3>
                            <p className="text-sm font-medium">{clienteSeleccionado?.RAZONSOCIAL}</p>
                            <p className="text-xs text-gray-500">{clienteSeleccionado?.CODIGO}</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-800 border-b pb-2 mb-3">Detalle de Líneas ({carrito.length})</h3>
                            {carrito.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-4">Carrito vacío</p>
                            ) : (
                                <div className="space-y-3">
                                    {carrito.map(item => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <div className="flex-1 pr-2">
                                                <p className="font-medium text-gray-700 truncate">{item.nombre}</p>
                                                <p className="text-xs text-gray-500">{item.cantidad} und x ${item.precio.toFixed(2)}</p>
                                            </div>
                                            <div className="font-bold text-gray-800">
                                                ${(item.cantidad * item.precio).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>

            {/* Floating Action/Total Footer for Paso 3 */}
            {paso === 3 && carrito.length > 0 && (
                <div className="absolute bottom-[40px] w-full bg-white border-t border-gray-200 p-4 rounded-b-3xl">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-bold text-gray-600">Total a Pagar:</span>
                        <span className="text-2xl font-bold text-green-600">${total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => finalizar('Cotización')}
                            className="flex-1 bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl active:bg-yellow-500 transition-colors"
                        >
                            Cotización
                        </button>
                        <button
                            onClick={() => finalizar('Pedido')}
                            className="flex-1 bg-bevalRed text-white font-bold py-3 rounded-xl active:bg-red-700 transition-colors shadow-lg shadow-red-200"
                        >
                            Pedido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
