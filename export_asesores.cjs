const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const s = createClient(
  'https://rreqcrmdyrgevdugzurx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJyZXFjcm1keXJnZXZkdWd6dXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDIxNTcsImV4cCI6MjA4ODYxODE1N30.4OIG_NMwzCmkhgFJlf69dMP7S276wa7wezzEg4gPWOY'
);

async function main() {
  const { data, error } = await s
    .schema('portal_afv')
    .from('usuarios')
    .select('nombre, empresa, correo, correo_corporativo, telefono, zona, ramo, estado, fecha_ingreso')
    .eq('rol', 'asesor')
    .order('created_at', { ascending: false });

  if (error) { console.error(error); return; }

  const headers = ['Nombre', 'Empresa', 'Correo Personal', 'Correo Corporativo', 'Teléfono', 'Zona', 'Ramo', 'Estado', 'Fecha Ingreso'];

  const escape = (v) => {
    if (v == null) return '';
    const str = String(v).replace(/"/g, '""').trim();
    return `"${str}"`;
  };

  const rows = data.map(r => [
    escape(r.nombre),
    escape(r.empresa),
    escape(r.correo),
    escape(r.correo_corporativo),
    escape(r.telefono),
    escape(r.zona),
    escape(r.ramo),
    escape(r.estado),
    escape(r.fecha_ingreso),
  ].join(';'));

  // BOM para que Excel abra bien los acentos
  const csv = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');

  const outPath = path.join(__dirname, 'asesores_export.csv');
  fs.writeFileSync(outPath, csv, 'utf8');
  console.log('Archivo generado:', outPath);
}

main();
