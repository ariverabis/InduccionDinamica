
-- Asegurar todas las columnas necesarias para la nueva organización
ALTER TABLE portal_afv.submodulos_finales 
ADD COLUMN IF NOT EXISTS area_tecnica TEXT,
ADD COLUMN IF NOT EXISTS duracion_horas TEXT,
ADD COLUMN IF NOT EXISTS es_interno BOOLEAN DEFAULT false;

COMMENT ON COLUMN portal_afv.submodulos_finales.area_tecnica IS 'Clasificación interna (Ventas, Cobranza, etc.)';
