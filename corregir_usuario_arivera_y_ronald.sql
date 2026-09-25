-- ==============================================================================
-- CORRECCIÓN: Separar a Alvaro Rivera de Ronald Saúl Acosta Bello
-- ==============================================================================
-- Causa: En portal_afv.usuarios, Ronald Saúl Acosta Bello tenía asignado por error
-- el usuario 'arivera@mayoreo.biz', mientras que Alvaro Rivera tenía usuario 'arivera'.
-- ==============================================================================

-- 1. Corregir portal_afv.usuarios
-- Asignar el correo corporativo correcto a Ronald Acosta
UPDATE portal_afv.usuarios
SET usuario = 'racosta@sillaca.biz'
WHERE id = '8d2f12bc-480b-45c9-a5d5-85f4f4cab720';

-- Asignar a Alvaro Rivera su usuario y rol de Administrador
UPDATE portal_afv.usuarios
SET usuario = 'arivera@mayoreo.biz',
    nombre = 'Alvaro Rivera',
    rol = 'admin'
WHERE id = '43a541ed-17aa-47a1-8f45-0dfbeb1e112f';

-- 2. Corregir public.profiles para Alvaro Rivera
UPDATE public.profiles
SET full_name = 'Alvaro Rivera',
    role = 'Administrador'
WHERE email = 'arivera@mayoreo.biz';

-- 3. Corregir auth.users (metadatos) para Alvaro Rivera
UPDATE auth.users
SET raw_user_meta_data = jsonb_build_object('full_name', 'Alvaro Rivera')
WHERE email = 'arivera@mayoreo.biz';

-- 4. Crear el usuario en auth.users y profiles para Ronald Acosta si no existe
DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'racosta@sillaca.biz') THEN
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
            'racosta@sillaca.biz',
            crypt('Mayoreo2026*', gen_salt('bf')),
            now(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('full_name', 'Ronald Saúl Acosta Bello'),
            now(),
            now()
        );

        INSERT INTO auth.identities (
            id,
            provider_id,
            user_id,
            identity_data,
            provider,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            new_user_id::text,
            new_user_id,
            jsonb_build_object('sub', new_user_id, 'email', 'racosta@sillaca.biz', 'email_verified', true),
            'email',
            now(),
            now()
        );

        INSERT INTO public.profiles (id, email, role, full_name, created_at)
        VALUES (
            new_user_id,
            'racosta@sillaca.biz',
            'Asesor',
            'Ronald Saúl Acosta Bello',
            now()
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
