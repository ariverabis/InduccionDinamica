
-- Añadir columna de visibilidad a los submódulos
ALTER TABLE portal_afv.submodulos_finales 
ADD COLUMN IF NOT EXISTS es_interno BOOLEAN DEFAULT false;

-- Comentario para documentación
COMMENT ON COLUMN portal_afv.submodulos_finales.es_interno IS 'Indica si el tema es solo para evaluación del tutor y no debe ser visto por el asesor';
