// src/components/ClienteTabla.jsx
import React, { useState, useEffect } from 'react';
import { saberSteps } from '../data/saberSteps';

// Utilidades para persistir en localStorage
const STORAGE_KEY = 'saber_clients';

const loadClients = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveClients = (clients) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch {}
};

export const ClienteTabla = () => {
  const [clients, setClients] = useState([]);
  const [newName, setNewName] = useState('');

  // Cargar al montar
  useEffect(() => {
    setClients(loadClients());
  }, []);

  // Guardar cada vez que cambie la lista
  useEffect(() => {
    saveClients(clients);
  }, [clients]);

  const addClient = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newClient = {
      id: Date.now(),
      name: newName.trim(),
      stepsDone: {}, // {S:true, A:false, ...}
    };
    setClients([...clients, newClient]);
    setNewName('');
  };

  const toggleStep = (clientId, stepId) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              stepsDone: {
                ...c.stepsDone,
                [stepId]: !c.stepsDone[stepId],
              },
            }
          : c
      )
    );
  };

  return (
    <section className="cliente-tabla container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6" style={{ background: 'linear-gradient(90deg, hsl(210,70%,55%), hsl(260,70%,55%))', WebkitBackgroundClip: 'text', color: 'transparent' }}>
        Registro de clientes
      </h1>
      <form className="flex gap-2 mb-4" onSubmit={addClient}>
        <input
          type="text"
          placeholder="Nombre del cliente"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 p-2 rounded border"
          required
        />
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition">
          Añadir
        </button>
      </form>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border font-medium">Cliente</th>
              {saberSteps.map((step) => (
                <th key={step.id} className="p-2 border font-medium" style={{ color: step.color }}>
                  {step.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="odd:bg-gray-50">
                <td className="p-2 border font-medium">{client.name}</td>
                {saberSteps.map((step) => (
                  <td key={step.id} className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={!!client.stepsDone[step.id]}
                      onChange={() => toggleStep(client.id, step.id)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
