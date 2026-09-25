-- Create a table for user profiles and roles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('Administrador', 'Desarrollo', 'Supervisor', 'Auditoria', 'Credito_Cobranza', 'Admin_Ventas')),
  full_name text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- Create a table for evaluations
CREATE TABLE IF NOT EXISTS public.evaluations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id uuid NOT NULL, -- references an advisor from an advisors table (or profiles if advisors are users)
  advisor_name text NOT NULL,
  month_number integer NOT NULL CHECK (month_number >= 1 AND month_number <= 6),
  department text NOT NULL CHECK (department IN ('Desarrollo', 'Supervisor', 'Auditoria', 'Credito_Cobranza', 'Admin_Ventas', 'Autoevaluacion')),
  scores jsonb NOT NULL, -- To store { "1.1": 4, "1.2": 5, ... }
  comments text,
  average_score numeric(3,2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  evaluator_id uuid REFERENCES auth.users,
  UNIQUE(advisor_id, month_number, department)
);

-- Enable RLS for evaluations
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Evaluations Policies
CREATE POLICY "Evaluations are viewable by everyone authenticated"
  ON public.evaluations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert evaluations for their department"
  ON public.evaluations FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Admins can insert any, or the user role matches the department
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'Administrador' OR profiles.role = department)
    )
  );

CREATE POLICY "Users can update evaluations for their department"
  ON public.evaluations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'Administrador' OR profiles.role = department)
    )
  );
