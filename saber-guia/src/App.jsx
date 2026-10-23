// src/App.jsx
import React, { useState } from 'react';
import { GuiaSaber } from './components/GuiaSaber';
import { ClienteTabla } from './components/ClienteTabla';
import './index.css';

const tabs = [
  { id: 'guia', label: 'Guía SABER' },
  { id: 'clientes', label: 'Clientes' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('guia');

  return (
    <div className="app min-h-screen bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md">
        <h1 className="text-2xl font-bold text-center">Método SABER – Asesor en Campo</h1>
        <nav className="flex justify-center gap-4 mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded transition ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700'} `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="p-4">
        {activeTab === 'guia' && <GuiaSaber />}
        {activeTab === 'clientes' && <ClienteTabla />}
      </main>
      <footer className="p-4 text-center text-sm opacity-70">
        © {new Date().getFullYear()} Aplicación SABER – Desarrollado con ❤️
      </footer>
    </div>
  );
}
