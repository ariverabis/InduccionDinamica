import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, FileText } from 'lucide-react';

// Data Mock for incoming orders
const mockIncomingOrders = [
    { id: 'CD-8842', cliente: 'REPUESTOS SAN JOSE, C.A.', fecha: '2026-02-20', total: 1250.50, items: 12, estatus: 'Pendiente' },
    { id: 'CD-8843', cliente: 'AUTO REPUESTOS LOS ANDES', fecha: '2026-02-19', total: 430.00, items: 4, estatus: 'Pendiente' }
];

export default function CatalogoDigital() {
    const navigate = useNavigate();
    const [solicitudes, setSolicitudes] = useState(mockIncomingOrders);

    const procesarSolicitud = (id) => {
        alert(`Solicitud ${id} convertida a Cotización de AFV exitosamente.`);
        navigate('/ventas');
    };

    return (
        <div className="h-full flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 shadow-md flex items-center gap-3">
                <button onClick={() => navigate('/ventas')} className="active:scale-95">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-lg font-bold">Catálogo Digital</h1>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
                <p className="text-sm text-gray-500 mb-4">
                    Bandeja de solicitudes enviadas por los clientes a través del Catálogo Digital / WhatsApp.
                </p>

                <div className="space-y-3">
                    {solicitudes.map(sol => (
                        <div key={sol.id} className="bg-white p-4 rounded-xl shadow-sm border border-l-4 border-l-blue-500 relative">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-gray-800 text-sm">{sol.id}</span>
                                <span className="text-[10px] font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    {sol.estatus}
                                </span>
                            </div>
                            <p className="text-xs font-semibold text-gray-700">{sol.cliente}</p>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center gap-1 text-gray-500 text-xs">
                                    <FileText size={14} />
                                    <span>{sol.items} arts - ${sol.total.toFixed(2)}</span>
                                </div>

                                <button
                                    onClick={() => procesarSolicitud(sol.id)}
                                    className="bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 active:bg-blue-100"
                                >
                                    <Check size={14} /> Convertir a Cotización
                                </button>
                            </div>
                        </div>
                    ))}
                    {solicitudes.length === 0 && (
                        <p className="text-center text-gray-400 text-sm mt-10">No hay nuevas solicitudes.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
