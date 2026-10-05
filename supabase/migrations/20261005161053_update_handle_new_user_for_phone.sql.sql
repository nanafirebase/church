/*
# Update handle_new_user trigger for phone auth support

1. Changes
- Replaces the `handle_new_user()` trigger function so it gracefully handles
  users who sign up with a phone number instead of an email.
- When no email is present, the username base is derived from the phone number
  (digits only) instead of `split_part(email, '@', 1)`.
- When no display name is provided, falls back to the phone number or
  a generated username.
- The trigger itself (`on_auth_user_created`) is not recreated — only the
  function body is replaced, which the existing trigger picks up automatically.
2. Security
- No policy or RLS changes. Function remains SECURITY DEFINER with
  search_path = public. EXECUTE was already revoked from PUBLIC/anon/authenticated
  in a prior migration.
*/

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base text;
  raw_username text;
  raw_name text;
BEGIN
  raw_username := coalesce(
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    NEW.phone,
    'user'
  );
  base := lower(regexp_replace(raw_username, '[^a-zA-Z0-9_]', '', 'g'));
  IF base = '' THEN base := 'user'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = base) THEN
    base := base || substr(replace(NEW.id::text,'-',''),1,6);
  END IF;

  raw_name := coalesce(
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    base
  );

  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    base,
    raw_name,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END $$;
