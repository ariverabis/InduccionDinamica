-- Forzar a que arivera@mayoreo.biz sea Administrador
UPDATE public.profiles
SET role = 'Administrador'
WHERE email = 'arivera@mayoreo.biz';
