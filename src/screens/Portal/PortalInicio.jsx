import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

import ConsolaEvaluacion from './ConsolaEvaluacion';

const BRAND_COLORS = {
  'Febeca': { 
    primary: '#005596', secondary: '#003d6b', shadow: 'rgba(0, 85, 150, 0.2)',
    manualLink: 'https://drive.google.com/file/d/13ZlnXlcEhPAt6mU-vH_r0a0BJQ1RJBxB/view?usp=drive_link',
    escenarioLink: 'https://drive.google.com/file/d/1bmXEwn5RYCtweAnkaElork_ORQKS--Ai/view?usp=drive_link',
    logo: '/img/febeca.png'
  },
  'Beval': { 
    primary: '#6a9d2d', secondary: '#4d7320', shadow: 'rgba(106, 157, 45, 0.2)',
    manualLink: 'https://drive.google.com/file/d/13ZlnXlcEhPAt6mU-vH_r0a0BJQ1RJBxB/view?usp=drive_link',
    escenarioLink: 'https://drive.google.com/file/d/1uksY-240gWs2UVVLQGQ_b9Km-QdL4i6b/view?usp=drive_link',
    logo: '/img/beval.png'
  },
  'Sillaca': { 
    primary: '#c40062', secondary: '#94004a', shadow: 'rgba(196, 0, 98, 0.2)',
    manualLink: 'https://drive.google.com/file/d/13ZlnXlcEhPAt6mU-vH_r0a0BJQ1RJBxB/view?usp=drive_link',
    escenarioLink: 'https://drive.google.com/file/d/1uSRtt0xtMxRyvcMWONYxKr4fY8Oaba3U/view?usp=sharing',
    logo: '/img/sillaca.png'
  },
  'Cofersa': { 
    primary: '#0078ae', secondary: '#005a83', shadow: 'rgba(0, 120, 174, 0.2)',
    manualLink: 'https://drive.google.com/file/d/13ZlnXlcEhPAt6mU-vH_r0a0BJQ1RJBxB/view?usp=drive_link', 
    escenarioLink: 'https://drive.google.com/file/d/11UjAtuypjiA5hcUM7Er-pctDKFnvDNX5/view?usp=sharing',
    logo: '/img/Cofersa.png'
  },
  'Mundial de Partes': { 
    primary: '#74a431', secondary: '#567a24', shadow: 'rgba(116, 164, 49, 0.2)',
    manualLink: 'https://drive.google.com/file/d/13ZlnXlcEhPAt6mU-vH_r0a0BJQ1RJBxB/view?usp=drive_link', 
    escenarioLink: 'https://drive.google.com/file/d/1EtfklDhUbHA1kvU_Xxf-GBxLBDI9a1-c/view?usp=sharing',
    logo: '/img/Mundial.png'
  }
};

const GLOSARIO_LINK = 'https://drive.google.com/file/d/1_3qp3rV95pKkhSp7ug8wi7CPeCRlPNlo/view?usp=sharing';

