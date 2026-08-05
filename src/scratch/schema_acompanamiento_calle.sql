-- Script SQL para la creación de tablas de Acompañamiento en Calle

-- 1. Tabla de Buddies (Acompañantes / Facilitadores)
CREATE TABLE IF NOT EXISTS buddies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    cedula TEXT,
    casa_comercial TEXT DEFAULT 'Febeca', -- Febeca, Sillaca, Beval
    cargo TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla Maestro de Actividades / Temas a Evaluar en Calle
CREATE TABLE IF NOT EXISTS actividades_calle (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    categoria TEXT NOT NULL, -- ej: '1. DOMINIO TÉCNICO Y ECOSISTEMA DIGITAL (AFV/SDS)'
    titulo TEXT NOT NULL, -- ej: 'Sincronización Inicial'
    descripcion TEXT NOT NULL, -- ej: '¿Inicia la jornada ejecutando el SDS y valida que el log muestre Finalizado al 100%?'
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla de Asignaciones de Calle a Asesores
CREATE TABLE IF NOT EXISTS asignaciones_calle (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asesor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    buddy_id UUID REFERENCES buddies(id) ON DELETE SET NULL,
    actividades_ids JSONB DEFAULT '[]'::jsonb, -- IDs de actividades seleccionadas para evaluar
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'completado'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla de Reportes de Acompañamiento en Calle
CREATE TABLE IF NOT EXISTS reportes_acompanamiento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asignacion_id UUID REFERENCES asignaciones_calle(id) ON DELETE SET NULL,
    asesor_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    buddy_id UUID REFERENCES buddies(id) ON DELETE SET NULL,
    
    -- Datos Encabezado
    nombre_asesor TEXT NOT NULL,
    cedula_asesor TEXT,
    zona_region TEXT,
    nombre_buddy TEXT NOT NULL,
    casa_comercial TEXT,
    fecha_acompanamiento TEXT,

    -- Evaluación y Notas (JSON por categoria / actividad)
    evaluacion_items JSONB NOT NULL DEFAULT '{}'::jsonb, 

    -- Apreciación Final
    fortalezas_detectadas TEXT,
    areas_mejora_inmediata TEXT,
    recomendacion_final TEXT, -- 'AUTONOMIA', 'MAS_ACOMPANAMIENTO', 'INTERVENCION_GERENCIAL'

    -- Firmas opcionales
    firma_buddy_nombre TEXT,
    firma_gerente_nombre TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
