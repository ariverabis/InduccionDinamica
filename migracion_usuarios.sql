-- Habilitar la extensión pgcrypto si no está habilitada (requerido para cifrar claves)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    r RECORD;
    new_user_id uuid;
    assigned_role text;
BEGIN
    FOR r IN SELECT * FROM portal_afv.usuarios LOOP
        
        -- Verificar que el usuario no exista ya en auth.users
        IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = r.usuario) THEN
            
            -- Si el ID en usuarios es uuid, tratamos de usarlo. Si falla o no lo es, generamos uno nuevo.
            -- Para evitar errores de tipo, generamos un UUID nuevo seguro para auth.users
            new_user_id := gen_random_uuid();
            
            -- Insertar en la tabla nativa y segura auth.users
            INSERT INTO auth.users (
                instance_id,
                id,
                aud,
                role,
                email,
                encrypted_password,
                email_confirmed_at,
                raw_app_meta_data,
                raw_user_meta_data,
                created_at,
                updated_at
            ) VALUES (
                '00000000-0000-0000-0000-000000000000',
                new_user_id,
                'authenticated',
                'authenticated',
                r.usuario,
                crypt('Mayoreo2026*', gen_salt('bf')), -- Contraseña por defecto para todos
                now(),
                '{"provider":"email","providers":["email"]}',
                jsonb_build_object('full_name', r.nombre),
                now(),
                now()
            );

            -- Determinar el rol para la nueva plataforma de evaluación
            IF r.rol = 'admin' THEN
                assigned_role := 'Administrador';
            ELSE
                -- Asignamos 'Supervisor' por defecto a los asesores/evaluadores, 
                -- luego puedes ajustarlo manualmente en la tabla profiles
                assigned_role := 'Supervisor'; 
            END IF;

            -- Insertar en nuestra tabla de perfiles (creada anteriormente)
            INSERT INTO public.profiles (id, email, role, full_name, created_at)
            VALUES (
                new_user_id,
                r.usuario,
                assigned_role,
                r.nombre,
                now()
            ) ON CONFLICT (id) DO NOTHING;

        END IF;
    END LOOP;
END $$;
