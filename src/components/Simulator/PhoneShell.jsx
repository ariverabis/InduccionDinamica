import React from 'react';

const PhoneShell = ({ children, cursor }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div
        className="w-[320px] h-[650px] bg-black rounded-[3rem] border-[8px] border-gray-800 shadow-2xl relative flex flex-col"
        style={{
          backgroundImage: 'url(preview.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Capa interior con overflow-hidden: recorta el contenido de pantallas */}
        <div className="absolute inset-0 rounded-[2.4rem] overflow-hidden flex flex-col">
          <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
          {children}
        </div>
        {/* Cursor fantasma: fuera del overflow-hidden para no ser recortado */}
        {cursor}
      </div>
    </div>
  );
};


export default PhoneShell;
