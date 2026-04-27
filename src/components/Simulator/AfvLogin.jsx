import React from 'react';
import { supabase } from '../../lib/supabase';

const AfvLogin = ({ theme, empresaSeleccionada, setPantalla, loginUsername, setloginUsername, loginPassword, setloginPassword, loginError, setloginError }) => {
  const handleLogin = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', loginUsername)
        .eq('password', loginPassword)
        .single();

      if (data) {
        setloginError('');
        setPantalla('config');
      } else {
        setloginError('Usuario o contraseña incorrectos.');
      }
    } catch (err) {
      setloginError('Error de conexión con la base de datos.');
    }
  };

  return (
    <div className="flex-1 bg-white mt-8 rounded-t-2xl flex flex-col relative overflow-hidden">
      <div className="p-2.5 flex items-center justify-between border-b" style={{ backgroundColor: theme.bg, borderColor: theme.border, color: theme.text }}>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[8px] font-bold text-gray-800">AFV</span>
          </div>
          <span className="text-[13px] font-normal font-sans">Login AFV - {empresaSeleccionada || 'Febeca'}</span>
        </div>
        <button onClick={() => setPantalla('escritorio')} className="text-xl leading-none">←</button>
      </div>
      <div className="flex-1 flex flex-col p-6 items-center justify-center">
        <h2 className="text-xl font-bold text-gray-800 mb-6 font-sans">Bienvenido</h2>
        <div className="w-full space-y-4 font-sans">
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Usuario</label>
            <input
              type="text"
              value={loginUsername}
              onChange={(e) => setloginUsername(e.target.value)}
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1 px-2 text-sm bg-gray-50 rounded-t"
              placeholder="Ingrese el usuario"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">Contraseña</label>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setloginPassword(e.target.value)}
              className="w-full border-b-2 border-gray-300 focus:border-blue-500 outline-none py-1 px-2 text-sm bg-gray-50 rounded-t"
              placeholder="Ingrese la contraseña"
            />
          </div>
          {loginError && (
            <p className="text-red-500 text-[10px] font-bold text-center mt-2">{loginError}</p>
          )}
          <button
            onClick={handleLogin}
            className="w-full text-white font-bold py-3 mt-4 rounded-lg shadow-md transition-colors"
            style={{ backgroundColor: theme.bg }}
          >
            INGRESAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default AfvLogin;
