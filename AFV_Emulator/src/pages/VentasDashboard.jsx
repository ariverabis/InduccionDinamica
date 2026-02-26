import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MoreVertical, ArrowLeft } from 'lucide-react';

export default function VentasDashboard() {
    const navigate = useNavigate();

    return (
        <div className="h-full flex flex-col bg-[#f0f0f0]">
            {/* Header (Cyan Blue) */}
            <div className="bg-[#00b0f0] text-black p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    {/* Simulated 'f' logo */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-black flex items-center justify-center text-white font-serif italic text-xl border border-blue-300">
                        f
                    </div>
                    <h1 className="text-base font-bold tracking-tight">073 - Menu Ventas</h1>
                </div>
                <MoreVertical size={20} />
            </div>

            {/* Back Button Row */}
            <div className="p-3 flex justify-end">
                <button
                    onClick={() => navigate('/')}
                    className="w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 flex items-center justify-center active:bg-gray-200"
                >
                    <ArrowLeft size={18} />
                </button>
            </div>

            {/* Menu Buttons */}
            <div className="px-8 mt-2 flex flex-col gap-4">

                <Link to="/ventas/catalogo" className="w-full bg-[#e6e6e6] text-black font-bold text-[11px] py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.2)] active:bg-gray-300 border border-gray-100 block">
                    PEDIDOS DEL CATÁLOGO
                </Link>

                <button className="w-full bg-[#e6e6e6] text-black font-bold text-[11px] py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.2)] active:bg-gray-300 border border-gray-100">
                    CLIENTES
                </button>

                <button className="w-full bg-[#e6e6e6] text-black font-bold text-[11px] py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.2)] active:bg-gray-300 border border-gray-100">
                    CONSULTAS
                </button>

                <Link to="/ventas/crear" className="w-full bg-[#e6e6e6] text-black font-bold text-[11px] py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.2)] active:bg-gray-300 border border-gray-100 block">
                    GESTIÓN DE VENTAS
                </Link>

                <button className="w-full bg-[#f2f2f2] text-gray-400 font-bold text-[11px] py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.1)] cursor-not-allowed border border-gray-100">
                    TRANSMITIR TRANSACCIONES
                </button>

                <button onClick={() => navigate('/')} className="w-full bg-[#e6e6e6] text-black font-bold text-[11px] py-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.2)] active:bg-gray-300 border border-gray-100 mt-4">
                    SALIR
                </button>

            </div>
        </div>
    );
}
