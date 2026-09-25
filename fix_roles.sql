-- 1. Eliminar la restricción actual
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Volver a crearla incluyendo 'Asesor'
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('Administrador', 'Desarrollo', 'Supervisor', 'Auditoria', 'Credito_Cobranza', 'Admin_Ventas', 'Asesor'));

-- 3. Ahora sí, sincronizar los roles
UPDATE public.profiles p
SET role = (
    SELECT 
      CASE 
        WHEN u.rol = 'admin' THEN 'Administrador'
        WHEN u.rol = 'evaluador' THEN 'Desarrollo'
        ELSE 'Asesor' 
      END
    FROM portal_afv.usuarios u 
    WHERE u.usuario = p.email
);
