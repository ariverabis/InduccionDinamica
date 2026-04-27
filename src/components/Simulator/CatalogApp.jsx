import React from 'react';

const CatalogApp = ({ 
  theme, 
  empresaSeleccionada, 
  carrito, 
  setCarrito, 
  setPantalla, 
  subPantallaCatalog, 
  setSubPantallaCatalog,
  busquedaCatalog,
  setBusquedaCatalog,
  productosBusqueda,
  productoSeleccionado,
  setProductoSeleccionado,
  setMostrarMenuCategorias,
  categoriaSeleccionada,
  setCategoriaSeleccionada
}) => {
  return (
    <div className="flex-1 bg-[#f5f5f5] mt-8 rounded-t-2xl flex flex-col relative overflow-hidden font-sans">
      {/* CABECERA ESTILO SMARTSALES */}
      <div className="p-3 flex items-center justify-between shadow-md z-30" style={{ backgroundColor: theme.bg, color: theme.text }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMostrarMenuCategorias(true)} className="text-2xl">☰</button>
          <div className="h-8 w-24">
            <img src={
              empresaSeleccionada === 'Febeca' ? 'logotipofebeca.jpg' : 
              empresaSeleccionada === 'Sillaca' ? 'logotiposillaca.jpeg' : 
              empresaSeleccionada === 'Beval' ? 'logotipobeval.jpg' :
              empresaSeleccionada === 'Cofersa' ? 'img/Cofersa.png' :
              'img/Mundial.png'
            } alt="Logo" className="h-full w-full object-contain brightness-0 invert" />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-xl">🔍</button>
          <button className="text-xl relative">
            🛒
            {carrito.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center border border-white font-bold">{carrito.length}</span>
            )}
          </button>
          <button onClick={() => setPantalla('escritorio')} className="text-xl">✕</button>
        </div>
      </div>

      {/* BUSCADOR PROMINENTE */}
      <div className="bg-white p-3 shadow-sm z-20 flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar Producto..."
            className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 text-sm outline-none border border-gray-200"
            value={busquedaCatalog}
            onChange={(e) => {
              setBusquedaCatalog(e.target.value);
              if (e.target.value.length > 2) setSubPantallaCatalog('busqueda');
            }}
          />
          <span className="absolute left-3 top-2.5 opacity-40">🔍</span>
        </div>
        <button className="bg-gray-800 text-white text-[10px] px-3 rounded-full font-bold uppercase tracking-tighter">Buscar por</button>
      </div>

      {/* CONTENIDO DINÁMICO SEGÚN SUBPANTALLA */}
      <div className="flex-1 overflow-y-auto pb-6">
        {subPantallaCatalog === 'inicio' && (
          <>
            {/* SALUDO */}
            <div className="p-4 bg-white mb-2">
              <p className="text-[13px] text-gray-800 font-medium">¡Bienvenido!, <span className="font-bold">INVERSIONES ALAFV, C.A.</span></p>
            </div>

            {/* BANNER CARRUSEL */}
            <div className="px-4 mb-4">
              <div className="w-full h-40 bg-blue-100 rounded-xl overflow-hidden shadow-sm relative">
                <img src="catalogo.jpg" className="w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex flex-col justify-end p-4">
                  <span className="text-white text-xs font-bold bg-blue-600 self-start px-2 py-0.5 rounded-full mb-1">PROMO</span>
                  <h3 className="text-white font-bold text-lg">Nueva Línea EMTOP</h3>
                </div>
              </div>
            </div>
            
            {/* Rest of the catalog UI... (simplified for now) */}
            <div className="px-4 py-10 text-center text-gray-400 text-xs italic">
               Explore nuestro catálogo completo...
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CatalogApp;
