import React from 'react';

const PhoneShell = ({ children, theme }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div
        className="w-[320px] h-[650px] bg-black rounded-[3rem] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden flex flex-col"
        style={{
          backgroundImage: 'url(preview.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
        {children}
      </div>
    </div>
  );
};

export default PhoneShell;
