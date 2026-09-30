/*
# Initial Schema Part 3: Reports, Notifications, Prayer, Stories, Daily Content, Donations, Storage
Creates the remaining tables and storage buckets with policies.
*/

-- Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('post','comment','prayer_request','story','user')),
  target_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam','harassment','hate','sexual','scam','misinformation','copyright','other')),
  notes text,
  status text DEFAULT 'pending' CHECK (status IN ('pending','reviewed','dismissed','action_taken')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS reports_status_idx ON public.reports(status);
CREATE INDEX IF NOT EXISTS reports_target_idx ON public.reports(target_type, target_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports_insert" ON public.reports;
CREATE POLICY "reports_insert" ON public.reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "reports_owner_read" ON public.reports;
CREATE POLICY "reports_owner_read" ON public.reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);

DROP POLICY IF EXISTS "admin_reports_read" ON public.reports;
CREATE POLICY "admin_reports_read" ON public.reports
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_reports_update" ON public.reports;
CREATE POLICY "admin_reports_update" ON public.reports
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, is_read, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_read" ON public.notifications;
CREATE POLICY "notifications_read" ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete" ON public.notifications;
CREATE POLICY "notifications_delete" ON public.notifications
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Prayer Requests
CREATE TABLE IF NOT EXISTS public.prayer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text,
  anonymous boolean DEFAULT false,
  prayer_count integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('published','hidden','deleted')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS prayer_created_idx ON public.prayer_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS prayer_status_idx ON public.prayer_requests(status);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prayer_public_read" ON public.prayer_requests;
CREATE POLICY "prayer_public_read" ON public.prayer_requests
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "prayer_insert" ON public.prayer_requests;
CREATE POLICY "prayer_insert" ON public.prayer_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_suspended = true)
  );

DROP POLICY IF EXISTS "prayer_owner_update" ON public.prayer_requests;
CREATE POLICY "prayer_owner_update" ON public.prayer_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "admin_update_prayer" ON public.prayer_requests;
CREATE POLICY "admin_update_prayer" ON public.prayer_requests
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "prayer_owner_delete" ON public.prayer_requests;
CREATE POLICY "prayer_owner_delete" ON public.prayer_requests
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "admin_delete_prayer" ON public.prayer_requests;
CREATE POLICY "admin_delete_prayer" ON public.prayer_requests
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS prayer_updated_at ON public.prayer_requests;
CREATE TRIGGER prayer_updated_at
  BEFORE UPDATE ON public.prayer_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Prayer Support
CREATE TABLE IF NOT EXISTS public.prayer_support (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_request_id uuid NOT NULL REFERENCES public.prayer_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (prayer_request_id, user_id)
);

CREATE INDEX IF NOT EXISTS prayer_support_prayer_idx ON public.prayer_support(prayer_request_id);

ALTER TABLE public.prayer_support ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prayer_support_read" ON public.prayer_support;
CREATE POLICY "prayer_support_read" ON public.prayer_support
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "prayer_support_insert" ON public.prayer_support;
CREATE POLICY "prayer_support_insert" ON public.prayer_support
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "prayer_support_delete" ON public.prayer_support;
CREATE POLICY "prayer_support_delete" ON public.prayer_support
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Stories
CREATE TABLE IF NOT EXISTS public.stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  anonymous boolean DEFAULT false,
  status text DEFAULT 'published' CHECK (status IN ('published','pending','hidden')),
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stories_status_idx ON public.stories(status);
CREATE INDEX IF NOT EXISTS stories_created_idx ON public.stories(created_at DESC);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stories_public_read" ON public.stories;
CREATE POLICY "stories_public_read" ON public.stories
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "stories_auth_read_own_pending" ON public.stories;
CREATE POLICY "stories_auth_read_own_pending" ON public.stories
  FOR SELECT TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "stories_insert" ON public.stories;
CREATE POLICY "stories_insert" ON public.stories
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_suspended = true)
  );

