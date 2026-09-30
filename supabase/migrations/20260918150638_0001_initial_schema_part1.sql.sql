/*
# Initial Schema Part 1: Roles, Profiles, Helper Functions
Creates the foundational auth-related tables and helper functions first.
*/

-- updated_at trigger function (no dependencies)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id integer PRIMARY KEY,
  name text UNIQUE NOT NULL,
  description text
);

INSERT INTO public.roles (id, name, description) VALUES
  (1, 'user', 'Standard registered user'),
  (2, 'contributor', 'Verified contributor with elevated posting privileges'),
  (3, 'moderator', 'Can moderate content and handle reports'),
  (4, 'admin', 'Full administrative access'),
  (5, 'super_admin', 'Full access including role management')
ON CONFLICT (id) DO NOTHING;

-- User Roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id integer NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, role_id)
);

-- Role helper functions (created before any policy uses them)
CREATE OR REPLACE FUNCTION public.has_role(_role_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid() AND r.name = _role_name
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role('admin') OR public.has_role('super_admin');
$$;

-- Now enable RLS and policies on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read_own_roles" ON public.user_roles;
CREATE POLICY "read_own_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_read_all_roles" ON public.user_roles;
CREATE POLICY "admin_read_all_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  avatar_url text,
  bio text,
  country text,
  is_verified_contributor boolean DEFAULT false,
  is_suspended boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "profile_self_insert" ON public.profiles;
CREATE POLICY "profile_self_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profile_self_update" ON public.profiles;
CREATE POLICY "profile_self_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "admin_update_profile" ON public.profiles;
CREATE POLICY "admin_update_profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username text;
  final_username text;
  counter integer := 0;
BEGIN
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), '[^a-z0-9_]', '', 'g'));
  final_username := base_username;
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) THEN
      EXIT;
    END IF;
    counter := counter + 1;
    final_username := base_username || '_' || counter::text;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, avatar_url, bio, country)
  VALUES (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'display_name', final_username),
    new.raw_user_meta_data->>'avatar_url',
    '',
    ''
  );

  INSERT INTO public.user_roles (user_id, role_id) VALUES (new.id, 1);
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();