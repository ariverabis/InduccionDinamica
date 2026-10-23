-- ==============================================================================
-- Tabla para Indicadores Comerciales Mensuales por Asesor (KPIs en Calle)
-- Ejecutar en Supabase SQL Editor
-- ==============================================================================

CREATE TABLE IF NOT EXISTS portal_afv.kpis_mensuales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_asesor uuid NOT NULL REFERENCES portal_afv.usuarios(id) ON DELETE CASCADE,
  mes_numero integer NOT NULL CHECK (mes_numero >= 1 AND mes_numero <= 12),
  mes_nombre text NOT NULL,
  anio integer NOT NULL DEFAULT 2026,
  avaluo numeric(12,2) DEFAULT NULL,
  efectividad numeric(5,2) DEFAULT NULL,
  alcance_presupuesto numeric(5,2) DEFAULT NULL,
  observaciones text DEFAULT NULL,
  actualizado_por text DEFAULT 'admin',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(id_asesor, mes_numero, anio)
);

-- Habilitar RLS
ALTER TABLE portal_afv.kpis_mensuales ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso permisivas (iguales al resto de portal_afv)
DROP POLICY IF EXISTS "Permitir lectura kpis_mensuales" ON portal_afv.kpis_mensuales;
CREATE POLICY "Permitir lectura kpis_mensuales"
  ON portal_afv.kpis_mensuales FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir insercion kpis_mensuales" ON portal_afv.kpis_mensuales;
CREATE POLICY "Permitir insercion kpis_mensuales"
  ON portal_afv.kpis_mensuales FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir actualizacion kpis_mensuales" ON portal_afv.kpis_mensuales;
CREATE POLICY "Permitir actualizacion kpis_mensuales"
  ON portal_afv.kpis_mensuales FOR UPDATE
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir eliminacion kpis_mensuales" ON portal_afv.kpis_mensuales;
CREATE POLICY "Permitir eliminacion kpis_mensuales"
  ON portal_afv.kpis_mensuales FOR DELETE
  USING (true);
