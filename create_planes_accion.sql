-- ==============================================================================
-- Tabla para Planes de Acción y Compromisos de Mejora por Indicador
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.planes_accion_asesor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advisor_id uuid NOT NULL,
  advisor_name text,
  month_number integer NOT NULL,
  department text NOT NULL,
  criterion_id text NOT NULL,
  criterion_label text NOT NULL,
  compromiso text NOT NULL,
  fecha_limite date,
  responsable text,
  estado text DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Progreso', 'Cumplido', 'Vencido')),
  observaciones_cierre text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS y políticas permisivas para evaluadores autenticados
ALTER TABLE public.planes_accion_asesor ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Planes accion viewable by everyone" ON public.planes_accion_asesor;
CREATE POLICY "Planes accion viewable by everyone" 
  ON public.planes_accion_asesor FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Planes accion insertable by authenticated" ON public.planes_accion_asesor;
CREATE POLICY "Planes accion insertable by authenticated" 
  ON public.planes_accion_asesor FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Planes accion updatable by authenticated" ON public.planes_accion_asesor;
CREATE POLICY "Planes accion updatable by authenticated" 
  ON public.planes_accion_asesor FOR UPDATE 
  USING (true);

DROP POLICY IF EXISTS "Planes accion deletable by authenticated" ON public.planes_accion_asesor;
CREATE POLICY "Planes accion deletable by authenticated" 
  ON public.planes_accion_asesor FOR DELETE 
  USING (true);