const PortalInicio = () => {
  const navigate = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showEvaluatorConsole, setShowEvaluatorConsole] = useState(false);
  const [showRoleplayModal, setShowRoleplayModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedEscenario, setSelectedEscenario] = useState(null);
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedCompany = localStorage.getItem('selectedCompany');
    const savedUser = localStorage.getItem('portalUser');
    
    if (savedCompany) setSelectedCompany(savedCompany);
    if (savedUser) setUserSession(JSON.parse(savedUser));
  }, []);

  const handleSelectCompany = (company) => {
    localStorage.setItem('selectedCompany', company);
    setSelectedCompany(company);
    if (!userSession) setShowLogin(true);
  };

  const [scenariosList, setScenariosList] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(false);

  useEffect(() => {
    if (selectedCompany) fetchScenarios();
  }, [selectedCompany]);

  const fetchScenarios = async () => {
    console.log('🎭 [DEBUG] Buscando escenarios para:', selectedCompany);
    setLoadingScenarios(true);
    const { data, error } = await supabase.schema('portal_afv').from('maestro_escenarios')
      .select('*').eq('empresa', selectedCompany).order('numero_escenario', { ascending: true });
    
    if (error) console.error('❌ [DEBUG] Error cargando escenarios:', error);
    console.log('✅ [DEBUG] Escenarios cargados:', data?.length);
    
    setScenariosList(data || []);
    setLoadingScenarios(false);
  };

  const [speechVentas, setSpeechVentas] = useState('');
  const [fileCatalogo, setFileCatalogo] = useState(null);
  const [fileAfv, setFileAfv] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [opMessage, setOpMessage] = useState('');

  const handleSubmitRoleplay = async () => {
    alert('Intentando enviar evidencia...'); // <-- Esto DEBE aparecer en tu pantalla
    console.log('🔘 [DEBUG-CLICK] Botón de enviar presionado');
    console.log('   - Escenario:', selectedEscenario?.id);
    console.log('   - Speech:', speechVentas ? 'OK' : 'VACÍO');
    console.log('   - File Catálogo:', fileCatalogo ? 'OK' : 'VACÍO');

    if (!selectedEscenario || !speechVentas || !fileCatalogo) {
      console.warn('⚠️ [DEBUG] Validación fallida: faltan campos obligatorios');
      setOpMessage('⚠️ El escenario, el speech y el PDF del catálogo son obligatorios.');
      return;
    }

    setIsUploading(true);
    setOpMessage('Procesando envío...');

    try {
      // Verificar sesión y obtener ID real del asesor
      console.log('[ROLEPLAY] userSession:', userSession);
      
      // Buscar el id real en usuarios para asegurar UUID correcto
      const { data: asesorData, error: asesorError } = await supabase
        .schema('portal_afv')
        .from('usuarios')
        .select('id')
        .eq('usuario', userSession.usuario)
        .single();

      if (asesorError || !asesorData) {
        console.error('[ROLEPLAY] Error buscando asesor:', asesorError);
        setOpMessage('❌ Error: no se pudo identificar al asesor.');
        return;
      }

      console.log('[ROLEPLAY] ID asesor resuelto:', asesorData.id);
      console.log('[ROLEPLAY] Escenario seleccionado:', selectedEscenario);

      // 1. Subir PDF Catálogo
      const catPath = `${userSession.usuario}/escenario_${selectedEscenario.numero_escenario}_catalogo.pdf`;
      const { error: catError } = await supabase.storage.from('evidencias_asesores').upload(catPath, fileCatalogo, { upsert: true });
      if (catError) { console.error('[ROLEPLAY] Error catálogo:', catError); throw catError; }
      const { data: { publicUrl: catUrl } } = supabase.storage.from('evidencias_asesores').getPublicUrl(catPath);

      // 2. Subir PDF AFV (Opcional)
      let afvUrl = null;
      if (fileAfv) {
        const afvPath = `${userSession.usuario}/escenario_${selectedEscenario.numero_escenario}_afv.pdf`;
        const { error: afvError } = await supabase.storage.from('evidencias_asesores').upload(afvPath, fileAfv, { upsert: true });
        if (afvError) { console.error('[ROLEPLAY] Error AFV:', afvError); }
        else {
          const { data: { publicUrl: aUrl } } = supabase.storage.from('evidencias_asesores').getPublicUrl(afvPath);
          afvUrl = aUrl;
        }
      }

      // 3. Guardar en BD con el UUID real del asesor
      const payload = {
        id_asesor: asesorData.id,
        id_escenario: selectedEscenario.id,
        pdf_catalogo_url: catUrl,
        pdf_afv_url: afvUrl,
        speech_ventas: speechVentas
      };
      console.log('🚀 [DEBUG-SUBMIT] Intentando insertar en portal_afv.ejercicios_evidencias:', payload);

      const { data, error } = await supabase.schema('portal_afv').from('ejercicios_evidencias').insert([payload]).select();

      if (error) {
        console.error('❌ [DEBUG-SUBMIT] Error de Base de Datos:', error);
        throw error;
      }

      console.log('✅ [DEBUG-SUBMIT] Inserción exitosa. Registro creado:', data);
      setOpMessage('✅ ¡Desafío enviado con éxito!');
      setTimeout(() => {
        setShowRoleplayModal(false);
        setSelectedEscenario(null);
        setSpeechVentas('');
        setFileCatalogo(null);
        setFileAfv(null);
        setOpMessage('');
      }, 2000);
    } catch (err) {
      console.error('[ROLEPLAY] Error general:', err);
      setOpMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) return setLoginError('Ingrese sus credenciales');
    setIsLoading(true);
    setLoginError('');

    try {
      const { data, error } = await supabase
        .schema('portal_afv')
        .from('usuarios')
        .select('*')
        .eq('usuario', username)
        .eq('clave', password)
        .single();

      if (error || !data) {
        setLoginError('Usuario o clave incorrectos');
      } else {
        // Verificar si es evaluador por correo
        const { data: evalData } = await supabase
          .schema('portal_afv')
          .from('evaluadores_autorizados')
          .select('*')
          .ilike('email', data.usuario.trim())
          .maybeSingle();

        // 🛡️ SEGURIDAD: El rol 'admin' siempre tiene prioridad.
        // Solo se reclasifica como evaluador si NO es admin.
        const isAuthorizedEval = evalData !== null;
        const finalRole = data.rol === 'admin' ? 'admin' : (isAuthorizedEval ? 'evaluador' : data.rol);

        const userData = { 
          ...data, 
          loginDate: new Date().toISOString(),
          rol: finalRole 
        };
        
        console.log("Login exitoso. Rol detectado:", finalRole);
        
        setUserSession(userData);
        localStorage.setItem('portalUser', JSON.stringify(userData));
        setShowLogin(false);
      }
    } catch (err) {
      setLoginError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!username || !password || !fullName || !email) return setLoginError('Complete todos los campos');
    if (!emailRegex.test(email)) return setLoginError('Formato de correo inválido');
    
    setIsLoading(true);
    setLoginError('');

    try {
      const { data, error } = await supabase
        .schema('portal_afv')
        .from('usuarios')
        .insert([
          { 
            usuario: username, 
            clave: password, 
            nombre: fullName, 
            correo: email,
            empresa: selectedCompany,
            rol: 'asesor'
          }
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') setLoginError('El usuario ya existe');
        else setLoginError('Error al crear cuenta');
      } else {
        const userData = { ...data, loginDate: new Date().toISOString() };
        setUserSession(userData);
        localStorage.setItem('portalUser', JSON.stringify(userData));
        setShowLogin(false);
        setIsRegistering(false);
      }
    } catch (err) {
      setLoginError('Error de servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('portalUser');
    localStorage.removeItem('selectedCompany');
    setUserSession(null);
    setSelectedCompany(null);
    setShowLogin(false);
  };

  const currentBrand = selectedCompany ? BRAND_COLORS[selectedCompany] : { primary: '#374151' };

  if (!selectedCompany) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 font-sans text-gray-800">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Portal de Formación AFV</h1>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Unidad de Capacitación Corporativa</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
          {Object.keys(BRAND_COLORS).map((name) => (
            <div key={name} onClick={() => handleSelectCompany(name)} className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:border-slate-300 transition-all group">
              <img src={BRAND_COLORS[name].logo} alt={name} className="h-12 w-auto object-contain opacity-40 group-hover:opacity-100 transition-opacity mb-4" />
              <h3 className="text-xs font-bold text-slate-600 tracking-tight">{name}</h3>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showLogin || !userSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-300">
          <div className="text-center mb-8">
            <img src={currentBrand.logo} className="h-8 mx-auto mb-4" alt="Empresa" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {isRegistering ? 'Filiación Académica' : 'Acceso Autorizado'}
            </h2>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
              {isRegistering ? 'Registro de nuevo Participante' : selectedCompany}
            </p>
          </div>
          <div className="space-y-3">
            {isRegistering && (
              <>
                <input type="text" placeholder="Nombre y Apellido" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-5 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm font-medium focus:ring-1 focus:ring-slate-900 transition-all" />
                <input type="email" placeholder="Correo Electrónico" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm font-medium focus:ring-1 focus:ring-slate-900 transition-all" />
              </>
            )}
            <input type="text" placeholder="Usuario" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-5 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm font-medium focus:ring-1 focus:ring-slate-900 transition-all" />
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 py-3 bg-slate-50 rounded-xl border border-slate-100 outline-none text-sm font-medium focus:ring-1 focus:ring-slate-900 transition-all" />
          </div>
          {loginError && <p className="text-red-500 text-[10px] font-bold mt-4 text-center">{loginError}</p>}
          
          <button 
            onClick={isRegistering ? handleRegister : handleLogin} 
            disabled={isLoading} 
            className="w-full mt-6 py-4 bg-slate-950 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg text-[10px] uppercase tracking-widest"
          >
            {isLoading ? 'Verificando...' : (isRegistering ? 'Completar Registro' : 'Iniciar Sesión')}
          </button>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setLoginError(''); }} 
              className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:underline"
            >
              {isRegistering ? '¿Posee una cuenta? Acceder' : '¿Nuevo participante? Crear cuenta'}
            </button>
          </div>
          
          <button onClick={() => { setSelectedCompany(null); setShowLogin(false); setIsRegistering(false); }} className="w-full mt-4 text-[9px] font-bold text-slate-300 uppercase tracking-widest hover:text-slate-600">Volver a Selección</button>
        </div>
      </div>
    );
  }

  if (showEvaluatorConsole) {
    return <ConsolaEvaluacion user={userSession} onBack={() => setShowEvaluatorConsole(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center font-sans">
      <nav className="w-full bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
           <img src={currentBrand.logo} className="h-6" alt="L" />
           <div className="h-4 w-[1px] bg-slate-200"></div>
           <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Participante: {userSession.nombre}</span>
           {(userSession.rol === 'admin' || userSession.rol === 'evaluador') && (
              <button 
                onClick={() => setShowEvaluatorConsole(true)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all ml-4"
              >
                Gestionar Evaluaciones
              </button>
           )}
           {userSession.rol === 'admin' && (
              <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Administrador</span>
           )}
        </div>
        <button onClick={handleLogout} className="text-[9px] font-bold text-slate-400 hover:text-red-500 tracking-[0.2em]">CERRAR SESIÓN</button>
      </nav>

      <main className="w-full max-w-5xl px-6 py-12 flex flex-col items-center animate-in fade-in duration-500">
        <header className="text-center mb-16 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">Itinerario Formativo <span style={{ color: currentBrand.primary }}>{selectedCompany}</span></h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">Siga los módulos establecidos para la validación de sus competencias técnicas en el sistema AFV.</p>
          
          {userSession.rol === 'admin' && (
            <div className="mt-8 p-6 bg-white border border-slate-200 rounded-3xl flex flex-col items-center gap-4 shadow-sm">
               <div className="text-center">
                  <h4 className="text-xs font-bold text-slate-900">Consola de Administración</h4>
                  <p className="text-[10px] text-slate-400">Supervisión de calificaciones y métricas de desempeño.</p>
               </div>
               <div className="flex gap-4">
                  <button onClick={() => setShowEvaluatorConsole(true)} className="px-6 py-3 bg-blue-600 text-white font-bold text-[9px] uppercase tracking-widest rounded-full shadow-lg hover:bg-blue-700 transition-all">Panel de Evaluadores →</button>
                  <button onClick={() => window.open('https://www.appsheet.com/start/63ddb171-3026-47af-aa20-36fde3921198', '_blank')} className="px-6 py-3 bg-red-600 text-white font-bold text-[9px] uppercase tracking-widest rounded-full shadow-lg hover:bg-red-700 transition-all">Reporte Global Antiguo →</button>
                </div>
            </div>
          )}
        </header>

        {/* --- PASO 1: REGISTRO Y CONFIGURACION --- */}
        <section className="w-full mb-16">
          <div className="flex items-center gap-4 mb-8">
             <span className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-[10px]">01</span>
             <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Filiación Académica e Inducción</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all text-left">
                <span className="text-2xl">📝</span>
                <div className="flex-1">
                   <h3 className="text-xs font-bold font-black text-slate-800">Censo Curricular</h3>
                   <button 
                    onClick={() => {
                      const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfZv8PrDzzlCpq7fsqkBYlAOSkAzsRBmUEDz4A-901r3cpJOg/viewform?usp=pp_url";
                      const params = `&entry.1319823054=${encodeURIComponent(userSession.nombre || '')}` +
                                     `&entry.1185854057=${encodeURIComponent(userSession.correo || '')}` +
                                     `&entry.553997044=${encodeURIComponent(userSession.clave || '')}` +
                                     `&entry.523342047=${encodeURIComponent(selectedCompany || '')}`;
                      window.open(baseUrl + params, '_blank');
                    }}
                    className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                   >
                     Registrar Datos →
                   </button>
                </div>
             </div>
             <div onClick={() => navigate('/sds')} className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer text-left">
                <span className="text-2xl">⚙️</span>
                <div className="flex-1">
                   <h3 className="text-xs font-bold font-black text-slate-800">Configuración Técnica</h3>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inducción de Aplicaciones</span>
                </div>
             </div>
             {/* CONSOLA DE EVALUACIÓN (Admin y Evaluadores) */}
                {(userSession.rol === 'admin' || userSession.rol === 'evaluador') && (
                    <div 
                        onClick={() => setShowEvaluatorConsole(true)}
                        className="group relative bg-slate-900 p-8 rounded-2xl border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
                    >
                        <div className="text-2xl mb-2">🏛️</div>
                        <h3 className="text-xs font-black text-white mb-1 uppercase tracking-widest">Consola Académica</h3>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-widest">
                            Módulo de evaluación y seguimiento de asesores.
                        </p>
                    </div>
                )}
          </div>
        </section>

        {/* --- PASO 2: SIMULACIONES --- */}
        <section className="w-full mb-16">
          <div className="flex items-center gap-4 mb-8">
             <span className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-[10px]">02</span>
             <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Entrenamiento en Simuladores</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition-all border-b-4 flex flex-col" style={{borderBottomColor: currentBrand.primary}}>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Simulador de Ventas</h3>
              <p className="text-[11px] text-slate-500 mb-6 font-medium flex-1">Laboratorio de práctica para creación de pedidos y gestión de inventario.</p>
              <button onClick={() => navigate('/simulador')} className="w-full py-3 rounded-xl font-black text-white text-[9px] uppercase tracking-widest shadow-md" style={{background: currentBrand.primary}}>💻 Iniciar Laboratorio</button>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition-all border-b-4 flex flex-col" style={{borderBottomColor: currentBrand.primary}}>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Simulador de Cobranzas</h3>
              <p className="text-[11px] text-slate-500 mb-6 font-medium flex-1">Validación de flujos financieros, recibos y depósitos bancarios.</p>
              <button onClick={() => navigate('/simulador')} className="w-full py-3 rounded-xl font-black text-white text-[9px] uppercase tracking-widest shadow-md" style={{background: currentBrand.primary}}>💰 Iniciar Gestión</button>
            </div>
          </div>
        </section>

        {/* --- PASO 3: RECURSOS --- */}
        <section className="w-full mb-16">
          <div className="flex items-center gap-4 mb-8">
             <span className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-[10px]">03</span>
             <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Prácticas Situacionales y Roleplay</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* BOTÓN PRINCIPAL DEL ROLEPLAY */}
             <div 
               onClick={() => setShowRoleplayModal(true)}
               className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-blue-100 shadow-xl shadow-blue-50/50 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all col-span-1 md:col-span-2"
             >
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-xl shadow-blue-200 group-hover:scale-110 transition-transform">🎭</div>
                <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Módulo de Roleplay Digital</h3>
                <p className="text-sm text-slate-500 max-w-sm mb-6">Seleccione uno de los 10 escenarios situacionales, realice su tarea en las apps comerciales y suba sus evidencias aquí.</p>
                <span className="bg-blue-600 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest">Iniciar Desafío →</span>
             </div>

             {/* OTROS RECURSOS */}
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer" onClick={() => window.open(GLOSARIO_LINK, '_blank')}>
                <div className="flex items-center gap-4 text-left">
                   <span className="text-2xl">📖</span>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Glosario Técnico</h4>
                      <p className="text-[9px] text-slate-400">Terminología AFV</p>
                   </div>
                </div>
                <span className="text-xs opacity-20 group-hover:opacity-100 transition-opacity">➔</span>
             </div>
             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer" onClick={() => currentBrand.manualLink && window.open(currentBrand.manualLink, '_blank')}>
                <div className="flex items-center gap-4 text-left">
                   <span className="text-2xl">📄</span>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Manual Codex</h4>
                      <p className="text-[9px] text-slate-400">Guía de usuario</p>
                   </div>
                </div>
                <span className="text-xs opacity-20 group-hover:opacity-100 transition-opacity">➔</span>
             </div>
          </div>
        </section>

        {/* --- PASO 4: EVALUACION --- */}
        <section id="evaluaciones" className="w-full mb-16">
          <div className="flex items-center gap-4 mb-8">
             <span className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center font-black text-[10px]">04</span>
             <h2 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Evaluación de Competencias y Certificación</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 text-center shadow-md">
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 block">Fase de Validación Sumativa</span>
             <p className="text-sm text-slate-500 mb-8 max-w-2xl mx-auto font-medium">
               Tras completar los módulos formativos, por favor proceda con la validación de sus competencias académicas para la obtención de su certificación oficial.
             </p>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 text-left">
                {[
                  { t: 'Evaluación AFV Profesional', l: 'https://docs.google.com/forms/d/e/1FAIpQLScjLXWVS10t7L1gtC1OErbksyn6uXHX9G74uBxmCobqO-62ew/viewform' },
                  { t: 'Validación de Catálogo Digital', l: 'https://docs.google.com/forms/d/e/1FAIpQLSf-T62I4aMMmt0zcxn5VRaSg8ita_o-XxOa2GK4H4q4qxP8XQ/viewform' },
                  { t: 'Examen Teórico de Terminología', l: 'https://docs.google.com/forms/d/e/1FAIpQLSf33_fV9jqCXODZSyS5af_Rpcv8S4_SThAUK6tACcP7c5OagA/viewform' },
                  { t: 'Valoración de Prácticas Situacionales', l: currentBrand.escenarioLink }
                ].map(ex => (
                  <div 
                    key={ex.t} 
                    onClick={() => ex.l && window.open(ex.l, '_blank')}
                    className={`p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between group transition-all ${ex.l ? 'hover:bg-white hover:border-slate-300 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
                  >
                     <span className="text-[10px] font-bold text-slate-700 tracking-tight">{ex.t}</span>
                     {ex.l && <span className="text-[10px] opacity-20 group-hover:opacity-100 transition-opacity">➔</span>}
                  </div>
                ))}
             </div>
             <button onClick={() => setShowAuthModal(true)} className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 border-b border-transparent hover:border-slate-900 transition-all">Informe Personal de Calificaciones →</button>
          </div>
        </section>
      </main>

      <footer className="py-12 text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">Dirección de Aprendizaje Corporativo — v2.0</footer>

      {/* MODAL DE ROLEPLAY DIGITAL */}
      {showRoleplayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl h-full max-h-[85vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden relative border border-white/20">
              <button 
                onClick={() => setShowRoleplayModal(false)}
                className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all z-20"
              >✕</button>

              <div className="p-10 md:p-16 flex flex-col h-full">
                 <header className="mb-10 text-center md:text-left">
                    <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                       <span className="text-4xl">🎭</span> Módulo de Roleplay Digital
                    </h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 px-1">Seleccione su desafío situacional para iniciar la práctica</p>
                 </header>

                 {!selectedEscenario ? (
                   <div className="flex-1 overflow-y-auto pr-2">
                     {loadingScenarios ? (
                       <div className="flex items-center justify-center h-48 text-slate-300 font-black text-[10px] uppercase tracking-widest animate-pulse">Cargando escenarios disponibles...</div>
                     ) : scenariosList.length === 0 ? (
                       <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-100 rounded-3xl text-center p-10">
                         <span className="text-4xl mb-4">⏳</span>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tu evaluador aún no ha cargado los escenarios disponibles.</p>
                         <p className="text-[9px] text-slate-300 mt-2">Consulta con tu supervisor para más información.</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                         {scenariosList.map(esc => (
                           <div
                             key={esc.id}
                             onClick={() => setSelectedEscenario(esc)}
                             className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all group relative overflow-hidden"
                           >
                             <div className="absolute -right-4 -bottom-4 text-7xl font-black text-slate-200/50 opacity-10 group-hover:opacity-20 transition-opacity">#{esc.numero_escenario}</div>
                             <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[8px] font-black uppercase inline-block mb-3">Caso #{esc.numero_escenario}</span>
                             <h4 className="text-xs font-black text-slate-800 uppercase mb-1">{esc.titulo_escenario || `Escenario Situacional #${esc.numero_escenario}`}</h4>
                             <p className="text-[10px] text-slate-400 font-medium">{esc.descripcion_tarea || 'Haga clic para ver los detalles de este caso.'}</p>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ) : (
                   <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
                      <button 
                        onClick={() => setSelectedEscenario(null)}
                        className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-6 flex items-center gap-2"
                      >← Volver a la Lista</button>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full overflow-hidden">
                         <div className="md:col-span-1 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                            <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase inline-block mb-4">Caso Seleccionado</span>
                            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter leading-tight">
                               #{selectedEscenario.numero_escenario}: {selectedEscenario.titulo_escenario || 'Escenario Situacional'}
                            </h3>
                            <div className="space-y-6">
                               <div>
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instrucción:</h4>
                                  <p className="text-xs text-slate-600 leading-relaxed font-medium italic">
                                    {selectedEscenario.descripcion_tarea || '"Realice la simulación completa de este caso utilizando el Catálogo Digital para la preventa y el AFV para el cierre del pedido."'}
                                  </p>
                               </div>
                               {selectedEscenario.pdf_url && (
                                  <button 
                                    onClick={() => window.open(selectedEscenario.pdf_url, '_blank')}
                                    className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                  >
                                     📄 Abrir Escenario Específico
                                  </button>
                               )}
                            </div>
                         </div>

                         <div className="md:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
                               <h4 className="text-xs font-black text-slate-900 uppercase mb-4">1. Mi Speech de Ventas ✨</h4>
                               <textarea 
                                 value={speechVentas}
                                 onChange={(e) => setSpeechVentas(e.target.value)}
                                 placeholder="Escriba aquí el mensaje o guion que le diría al cliente para cerrar esta venta..." 
                                 className="w-full h-32 p-5 bg-slate-50 border border-slate-100 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-blue-400 transition-all font-medium"
                               ></textarea>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm border-dashed border-2">
                               <h4 className="text-xs font-black text-slate-900 uppercase mb-4">2. Evidencias Digitales 📂</h4>
                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <label className={`p-6 rounded-2xl border flex flex-col items-center text-center group cursor-pointer transition-all ${fileCatalogo ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-300'}`}>
                                    <span className="text-2xl mb-2">{fileCatalogo ? '✅' : '📒'}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{fileCatalogo ? fileCatalogo.name : 'PDF Catálogo'}</span>
                                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFileCatalogo(e.target.files[0])} />
                                  </label>
                                  <label className={`p-6 rounded-2xl border flex flex-col items-center text-center group cursor-pointer transition-all ${fileAfv ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-300'}`}>
                                    <span className="text-2xl mb-2">{fileAfv ? '✅' : '📱'}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{fileAfv ? fileAfv.name : 'PDF AFV (Op)'}</span>
                                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFileAfv(e.target.files[0])} />
                                  </label>
                               </div>
                            </div>

                            {opMessage && <p className="text-center text-[10px] font-bold text-blue-600 uppercase tracking-widest animate-pulse">{opMessage}</p>}

                            <button 
                              onClick={handleSubmitRoleplay}
                              disabled={isUploading}
                              className="w-full py-5 bg-slate-950 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50"
                            >
                               {isUploading ? '🚀 ENVIANDO...' : '🚀 Enviar Desafío Situacional a Evaluación'}
                            </button>
                         </div>
                      </div>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PortalInicio;