DROP POLICY IF EXISTS "stories_owner_update" ON public.stories;
CREATE POLICY "stories_owner_update" ON public.stories
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "admin_update_stories" ON public.stories;
CREATE POLICY "admin_update_stories" ON public.stories
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "stories_owner_delete" ON public.stories;
CREATE POLICY "stories_owner_delete" ON public.stories
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "admin_delete_stories" ON public.stories;
CREATE POLICY "admin_delete_stories" ON public.stories
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS stories_updated_at ON public.stories;
CREATE TRIGGER stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Daily Questions
CREATE TABLE IF NOT EXISTS public.daily_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  bible_refs text,
  explanation text,
  publish_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS daily_q_date_idx ON public.daily_questions(publish_date DESC);

ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_questions_read" ON public.daily_questions;
CREATE POLICY "daily_questions_read" ON public.daily_questions
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "admin_daily_questions_write" ON public.daily_questions;
CREATE POLICY "admin_daily_questions_write" ON public.daily_questions
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS daily_questions_updated_at ON public.daily_questions;
CREATE TRIGGER daily_questions_updated_at
  BEFORE UPDATE ON public.daily_questions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Daily Verses
CREATE TABLE IF NOT EXISTS public.daily_verses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  verse_text text NOT NULL,
  explanation text,
  publish_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS daily_v_date_idx ON public.daily_verses(publish_date DESC);

ALTER TABLE public.daily_verses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "daily_verses_read" ON public.daily_verses;
CREATE POLICY "daily_verses_read" ON public.daily_verses
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "admin_daily_verses_write" ON public.daily_verses;
CREATE POLICY "admin_daily_verses_write" ON public.daily_verses
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS daily_verses_updated_at ON public.daily_verses;
CREATE TRIGGER daily_verses_updated_at
  BEFORE UPDATE ON public.daily_verses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Donation Projects
CREATE TABLE IF NOT EXISTS public.donation_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  target_amount numeric(12,2),
  amount_raised numeric(12,2) DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active','completed','paused')),
  start_date date,
  end_date date,
  featured_image text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS projects_status_idx ON public.donation_projects(status);

ALTER TABLE public.donation_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_read" ON public.donation_projects;
CREATE POLICY "projects_read" ON public.donation_projects
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_projects_write" ON public.donation_projects;
CREATE POLICY "admin_projects_write" ON public.donation_projects
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS projects_updated_at ON public.donation_projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.donation_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Project Updates
CREATE TABLE IF NOT EXISTS public.project_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.donation_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS updates_project_idx ON public.project_updates(project_id, created_at DESC);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "updates_read" ON public.project_updates;
CREATE POLICY "updates_read" ON public.project_updates
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_updates_write" ON public.project_updates;
CREATE POLICY "admin_updates_write" ON public.project_updates
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Donations
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  project_id uuid NOT NULL REFERENCES public.donation_projects(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'NGN',
  status text DEFAULT 'pending' CHECK (status IN ('pending','successful','failed','refunded')),
  paystack_reference text UNIQUE NOT NULL,
  donor_name text,
  anonymous boolean DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donations_project_idx ON public.donations(project_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON public.donations(status);
CREATE INDEX IF NOT EXISTS donations_user_idx ON public.donations(user_id);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "donations_owner_read" ON public.donations;
CREATE POLICY "donations_owner_read" ON public.donations
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admin_donations_read" ON public.donations;
CREATE POLICY "admin_donations_read" ON public.donations
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "donations_insert" ON public.donations;
CREATE POLICY "donations_insert" ON public.donations
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "admin_donations_update" ON public.donations;
CREATE POLICY "admin_donations_update" ON public.donations
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;
CREATE POLICY "avatars_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatars_owner_insert" ON storage.objects;
CREATE POLICY "avatars_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

DROP POLICY IF EXISTS "avatars_owner_update" ON storage.objects;
CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

DROP POLICY IF EXISTS "avatars_owner_delete" ON storage.objects;
CREATE POLICY "avatars_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- Storage policies for post-images
DROP POLICY IF EXISTS "post_images_public_read" ON storage.objects;
CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "post_images_auth_insert" ON storage.objects;
CREATE POLICY "post_images_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images' AND auth.uid() = owner);

DROP POLICY IF EXISTS "post_images_owner_delete" ON storage.objects;
CREATE POLICY "post_images_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-images' AND auth.uid() = owner);

-- Storage policies for story-images
DROP POLICY IF EXISTS "story_images_public_read" ON storage.objects;
CREATE POLICY "story_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'story-images');

DROP POLICY IF EXISTS "story_images_auth_insert" ON storage.objects;
CREATE POLICY "story_images_auth_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'story-images' AND auth.uid() = owner);

DROP POLICY IF EXISTS "story_images_owner_delete" ON storage.objects;
CREATE POLICY "story_images_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'story-images' AND auth.uid() = owner);