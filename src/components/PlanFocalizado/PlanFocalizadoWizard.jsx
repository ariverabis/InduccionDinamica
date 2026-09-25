import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import productosData from '../../data/productos.json';
import { exportPlanToExcel } from './exportPlanToExcel';
import { exportPlanToPDF } from './exportPlanToPDF';

// ─── Constantes ───────────────────────────────────────────────────────────────
const TIPOS_MATERIAL_POP = [
  { key: 'exhibidor',   label: 'Exhibidor de Marca',   icon: '🗃️' },
  { key: 'banderin',    label: 'Banderines',            icon: '🚩' },
  { key: 'material_pop',label: 'Material POP General',  icon: '📢' },
  { key: 'gorra',       label: 'Gorras',                icon: '🧢' },
  { key: 'franela',     label: 'Franelas / Uniformes',  icon: '👕' },
  { key: 'otro',        label: 'Otro',                  icon: '📦' },
];

const TIPOS_ASESORIA = [
  { key: 'fuerza_ventas', label: 'Fuerza de Ventas del Cliente',  icon: '🤝', descripcion: 'Capacitación a los vendedores del cliente en los productos de la marca.' },
  { key: 'piso_ventas',   label: 'Piso de Ventas (atención cliente final)', icon: '🏪', descripcion: 'Presencia en el punto de venta atendiendo a los clientes finales.' },
  { key: 'vendedores_ext',label: 'Vendedores Externos del Cliente', icon: '🚗', descripcion: 'Acompañamiento a vendedores que atienden fuera del local.' },
];

const FRECUENCIAS = ['1 vez por semana', '2 veces por semana', 'Quincenal', 'Mensual', 'A demanda'];
const DURACIONES  = [0.5, 1, 1.5, 2, 3, 4];

