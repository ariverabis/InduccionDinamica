import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ConfiguracionSds = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('selectedCompany');
    if (saved) setSelectedCompany(saved);
  }, []);

  const brandColors = {
    'Febeca': '#009EE3',
    'Beval': '#8CC63F',
    'Sillaca': '#E5007D',
    'Cofersa': '#009EE3',
    'Mundial de Partes': '#8CC63F'
  };

  const currentColor = selectedCompany ? brandColors[selectedCompany] : '#374151';

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      <header className="bg-white border-b border-gray-200 px-8 py-12 text-center relative">
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 flex items-center gap-2 py-2 px-4 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all font-medium"
        >
          ← Volver al Portal
        </button>
        
        <div className="absolute top-8 right-8 w-32 hidden md:block opacity-50">
           <img src="/portal_assets/Logotipos_Homologados_Prisma.jpg" alt="Logo" className="w-full h-auto grayscale" />
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">
          Manual de Instalación y Configuración
        </h1>
        <p className="text-xl text-gray-400 font-medium">
          Guía integral para aplicaciones SDS, Catálogo Digital, Codex y AFV.
        </p>
      </header>

      <main className="max-w-4xl mx-auto -mt-8 bg-white rounded-[2rem] shadow-2xl p-8 md:p-16 relative z-10 border border-gray-100">
        <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl mb-12">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Objetivos del Entrenamiento</h3>
          <p className="text-slate-600 leading-relaxed">
            El motivo principal de esta etapa es que nuestros colaboradores logren un dominio integral de las herramientas operativas tecnológicas y del portafolio de productos.
          </p>
          <ul className="mt-4 space-y-3">
             <li className="flex gap-3 text-slate-600">
                <span className="text-blue-500 font-black">✓</span>
                <span><strong>Dominio de la plataforma:</strong> Instalación técnica e inicio de sesión.</span>
             </li>
             <li className="flex gap-3 text-slate-600">
                <span className="text-blue-500 font-black">✓</span>
                <span><strong>Conocimiento del Inventario:</strong> Identificar el surtido específico de su empresa.</span>
             </li>
          </ul>
        </div>

        <section className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 mb-6 border-b-4 border-gray-100 pb-4">
            Aplicación Codex y Estructura
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed text-lg">
            Para un desempeño óptimo, es fundamental comprender la jerarquía de los códigos en nuestro sistema. La aplicación <strong>Codex</strong> es la herramienta clave.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
             {['Surtido', 'Categoría', 'Subcategoría', 'Código'].map(t => (
               <div key={t} className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                  <span className="block text-gray-900 font-bold text-lg">{t}</span>
               </div>
             ))}
          </div>

          <div className="text-center">
            <a 
              href="https://drive.google.com/file/d/1ToxteWIQhMVIe6y37yny1oEOcjjcVlQl/view?usp=drive_link"
              target="_blank"
              className="inline-flex items-center gap-3 bg-black text-white px-10 py-5 rounded-full font-bold hover:scale-105 transition-transform shadow-xl"
            >
              📥 Descargar Aplicación Codex (APK)
            </a>
          </div>
        </section>

        <section className="mb-16">
           <h2 className="text-3xl font-black text-gray-900 mb-6 border-b-4 border-gray-100 pb-4">
             (FASE II) Configuración
           </h2>
           <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border-2 border-gray-50 p-8 rounded-3xl" style={{ borderTopColor: currentColor, borderTopWidth: '8px' }}>
                 <h3 className="text-xl font-bold mb-4 text-gray-900">1. Configurar SDS</h3>
                 <ul className="space-y-4 text-gray-600 list-decimal list-inside">
                    <li>Ingrese la <strong>Dirección IP</strong>.</li>
                    <li>Acceda a <strong>Configuración</strong>.</li>
                    <li>Introduzca <strong>Usuario</strong>.</li>
                    <li>Ingrese <strong>Contraseña</strong> personal.</li>
                 </ul>
              </div>
              <div className="bg-white border-2 border-gray-50 p-8 rounded-3xl" style={{ borderTopColor: currentColor, borderTopWidth: '8px' }}>
                 <h3 className="text-xl font-bold mb-4 text-gray-900">2. Configurar Catálogo</h3>
                 <ul className="space-y-4 text-gray-600 list-decimal list-inside">
                    <li>Ingrese <strong>Nombre de Usuario</strong>.</li>
                    <li>Coloque su <strong>Correo Electrónico</strong>.</li>
                    <li>Verifique la <strong>Contraseña</strong> enviada.</li>
                 </ul>
              </div>
           </div>
        </section>

        <section>
          <h2 className="text-3xl font-black text-gray-900 mb-6 border-b-4 border-gray-100 pb-4">
            Instalación - {selectedCompany || 'Seleccione Empresa'}
          </h2>
          
          {selectedCompany && (
            <div className="bg-gray-50 border border-gray-100 rounded-3xl p-8 md:p-12">
               <div className="flex items-center gap-4 mb-6">
                 <span className="px-4 py-2 rounded-full text-white font-bold text-xs uppercase tracking-tighter" style={{ background: currentColor }}>
                    Casa {selectedCompany}
                 </span>
                 <h3 className="text-2xl font-black text-gray-900">Acceso a Play Store</h3>
               </div>
               
               <p className="text-gray-500 mb-8">Descargue las versiones oficiales certificadas para su dispositivo Android:</p>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <a href="#" className="flex items-center justify-center gap-2 p-4 rounded-2xl text-white font-bold transition-all hover:opacity-90 shadow-md" style={{ background: currentColor }}>
                     📲 Descargar SDS
                  </a>
                  <a href="#" className="flex items-center justify-center gap-2 p-4 rounded-2xl text-white font-bold transition-all hover:opacity-90 shadow-md" style={{ background: currentColor }}>
                     📲 Descargar AFV
                  </a>
                  <a href="#" className="flex items-center justify-center gap-2 p-4 rounded-2xl text-white font-bold transition-all hover:opacity-90 shadow-md" style={{ background: currentColor }}>
                     📲 Descargar Catálogo
                  </a>
                  <a href="#" className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-gray-800 text-white font-bold transition-all hover:bg-gray-900 shadow-md">
                     🌐 Visitar Web
                  </a>
               </div>

               <div className="bg-white p-6 rounded-2xl border border-gray-200">
                  <p className="font-bold text-gray-900 mb-2">⚙️ Configuración IP de la App SDS:</p>
                  <ul className="space-y-2">
                    <li className="text-gray-600"><strong>Dirección IP:</strong> <code className="bg-gray-100 p-1 rounded font-mono text-xs">192.168.X.X</code></li>
                    <li className="text-gray-600"><strong>Usuario:</strong> <code className="bg-gray-100 p-1 rounded font-mono text-xs">Tu_Usuario_{selectedCompany}</code></li>
                  </ul>
               </div>
            </div>
          )}

          {!selectedCompany && (
            <div className="text-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
               <p className="text-gray-400 font-bold">Vuelva al inicio para seleccionar una empresa y ver los links de descarga.</p>
            </div>
          )}
        </section>

        <footer className="mt-20 pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-400 italic">
               Quedo a su disposición para cualquier duda sobre la configuración de estas herramientas. — Alvaro Rivera, Asesor de Aprendizaje.
            </p>
        </footer>
      </main>
    </div>
  );
};

export default ConfiguracionSds;
