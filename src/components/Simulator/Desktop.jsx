import React from 'react';

const Desktop = ({ setPantalla, empresaSeleccionada, setEmpresaSeleccionada, setloginUsername, setloginPassword, setloginError, setSubPantallaCatalog }) => {
  const allApps = [
    { id: 'febeca', name: 'Febeca', logo: 'logoafv.jpeg', catalogLogo: 'logocatalogofebeca.png', sdsLogo: 'logo sds febeca.jpg', user: 'admin', pass: '1111' },
    { id: 'sillaca', name: 'Sillaca', logo: 'logoafv.jpeg', catalogLogo: 'logocatalogosillaca.png', sdsLogo: 'logo sds sillaca.jpg', user: 'admin', pass: '2222' },
    { id: 'beval', name: 'Beval', logo: 'logoafv.jpeg', catalogLogo: 'logoscatalogobeval.png', sdsLogo: 'logo sds beval.jpg', user: 'admin', pass: '3333' },
    { id: 'cofersa', name: 'Cofersa', logo: 'img/Cofersa.png', catalogLogo: 'img/Cofersa.png', sdsLogo: 'img/Cofersa.png', user: 'admin', pass: '4444' },
    { id: 'mundial', name: 'Mundial de Partes', logo: 'img/Mundial.png', catalogLogo: 'img/Mundial.png', sdsLogo: 'img/Mundial.png', user: 'admin', pass: '5555' },
  ];

  // Filtrar para mostrar solo la empresa seleccionada si existe
  const apps = empresaSeleccionada 
    ? allApps.filter(app => app.name.toLowerCase().includes(empresaSeleccionada.toLowerCase()))
    : allApps;

  return (
    <div className="flex-1 bg-blue-800 mt-8 rounded-t-2xl p-4 relative overflow-y-auto">
      <div className="relative z-10 grid grid-cols-3 gap-6 mt-6 px-4">
        {apps.map(app => (
          <React.Fragment key={app.id}>
            {/* AFV Icon */}
            <div onClick={() => {
              setEmpresaSeleccionada(app.name);
              setloginUsername(app.user);
              setloginPassword(app.pass);
              setloginError('');
              setPantalla('config'); // Saltamos el login redundante
            }} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                <img src={app.logo} alt={`AFV ${app.name}`} className="w-full h-full object-contain rounded-xl" />
              </div>
              <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">AFV<br />{app.name}</span>
            </div>

            {/* Catalog Icon */}
            <div onClick={() => {
              setEmpresaSeleccionada(app.name);
              setSubPantallaCatalog('inicio');
              setPantalla('catalogo');
            }} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                <img src={app.catalogLogo} alt={`Catálogo ${app.name}`} className="w-full h-full object-contain rounded-xl" />
              </div>
              <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">Catálogo<br />{app.name}</span>
            </div>

            {/* SDS Icon */}
            <div onClick={() => {
              setEmpresaSeleccionada(app.name);
              setPantalla('sds');
            }} className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-1 shadow-lg mb-1.5 border border-gray-200">
                <img src={app.sdsLogo} alt={`SDS ${app.name}`} className="w-full h-full object-contain rounded-xl" />
              </div>
              <span className="text-[10px] text-white font-bold text-center leading-tight drop-shadow-md">SDS<br />{app.name}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Desktop;