const STEP_LABELS = ['Encabezado', 'Marcas & Clientes', 'Pedido Propuesto', 'Marketing', 'Asesoría', 'Condiciones', 'Resumen'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getMarcasUnicas = () => [...new Set(productosData.map(p => p.Marca))].sort();

const getProductosByMarca = (marca) =>
  productosData.filter(p => p.Marca === marca);

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function StepIndicator({ current, total, labels }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto pb-2">
      {labels.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] transition-all
                ${done   ? 'bg-emerald-500 text-white' : ''}
                ${active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                ${!done && !active ? 'bg-slate-100 text-slate-400' : ''}
              `}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[8px] mt-1 font-black uppercase tracking-tight whitespace-nowrap
                ${active ? 'text-blue-600' : done ? 'text-emerald-500' : 'text-slate-300'}
              `}>{label}</span>
            </div>
            {i < labels.length - 1 && (
              <div className={`h-[2px] w-6 mt-[-12px] transition-all ${done ? 'bg-emerald-400' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function CardSection({ title, icon, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div>
      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder = 'Seleccione...' }) {
  return (
    <div>
      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Pasos del Wizard ─────────────────────────────────────────────────────────

/** PASO 0: Encabezado del plan */
function Step0Encabezado({ data, onChange }) {
  return (
    <div className="space-y-4">
      <CardSection title="Información General del Plan" icon="📋">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            label="Nombre del Plan"
            value={data.nombre_plan}
            onChange={v => onChange('nombre_plan', v)}
            placeholder="ej. Plan Q3 2026 Sika"
            required
          />
          <InputField
            label="Fecha del Plan"
            value={data.fecha_plan}
            onChange={v => onChange('fecha_plan', v)}
            type="date"
            required
          />
          <InputField
            label="Fecha de Inicio"
            value={data.fecha_inicio}
            onChange={v => onChange('fecha_inicio', v)}
            type="date"
          />
          <InputField
            label="Fecha de Fin"
            value={data.fecha_fin}
            onChange={v => onChange('fecha_fin', v)}
            type="date"
          />
        </div>
      </CardSection>
    </div>
  );
}

/** PASO 1: Marcas y Clientes */
function Step1MarcasClientes({ items, onAdd, onRemove }) {
  const [marca, setMarca] = useState('');
  const [cliente, setCliente] = useState('');
  const marcas = getMarcasUnicas();

  const handleAdd = () => {
    if (!marca || !cliente.trim()) return;
    onAdd({ marca, cliente_nombre: cliente.trim() });
    setCliente('');
  };

  return (
    <div className="space-y-4">
      <CardSection title="Agregar Marca + Cliente" icon="🎯">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <SelectField
            label="Marca a Impulsar"
            value={marca}
            onChange={setMarca}
            options={marcas.map(m => ({ value: m, label: m }))}
            placeholder="Seleccione marca..."
          />
          <InputField
            label="Nombre del Cliente"
            value={cliente}
            onChange={setCliente}
            placeholder="Nombre del cliente..."
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={!marca || !cliente.trim()}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-40 transition-all"
        >
          + Agregar
        </button>
      </CardSection>

      {items.length > 0 && (
        <CardSection title="Marcas y Clientes del Plan" icon="📌">
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
                <div>
                  <span className="bg-blue-600 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase mr-2">{item.marca}</span>
                  <span className="text-sm font-medium text-slate-700">{item.cliente_nombre}</span>
                </div>
                <button
                  onClick={() => onRemove(i)}
                  className="text-red-400 hover:text-red-600 text-xs font-bold px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                >✕</button>
              </div>
            ))}
          </div>
        </CardSection>
      )}
    </div>
  );
}

/** PASO 2: Pedido Propuesto */
function Step2Pedido({ marcasClientes, pedido, onToggle, onCantidad }) {
  const [filterMarca, setFilterMarca] = useState(marcasClientes[0]?.marca || '');
  const [filterCliente, setFilterCliente] = useState('');
  const [search, setSearch] = useState('');

  const marcasUsadas = [...new Set(marcasClientes.map(mc => mc.marca))];
  const clientesDeMarca = marcasClientes.filter(mc => mc.marca === filterMarca).map(mc => mc.cliente_nombre);

  useEffect(() => {
    if (clientesDeMarca.length > 0) setFilterCliente(clientesDeMarca[0]);
  }, [filterMarca]);

  const productos = getProductosByMarca(filterMarca).filter(p =>
    !search || p.Articulo.toLowerCase().includes(search.toLowerCase()) || p.Codigo.includes(search)
  );

  const getPedidoKey = (codigo, marca, cliente) => `${codigo}|${marca}|${cliente}`;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <CardSection title="Seleccionar Artículos" icon="🛒">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <SelectField
            label="Marca"
            value={filterMarca}
            onChange={v => { setFilterMarca(v); setSearch(''); }}
            options={marcasUsadas.map(m => ({ value: m, label: m }))}
          />
          <SelectField
            label="Cliente"
            value={filterCliente}
            onChange={setFilterCliente}
            options={clientesDeMarca.map(c => ({ value: c, label: c }))}
          />
          <InputField
            label="Buscar artículo"
            value={search}
            onChange={setSearch}
            placeholder="Nombre o código..."
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
          {productos.length === 0 ? (
            <p className="text-center text-[10px] text-slate-400 font-bold py-8 uppercase tracking-widest">Sin resultados</p>
          ) : productos.map(prod => {
            const key = getPedidoKey(prod.Codigo, filterMarca, filterCliente);
            const item = pedido.find(p => p._key === key);
            const selected = !!item;
            return (
              <div
                key={prod.Codigo}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                  ${selected ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}
                onClick={() => onToggle({ _key: key, codigo_articulo: prod.Codigo, nombre_articulo: prod.Articulo, marca: filterMarca, cliente_nombre: filterCliente, cantidad_propuesta: 1 })}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${selected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                  {selected && <span className="text-[9px] font-black">✓</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{prod.Articulo}</p>
                  <p className="text-[9px] text-slate-400 font-mono">{prod.Codigo} · {prod.SubCategoria}</p>
                </div>
                {selected && (
                  <input
                    type="number"
                    min="1"
                    value={item.cantidad_propuesta}
                    onChange={e => { e.stopPropagation(); onCantidad(key, parseInt(e.target.value) || 1); }}
                    onClick={e => e.stopPropagation()}
                    className="w-16 px-2 py-1 border border-blue-200 rounded-lg text-xs font-bold text-center bg-white outline-none"
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardSection>

      {/* Resumen del pedido */}
      {pedido.length > 0 && (
        <CardSection title={`${pedido.length} artículo(s) seleccionado(s)`} icon="✅">
          <div className="max-h-40 overflow-y-auto space-y-1">
            {pedido.map(p => (
              <div key={p._key} className="flex justify-between text-[10px] text-slate-600 font-medium py-1 border-b border-slate-50 last:border-0">
                <span className="truncate mr-2">{p.nombre_articulo}</span>
                <span className="font-black text-blue-600 flex-shrink-0">× {p.cantidad_propuesta}</span>
              </div>
            ))}
          </div>
        </CardSection>
      )}
    </div>
  );
}

/** PASO 3: Marketing / Material POP */
function Step3Marketing({ items, onUpdate }) {
  const marcas = [...new Set(items.filter(i => i.marca).map(i => i.marca))];

  const getItem = (tipo) => items.find(i => i.tipo_material === tipo) || null;

  const handleToggle = (tipo, marca) => {
    const existing = getItem(tipo);
    if (existing) {
      onUpdate(items.filter(i => i.tipo_material !== tipo));
    } else {
      onUpdate([...items, { tipo_material: tipo, marca: marca || '', cantidad: 1, observacion: '' }]);
    }
  };

  const handleField = (tipo, field, value) => {
    onUpdate(items.map(i => i.tipo_material === tipo ? { ...i, [field]: value } : i));
  };

  const [selectedMarca, setSelectedMarca] = useState('');
  const marcasDisponibles = getMarcasUnicas();

  return (
    <div className="space-y-4">
      <CardSection title="Material POP y Marketing por Marca" icon="📣">
        <SelectField
          label="Marca para el material"
          value={selectedMarca}
          onChange={setSelectedMarca}
          options={marcasDisponibles.map(m => ({ value: m, label: m }))}
          placeholder="Seleccione marca..."
        />
        <div className="mt-4 space-y-3">
          {TIPOS_MATERIAL_POP.map(({ key, label, icon }) => {
            const item = items.find(i => i.tipo_material === key);
            const active = !!item;
            return (
              <div
                key={key}
                className={`border rounded-2xl transition-all ${active ? 'border-blue-200 bg-blue-50' : 'border-slate-100 bg-slate-50'}`}
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => handleToggle(key, selectedMarca)}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${active ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}`}>
                    {active && <span className="text-[9px] font-black">✓</span>}
                  </div>
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-bold text-slate-700 flex-1">{label}</span>
                </div>

                {active && (
                  <div className="px-4 pb-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={e => handleField(key, 'cantidad', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Observación</label>
                      <input
                        type="text"
                        value={item.observacion}
                        onChange={e => handleField(key, 'observacion', e.target.value)}
                        placeholder="Notas..."
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-xl text-sm font-medium outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardSection>
    </div>
  );
}

/** PASO 4: Plan de Asesoría */
function Step4Asesoria({ items, onUpdate }) {
  const getItem = (tipo) => items.find(i => i.tipo_asesoria === tipo);

  const handleToggle = (tipo) => {
    const existing = getItem(tipo);
    if (existing) {
      onUpdate(items.filter(i => i.tipo_asesoria !== tipo));
    } else {
      onUpdate([...items, { tipo_asesoria: tipo, frecuencia: 'Semanal', duracion_horas: 1, descripcion: '' }]);
    }
  };

  const handleField = (tipo, field, value) => {
    onUpdate(items.map(i => i.tipo_asesoria === tipo ? { ...i, [field]: value } : i));
  };

  return (
    <div className="space-y-4">
      <CardSection title="Plan de Asesoría y Capacitación" icon="🎓">
        <p className="text-[10px] text-slate-400 font-medium mb-4">Seleccione los tipos de asesoría que brindará al cliente y defina la frecuencia y duración.</p>
        <div className="space-y-4">
          {TIPOS_ASESORIA.map(({ key, label, icon, descripcion }) => {
            const item = getItem(key);
            const active = !!item;
            return (
              <div
                key={key}
                className={`border rounded-2xl transition-all ${active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 bg-slate-50'}`}
              >
                <div
                  className="flex items-start gap-3 p-4 cursor-pointer"
                  onClick={() => handleToggle(key)}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                    ${active ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                    {active && <span className="text-[9px] font-black">✓</span>}
                  </div>
                  <span className="text-xl flex-shrink-0">{icon}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{label}</p>
                    <p className="text-[9px] text-slate-400 font-medium leading-relaxed">{descripcion}</p>
                  </div>
                </div>

                {active && (
                  <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SelectField
                      label="Frecuencia"
                      value={item.frecuencia}
                      onChange={v => handleField(key, 'frecuencia', v)}
                      options={FRECUENCIAS.map(f => ({ value: f, label: f }))}
                    />
                    <SelectField
                      label="Duración por sesión (horas)"
                      value={item.duracion_horas}
                      onChange={v => handleField(key, 'duracion_horas', parseFloat(v))}
                      options={DURACIONES.map(d => ({ value: d, label: `${d} hora${d !== 1 ? 's' : ''}` }))}
                    />
                    <div className="sm:col-span-2">
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Descripción de la Actividad</label>
                      <textarea
                        value={item.descripcion}
                        onChange={e => handleField(key, 'descripcion', e.target.value)}
                        placeholder="Describa qué hará durante esta asesoría..."
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-emerald-300 h-20 resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardSection>
    </div>
  );
}

/** PASO 5: Condiciones Comerciales */
function Step5Condiciones({ data, onChange, descuentosConfig, diasConfig }) {
  // Combos dinámicos: del 1 al 60 para días, desc. desde Supabase o fallback
  const diasOptions = diasConfig.length > 0
    ? diasConfig.filter(d => d.activo).map(d => ({ value: d.dias, label: `${d.dias} día${d.dias !== 1 ? 's' : ''}` }))
    : Array.from({ length: 60 }, (_, i) => ({ value: i + 1, label: `${i + 1} día${i + 1 !== 1 ? 's' : ''}` }));

  const descOptions = descuentosConfig.length > 0
    ? descuentosConfig.filter(d => d.activo).map(d => ({ value: d.porcentaje, label: `${d.porcentaje}% — ${d.descripcion || ''}` }))
    : [2, 3, 5, 7, 10].map(p => ({ value: p, label: `${p}%` }));

  return (
    <div className="space-y-4">
      <CardSection title="Descuentos Adicionales" icon="🏷️">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Descuento Seleccionado"
            value={data.descuento_seleccionado}
            onChange={v => onChange('descuento_seleccionado', v)}
            options={descOptions}
            placeholder="Seleccione descuento..."
          />
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Propuesta Alternativa de Descuento</label>
            <textarea
              value={data.propuesta_descuento}
              onChange={e => onChange('propuesta_descuento', e.target.value)}
              placeholder="Escriba aquí una propuesta de descuento especial o justificación..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-blue-200 h-20 resize-none"
            />
          </div>
        </div>
      </CardSection>

      <CardSection title="Días de Crédito Adicionales" icon="📅">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Días de Crédito"
            value={data.dias_credito_seleccionados}
            onChange={v => onChange('dias_credito_seleccionados', parseInt(v))}
            options={diasOptions}
            placeholder="Seleccione días..."
          />
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Propuesta Alternativa de Días</label>
            <textarea
              value={data.propuesta_dias_credito}
              onChange={e => onChange('propuesta_dias_credito', e.target.value)}
              placeholder="Escriba aquí una propuesta de plazo especial o justificación..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-blue-200 h-20 resize-none"
            />
          </div>
        </div>
      </CardSection>

      <CardSection title="Observaciones Generales" icon="📝">
        <textarea
          value={data.observaciones}
          onChange={e => onChange('observaciones', e.target.value)}
          placeholder="Notas adicionales sobre las condiciones comerciales de este plan..."
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-1 focus:ring-blue-200 h-24 resize-none"
        />
      </CardSection>
    </div>
  );
}

/** PASO 6: Resumen Final */
function Step6Resumen({ encabezado, marcasClientes, pedido, marketing, asesoria, condiciones, empresa }) {
  const [open, setOpen] = useState({ marcas: true, pedido: false, marketing: false, asesoria: false, condiciones: false });
  const toggle = (k) => setOpen(p => ({ ...p, [k]: !p[k] }));

  const SectionToggle = ({ id, label, icon, count, children }) => (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-all text-left"
      >
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{label}</span>
          <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full">{count}</span>
        </div>
        <span className="text-slate-400 text-sm">{open[id] ? '▲' : '▼'}</span>
      </button>
      {open[id] && <div className="p-4 bg-white">{children}</div>}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6 mb-2">
        <h2 className="text-lg font-black uppercase tracking-tight">{encabezado.nombre_plan || 'Plan Sin Nombre'}</h2>
        <p className="text-blue-100 text-[10px] font-bold mt-1">{empresa} · {encabezado.fecha_inicio} → {encabezado.fecha_fin}</p>
      </div>

      <SectionToggle id="marcas" label="Marcas y Clientes" icon="🎯" count={marcasClientes.length}>
        {marcasClientes.map((mc, i) => (
          <div key={i} className="flex gap-2 text-sm py-1 border-b border-slate-50 last:border-0">
            <span className="bg-blue-100 text-blue-700 text-[8px] font-black px-2 py-0.5 rounded-full h-fit">{mc.marca}</span>
            <span className="text-slate-700 font-medium">{mc.cliente_nombre}</span>
          </div>
        ))}
      </SectionToggle>

      <SectionToggle id="pedido" label="Pedido Propuesto" icon="🛒" count={pedido.length}>
        {pedido.map((p, i) => (
          <div key={i} className="flex justify-between text-[10px] py-1 border-b border-slate-50 last:border-0">
            <span className="text-slate-700 font-medium truncate mr-2">{p.nombre_articulo}</span>
            <span className="font-black text-blue-600 flex-shrink-0">× {p.cantidad_propuesta}</span>
          </div>
        ))}
      </SectionToggle>

      <SectionToggle id="marketing" label="Marketing POP" icon="📣" count={marketing.length}>
        {marketing.map((m, i) => (
          <div key={i} className="flex justify-between text-[10px] py-1 border-b border-slate-50 last:border-0">
            <span className="text-slate-700 font-medium">{m.tipo_material}</span>
            <span className="font-black text-slate-600">× {m.cantidad}</span>
          </div>
        ))}
      </SectionToggle>

      <SectionToggle id="asesoria" label="Plan de Asesoría" icon="🎓" count={asesoria.length}>
        {asesoria.map((a, i) => (
          <div key={i} className="mb-2 p-3 bg-emerald-50 rounded-xl text-[10px]">
            <p className="font-black text-slate-800">{a.tipo_asesoria}</p>
            <p className="text-slate-500">{a.frecuencia} · {a.duracion_horas}h por sesión</p>
            {a.descripcion && <p className="text-slate-600 mt-1 italic">{a.descripcion}</p>}
          </div>
        ))}
      </SectionToggle>

      <SectionToggle id="condiciones" label="Condiciones Comerciales" icon="🏷️" count={2}>
        <div className="grid grid-cols-2 gap-3 text-[10px]">
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-slate-400 font-black uppercase tracking-widest mb-1">Descuento</p>
            <p className="text-lg font-black text-blue-600">{condiciones.descuento_seleccionado || 0}%</p>
            {condiciones.propuesta_descuento && <p className="text-slate-500 mt-1 italic">{condiciones.propuesta_descuento}</p>}
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <p className="text-slate-400 font-black uppercase tracking-widest mb-1">Crédito</p>
            <p className="text-lg font-black text-emerald-600">{condiciones.dias_credito_seleccionados || 0} días</p>
            {condiciones.propuesta_dias_credito && <p className="text-slate-500 mt-1 italic">{condiciones.propuesta_dias_credito}</p>}
          </div>
        </div>
      </SectionToggle>
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function PlanFocalizadoWizard({ userSession, empresa, onClose }) {
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [descuentosConfig, setDescuentosConfig] = useState([]);
  const [diasConfig, setDiasConfig] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  // ─── Estado del plan ────
  const [encabezado, setEncabezado] = useState({
    nombre_plan: '',
    fecha_plan: new Date().toISOString().split('T')[0],
    fecha_inicio: '',
    fecha_fin: '',
  });
  const [marcasClientes, setMarcasClientes] = useState([]);
  const [pedido, setPedido] = useState([]);
  const [marketing, setMarketing] = useState([]);
  const [asesoria, setAsesoria] = useState([]);
  const [condiciones, setCondiciones] = useState({
    descuento_seleccionado: '',
    propuesta_descuento: '',
    dias_credito_seleccionados: '',
    propuesta_dias_credito: '',
    observaciones: '',
  });

  // Mis planes guardados
  const [misPlanes, setMisPlanes] = useState([]);
  const [showMisPlanes, setShowMisPlanes] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      const { data: descs } = await supabase.schema('portal_afv').from('pf_config_descuentos')
        .select('*').eq('empresa', empresa).eq('activo', true).order('porcentaje');
      setDescuentosConfig(descs || []);

      const { data: dias } = await supabase.schema('portal_afv').from('pf_config_dias_credito')
        .select('*').eq('empresa', empresa).eq('activo', true).order('dias');
      setDiasConfig(dias || []);
    };
    loadConfig();
    fetchMisPlanes();
  }, [empresa, userSession]);

  const handleLoadPlan = async (id) => {
    try {
      setSavedMessage('⏳ Cargando plan...');
      
      const { data: plan } = await supabase.schema('portal_afv').from('planes_focalizados').select('*').eq('id', id).single();
      const { data: mc } = await supabase.schema('portal_afv').from('pf_marcas_clientes').select('*').eq('id_plan', id);
      const { data: ped } = await supabase.schema('portal_afv').from('pf_pedido_propuesto').select('*').eq('id_plan', id);
      const { data: mkt } = await supabase.schema('portal_afv').from('pf_marketing').select('*').eq('id_plan', id);
      const { data: as } = await supabase.schema('portal_afv').from('pf_asesoria').select('*').eq('id_plan', id);
      const { data: cond } = await supabase.schema('portal_afv').from('pf_condiciones').select('*').eq('id_plan', id).single();

      setCurrentPlanId(id);
      
      setEncabezado({ 
        nombre_plan: plan.nombre_plan || '', 
        fecha_plan: plan.fecha_plan || '', 
        fecha_inicio: plan.fecha_inicio || '', 
        fecha_fin: plan.fecha_fin || '' 
      });
      
      setMarcasClientes((mc || []).map(m => ({ marca: m.marca, cliente_nombre: m.cliente_nombre })));
      
      setPedido((ped || []).map(p => {
         const m = (mc || []).find(m => m.id === p.id_marca_cliente);
         return {
           _key: `${p.codigo_articulo}|${m?.marca}|${m?.cliente_nombre}`,
           marca: m?.marca,
           cliente_nombre: m?.cliente_nombre,
           codigo_articulo: p.codigo_articulo,
           nombre_articulo: p.nombre_articulo,
           cantidad_propuesta: p.cantidad_propuesta
         }
      }));
      
      setMarketing((mkt || []).map(m => ({
        tipo_material: m.tipo_material,
        marca: m.marca,
        cantidad: m.cantidad,
        observacion: m.observacion || ''
      })));

      setAsesoria((as || []).map(a => ({
        tipo_asesoria: a.tipo_asesoria,
        frecuencia: a.frecuencia,
        duracion_horas: a.duracion_horas,
        descripcion: a.descripcion || ''
      })));
      
      if (cond) {
        setCondiciones({
          descuento_seleccionado: cond.descuento_seleccionado || '',
          propuesta_descuento: cond.propuesta_descuento || '',
          dias_credito_seleccionados: cond.dias_credito_seleccionados || '',
          propuesta_dias_credito: cond.propuesta_dias_credito || '',
          observaciones: cond.observaciones || ''
        });
      }
      
      setStep(6); // Resumen
      setShowMisPlanes(false);
      setSavedMessage('✅ Plan cargado');
    } catch (e) {
      console.error(e);
      setSavedMessage('❌ Error al cargar el plan');
    }
  };

  const fetchMisPlanes = async () => {
    if (!userSession?.id) return;
    const { data } = await supabase.schema('portal_afv').from('planes_focalizados')
      .select('*').eq('id_asesor', userSession.id).order('created_at', { ascending: false });
    setMisPlanes(data || []);
  };

  // ─── Handlers ────
  const handleEncabezado = (field, value) => setEncabezado(p => ({ ...p, [field]: value }));
  const handleCondiciones = (field, value) => setCondiciones(p => ({ ...p, [field]: value }));

  const handleTogglePedido = (item) => {
    setPedido(prev => {
      const exists = prev.find(p => p._key === item._key);
      if (exists) return prev.filter(p => p._key !== item._key);
      return [...prev, item];
    });
  };
  const handleCantidadPedido = (key, cantidad) => {
    setPedido(prev => prev.map(p => p._key === key ? { ...p, cantidad_propuesta: cantidad } : p));
  };

  // ─── Guardar en Supabase ────
  const handleSave = async () => {
    if (!encabezado.nombre_plan) {
      setSavedMessage('⚠️ El nombre del plan es obligatorio.');
      return;
    }
    setIsSaving(true);
    setSavedMessage('Guardando...');
    try {
      let planId = currentPlanId;

      if (planId) {
        // Update header
        const { error: updErr } = await supabase.schema('portal_afv').from('planes_focalizados').update({ ...encabezado, estado: 'activo' }).eq('id', planId);
        if (updErr) throw updErr;

        // Delete children to replace
        await supabase.schema('portal_afv').from('pf_marcas_clientes').delete().eq('id_plan', planId);
        // Nota: pf_pedido_propuesto se elimina en cascada al eliminar pf_marcas_clientes
        await supabase.schema('portal_afv').from('pf_marketing').delete().eq('id_plan', planId);
        await supabase.schema('portal_afv').from('pf_asesoria').delete().eq('id_plan', planId);
        await supabase.schema('portal_afv').from('pf_condiciones').delete().eq('id_plan', planId);
      } else {
        // 1. Insertar plan
        const { data: planData, error: planErr } = await supabase.schema('portal_afv')
          .from('planes_focalizados')
          .insert([{ ...encabezado, id_asesor: userSession.id, empresa, estado: 'activo' }])
          .select().single();
        if (planErr) throw planErr;
        planId = planData.id;
        setCurrentPlanId(planId);
      }

      // 2. Marcas × Clientes
      if (marcasClientes.length > 0) {
        const mcToInsert = marcasClientes.map(mc => ({ 
           id_plan: planId,
           marca: mc.marca, 
           cliente_nombre: mc.cliente_nombre 
        }));

        const { data: mcData, error: mcErr } = await supabase.schema('portal_afv')
          .from('pf_marcas_clientes')
          .insert(mcToInsert)
          .select();
        if (mcErr) throw mcErr;

        // 3. Pedido propuesto (relacionado a marca-cliente)
        if (pedido.length > 0) {
          const pedidoRows = pedido.map(p => {
            const mc = mcData.find(mc => mc.marca === p.marca && mc.cliente_nombre === p.cliente_nombre);
            return {
              id_plan: planId,
              id_marca_cliente: mc?.id || null,
              codigo_articulo: p.codigo_articulo,
              nombre_articulo: p.nombre_articulo,
              cantidad_propuesta: p.cantidad_propuesta,
            };
          });
          const { error: pedErr } = await supabase.schema('portal_afv').from('pf_pedido_propuesto').insert(pedidoRows);
          if (pedErr) throw pedErr;
        }
      }

      // 4. Marketing
      if (marketing.length > 0) {
        const { error: mktErr } = await supabase.schema('portal_afv').from('pf_marketing')
          .insert(marketing.map(m => ({ ...m, id_plan: planId })));
        if (mktErr) throw mktErr;
      }

      // 5. Asesoría
      if (asesoria.length > 0) {
        const { error: asErr } = await supabase.schema('portal_afv').from('pf_asesoria')
          .insert(asesoria.map(a => ({ ...a, id_plan: planId })));
        if (asErr) throw asErr;
      }

      // 6. Condiciones
      const { error: condErr } = await supabase.schema('portal_afv').from('pf_condiciones')
        .insert([{ ...condiciones, id_plan: planId }]);
      if (condErr) throw condErr;

      setSavedMessage('✅ Plan guardado exitosamente en Supabase.');
      fetchMisPlanes();
    } catch (err) {
      setSavedMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Exportar Excel ────
  const handleExport = () => {
    const plan = {
      ...encabezado,
      empresa,
      marcasClientes,
      pedido,
      marketing,
      asesoria,
      condiciones,
    };
    exportPlanToExcel(plan, userSession?.nombre || 'Asesor');
  };

  // ─── Exportar PDF ────
  const handleExportPDF = () => {
    const plan = {
      ...encabezado,
      empresa,
      marcasClientes,
      pedido,
      marketing,
      asesoria,
      condiciones,
    };
    exportPlanToPDF(plan, userSession?.nombre || 'Asesor', empresa);
  };

  // ─── Validación por paso ────
  const canNext = () => {
    if (step === 0) return !!encabezado.nombre_plan;
    if (step === 1) return marcasClientes.length > 0;
    return true;
  };

  const totalSteps = STEP_LABELS.length;

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-50 w-full max-w-3xl h-full max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">📊</div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Plan Focalizado de Ventas</h2>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{empresa} · {userSession?.nombre}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowMisPlanes(!showMisPlanes); }}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              📁 Mis Planes ({misPlanes.length})
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
            >✕</button>
          </div>
        </div>

        {/* Panel "Mis Planes" */}
        {showMisPlanes && (
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 max-h-48 overflow-y-auto">
            <p className="text-[9px] font-black text-blue-700 uppercase tracking-widest mb-2">Mis Planes Guardados</p>
            {misPlanes.length === 0 ? (
              <p className="text-[10px] text-slate-400">No tienes planes guardados aún.</p>
            ) : misPlanes.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 mb-1 border border-blue-100">
                <div>
                  <p className="text-xs font-bold text-slate-800">{p.nombre_plan}</p>
                  <p className="text-[9px] text-slate-400">{p.fecha_plan} · <span className={`font-bold uppercase ${p.estado === 'activo' ? 'text-emerald-500' : p.estado === 'cerrado' ? 'text-red-400' : 'text-amber-500'}`}>{p.estado}</span></p>
                </div>
                <button
                  onClick={() => handleLoadPlan(p.id)}
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-200 transition-all"
                >
                  Abrir
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Step Indicator */}
        <div className="px-6 pt-4 bg-white border-b border-slate-100">
          <StepIndicator current={step} total={totalSteps} labels={STEP_LABELS} />
        </div>

        {/* Contenido del paso */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 0 && <Step0Encabezado data={encabezado} onChange={handleEncabezado} />}
          {step === 1 && <Step1MarcasClientes items={marcasClientes} onAdd={mc => setMarcasClientes(p => [...p, mc])} onRemove={i => setMarcasClientes(p => p.filter((_, idx) => idx !== i))} />}
          {step === 2 && <Step2Pedido marcasClientes={marcasClientes} pedido={pedido} onToggle={handleTogglePedido} onCantidad={handleCantidadPedido} />}
          {step === 3 && <Step3Marketing items={marketing} onUpdate={setMarketing} />}
          {step === 4 && <Step4Asesoria items={asesoria} onUpdate={setAsesoria} />}
          {step === 5 && <Step5Condiciones data={condiciones} onChange={handleCondiciones} descuentosConfig={descuentosConfig} diasConfig={diasConfig} />}
          {step === 6 && (
            <Step6Resumen
              encabezado={encabezado}
              marcasClientes={marcasClientes}
              pedido={pedido}
              marketing={marketing}
              asesoria={asesoria}
              condiciones={condiciones}
              empresa={empresa}
            />
          )}
        </div>

        {/* Footer de navegación */}
        <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep(p => Math.max(0, p - 1))}
            disabled={step === 0}
            className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-slate-200 transition-all"
          >
            ← Anterior
          </button>

          <div className="flex items-center gap-2 flex-1 justify-center">
            {savedMessage && (
              <span className={`text-[9px] font-black uppercase tracking-wide ${savedMessage.startsWith('✅') ? 'text-emerald-600' : savedMessage.startsWith('❌') || savedMessage.startsWith('⚠️') ? 'text-red-500' : 'text-blue-500 animate-pulse'}`}>
                {savedMessage}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {step === 6 && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all"
                >
                  {isSaving ? '⏳ Guardando...' : '💾 Guardar'}
                </button>
                <button
                  onClick={handleExport}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all"
                >
                  📥 Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all"
                >
                  📄 PDF
                </button>
              </>
            )}
            {step < 6 && (
              <button
                onClick={() => setStep(p => p + 1)}
                disabled={!canNext()}
                className="px-5 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-blue-700 transition-all"
              >
                Siguiente →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
