-- =====================================================
-- Plan Focalizado de Ventas
-- Tablas en schema portal_afv — ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Plan (encabezado) — un plan puede tener múltiples marcas y clientes
CREATE TABLE IF NOT EXISTS portal_afv.planes_focalizados (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_asesor      uuid REFERENCES portal_afv.usuarios(id) ON DELETE CASCADE,
  empresa        text NOT NULL,
  nombre_plan    text NOT NULL,
  fecha_plan     date DEFAULT CURRENT_DATE,
  fecha_inicio   date,
  fecha_fin      date,
  estado         text DEFAULT 'borrador' CHECK (estado IN ('borrador','activo','cerrado')),
  created_at     timestamptz DEFAULT now()
);

-- 2. Marcas × Clientes dentro del plan
CREATE TABLE IF NOT EXISTS portal_afv.pf_marcas_clientes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_plan        uuid REFERENCES portal_afv.planes_focalizados(id) ON DELETE CASCADE,
  marca          text NOT NULL,
  cliente_nombre text NOT NULL
);

-- 3. Artículos del pedido propuesto (por marca-cliente)
CREATE TABLE IF NOT EXISTS portal_afv.pf_pedido_propuesto (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_plan             uuid REFERENCES portal_afv.planes_focalizados(id) ON DELETE CASCADE,
  id_marca_cliente    uuid REFERENCES portal_afv.pf_marcas_clientes(id) ON DELETE CASCADE,
  codigo_articulo     text,
  nombre_articulo     text,
  cantidad_propuesta  integer DEFAULT 1
);

-- 4. Material POP / Marketing
CREATE TABLE IF NOT EXISTS portal_afv.pf_marketing (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_plan        uuid REFERENCES portal_afv.planes_focalizados(id) ON DELETE CASCADE,
  marca          text,
  tipo_material  text,    -- Exhibidor, Banderín, Material POP, Gorra, Franela, Otro
  cantidad       integer DEFAULT 0,
  observacion    text
);

-- 5. Plan de Asesoría
CREATE TABLE IF NOT EXISTS portal_afv.pf_asesoria (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_plan         uuid REFERENCES portal_afv.planes_focalizados(id) ON DELETE CASCADE,
  tipo_asesoria   text,    -- 'Fuerza de ventas cliente' | 'Piso de ventas' | 'Clientes finales'
  frecuencia      text,    -- 'Semanal' | 'Quincenal' | 'Mensual'
  duracion_horas  numeric(4,1),
  descripcion     text
);

-- 6. Condiciones Comerciales (descuentos + crédito)
CREATE TABLE IF NOT EXISTS portal_afv.pf_condiciones (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  id_plan                  uuid REFERENCES portal_afv.planes_focalizados(id) ON DELETE CASCADE,
  descuento_seleccionado   numeric(5,2) DEFAULT 0,
  propuesta_descuento      text,   -- campo libre del asesor para proponer alternativa
  dias_credito_seleccionados integer DEFAULT 0,
  propuesta_dias_credito   text,   -- campo libre del asesor para proponer alternativa
  observaciones            text
);

-- 7. Catálogo de Descuentos (configurable por Admin)
CREATE TABLE IF NOT EXISTS portal_afv.pf_config_descuentos (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa     text NOT NULL,
  porcentaje  numeric(5,2) NOT NULL,
  descripcion text,
  activo      boolean DEFAULT true,
  created_at  timestamptz DEFAULT now()
);

-- 8. Catálogo de Días de Crédito (configurable por Admin, del 1 al 60)
CREATE TABLE IF NOT EXISTS portal_afv.pf_config_dias_credito (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa    text NOT NULL,
  dias       integer NOT NULL CHECK (dias BETWEEN 1 AND 60),
  activo     boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- RLS: permitir acceso con anon key (igual que el resto del portal)
-- =====================================================
ALTER TABLE portal_afv.planes_focalizados    ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_afv.pf_marcas_clientes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_afv.pf_pedido_propuesto   ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_afv.pf_marketing          ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_afv.pf_asesoria           ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_afv.pf_condiciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_afv.pf_config_descuentos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_afv.pf_config_dias_credito ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all pf planes"      ON portal_afv.planes_focalizados     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all pf marcas"      ON portal_afv.pf_marcas_clientes     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all pf pedido"      ON portal_afv.pf_pedido_propuesto    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all pf marketing"   ON portal_afv.pf_marketing           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all pf asesoria"    ON portal_afv.pf_asesoria            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all pf condiciones" ON portal_afv.pf_condiciones         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all pf cfg desc"    ON portal_afv.pf_config_descuentos   FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all pf cfg dias"    ON portal_afv.pf_config_dias_credito FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- Datos iniciales del catálogo de Descuentos (todas las empresas)
-- =====================================================
INSERT INTO portal_afv.pf_config_descuentos (empresa, porcentaje, descripcion) VALUES
  ('Febeca',           2.00, 'Descuento mínimo'),
  ('Febeca',           3.00, 'Descuento estándar'),
  ('Febeca',           5.00, 'Descuento especial'),
  ('Febeca',           7.00, 'Descuento por volumen'),
  ('Febeca',          10.00, 'Descuento máximo autorizado'),
  ('Beval',            2.00, 'Descuento mínimo'),
  ('Beval',            3.00, 'Descuento estándar'),
  ('Beval',            5.00, 'Descuento especial'),
  ('Sillaca',          2.00, 'Descuento mínimo'),
  ('Sillaca',          5.00, 'Descuento estándar'),
  ('Cofersa',          2.00, 'Descuento mínimo'),
  ('Cofersa',          5.00, 'Descuento estándar'),
  ('Mundial de Partes', 2.00,'Descuento mínimo'),
  ('Mundial de Partes', 5.00,'Descuento estándar')
ON CONFLICT DO NOTHING;

-- =====================================================
-- Datos iniciales del catálogo de Días de Crédito
-- Se pre-cargan los valores más comunes (1-60)
-- El admin puede activar/desactivar con el campo activo
-- =====================================================
INSERT INTO portal_afv.pf_config_dias_credito (empresa, dias, activo)
SELECT e.nombre, d.dias, (d.dias IN (7, 15, 30, 45, 60)) AS activo
FROM
  (SELECT unnest(ARRAY['Febeca','Beval','Sillaca','Cofersa','Mundial de Partes']) AS nombre) e,
  (SELECT generate_series(1, 60) AS dias) d
ON CONFLICT DO NOTHING;
