import React from 'react';

const Overlays = ({ 
  cursorPos, 
  isClicking, 
  mostrarCalculadora, 
  setMostrarCalculadora,
  imgCalculadora,
  mostrarSoporte,
  setMostrarSoporte,
  mostrarLupa
}) => {
  return (
    <>
      {/* Ghost Cursor */}
      {cursorPos.visible && (
        <div
          className={`fixed pointer-events-none z-[999] transition-transform duration-100 ${isClicking ? 'scale-75' : 'scale-100'}`}
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transition: 'left 0.4s ease-out, top 0.4s ease-out, transform 0.1s'
          }}
        >
          <div className="relative">
             <img src="cursor.png" className="w-8 h-8" alt="cursor" />
             {isClicking && (
               <div className="absolute inset-0 bg-blue-400/40 rounded-full animate-ping"></div>
             )}
          </div>
        </div>
      )}

      {/* CALCULADORA WINDOWS 11 STYLE */}
      {mostrarCalculadora && (
        <div className="absolute inset-0 z-[150] flex items-center justify-center p-2 bg-black/20 animate-in fade-in duration-300">
          <div className="w-[280px] bg-[#f3f3f3] rounded-lg shadow-2xl border border-gray-300 overflow-hidden flex flex-col font-sans animate-in zoom-in-95 duration-300">
            <div className="bg-[#f3f3f3] px-3 py-1.5 flex justify-between items-center text-[11px] text-gray-500">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📊</span>
                <span>Calculadora</span>
              </div>
              <div className="flex gap-4">
                <button className="hover:bg-gray-200 px-2 transition-colors">─</button>
                <button className="hover:bg-gray-200 px-2 transition-colors">▢</button>
                <button onClick={() => setMostrarCalculadora(false)} className="px-2 hover:bg-red-500 hover:text-white transition-colors">✕</button>
              </div>
            </div>
            <div className="px-4 pt-4 pb-2">
              <div className="text-right text-gray-500 text-[13px] h-5 mb-1">
                {imgCalculadora === 'calc1.png' ? '45718.20 / 84.46 =' : '10988.39 - 541.30 ='}
              </div>
              <div className="text-right text-4xl font-semibold text-gray-900 mb-2 truncate tracking-tight">
                {imgCalculadora === 'calc1.png' ? '541.3' : '20.30'}
              </div>
            </div>
            {/* simplified keypad for the modular version */}
            <div className="px-1 pb-1">
              <div className="grid grid-cols-4 gap-[2px]">
                {['7', '8', '9', 'X', '4', '5', '6', '-', '1', '2', '3', '+', '+/-', '0', '.', '='].map(btn => (
                  <button key={btn} className={`text-sm py-3 rounded-sm ${btn === '=' ? 'bg-[#0067c0] text-white' : 'bg-white text-gray-900 font-semibold'}`}>{btn}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY SOPORTE PAGO */}
      {mostrarSoporte && (
        <div className="absolute inset-0 bg-black/70 z-[200] flex items-center justify-center animate-in fade-in slide-in-from-bottom duration-500">
          <div className="relative w-[92%] max-h-[85%] shadow-2xl rounded-lg overflow-hidden border-4 border-white/10 flex flex-col bg-white">
            <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
              <span className="text-[11px] font-bold text-gray-700 uppercase">Soporte de Pago</span>
              <button onClick={() => setMostrarSoporte(false)} className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">✕</button>
            </div>
            <div className="flex-1 overflow-auto bg-gray-200 relative">
              <img src="soportepago.jpeg" alt="Soporte de Pago" className="w-full h-auto" />
              {mostrarLupa && (
                <div className="absolute z-[210] w-32 h-32 rounded-full border-4 border-blue-500 shadow-2xl pointer-events-none overflow-hidden"
                  style={{
                    top: '55%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundImage: 'url(soportepago.jpeg)', backgroundSize: '300%', backgroundPosition: '50% 64%'
                  }}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Overlays;
