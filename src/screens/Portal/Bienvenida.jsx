import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Bienvenida() {
  // useNavigate es un "hook" de React para cambiar de pantalla por código
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-6">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          ¡Bienvenido al Sistema!
        </h1>
        <p className="text-gray-600 mb-6">
          Selecciona una de las siguientes opciones para comenzar:
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/portal')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Ir al Portal de Inicio
          </button>

          <button
            onClick={() => navigate('/simulador')}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            Ir al Simulador
          </button>
        </div>
      </div>
    </div>
  );
}