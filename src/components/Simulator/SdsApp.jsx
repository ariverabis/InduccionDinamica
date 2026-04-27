import React from 'react';

const SdsApp = ({ theme, setPantalla, empresaSeleccionada }) => {
  return (
    <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col overflow-hidden font-sans">
      <div className="p-3 flex items-center justify-between shadow-md" style={{ backgroundColor: theme.bg, color: theme.text }}>
        <div className="flex items-center gap-2">
           <span className="font-bold text-xs uppercase tracking-wider">Smart Data System (SDS)</span>
        </div>
        <button onClick={() => setPantalla('escritorio')} className="text-xl">✕</button>
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
         <div className="w-24 h-24 mb-6 bg-blue-50 rounded-full flex items-center justify-center">
            <img src={
                empresaSeleccionada === 'Febeca' ? 'logo sds febeca.jpg' : 
                empresaSeleccionada === 'Sillaca' ? 'logo sds sillaca.jpg' : 
                'logo sds beval.jpg'
            } className="w-16 h-16 object-contain" alt="SDS" />
         </div>
         <h2 className="text-lg font-bold text-gray-800 mb-2">Bienvenido a SDS</h2>
         <p className="text-xs text-gray-500 mb-8 px-4">Sincronice sus datos para comenzar a gestionar sus ventas y cobranzas de manera eficiente.</p>
         <button className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all">
            SINCRONIZAR AHORA
         </button>
         <div className="mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Versión 2.5.0</div>
      </div>
    </div>
  );
};

export default SdsApp;
