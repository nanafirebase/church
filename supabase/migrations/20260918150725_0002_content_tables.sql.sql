/*
# Initial Schema Part 2: Content Tables
Creates categories, bible references, posts, comments, reactions, bookmarks, follows.
*/

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_public_read" ON public.categories;
CREATE POLICY "categories_public_read" ON public.categories
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "admin_category_write" ON public.categories;
CREATE POLICY "admin_category_write" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Bible Books
CREATE TABLE IF NOT EXISTS public.bible_books (
  id integer PRIMARY KEY,
  name text NOT NULL,
  testament text NOT NULL CHECK (testament IN ('OT', 'NT')),
  chapter_count integer NOT NULL,
  sort_order integer NOT NULL
);

ALTER TABLE public.bible_books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bible_books_read" ON public.bible_books;
CREATE POLICY "bible_books_read" ON public.bible_books
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "admin_bible_books_write" ON public.bible_books;
CREATE POLICY "admin_bible_books_write" ON public.bible_books
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Bible References
CREATE TABLE IF NOT EXISTS public.bible_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book text NOT NULL,
  chapter integer NOT NULL,
  verse_start integer,
  verse_end integer,
  reference_text text NOT NULL,
  passage_text text,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bible_references_unique_idx
  ON public.bible_references (book, chapter, verse_start, verse_end);

ALTER TABLE public.bible_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bible_refs_read" ON public.bible_references;
CREATE POLICY "bible_refs_read" ON public.bible_references
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "auth_bible_refs_insert" ON public.bible_references;
CREATE POLICY "auth_bible_refs_insert" ON public.bible_references
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_bible_refs_update" ON public.bible_references;
CREATE POLICY "admin_bible_refs_update" ON public.bible_references
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'question' CHECK (type IN ('question','doubt','thought','bible_passage','testimony')),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  slug text NOT NULL,
  anonymous boolean DEFAULT false,
  view_count integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('published','hidden','deleted','pending_review')),
  is_featured boolean DEFAULT false,
  is_pinned boolean DEFAULT false,
  what_bible_says text,
  in_simple_terms text,
  why_confusing text,
  what_christians_believe text,
  where_christians_disagree text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_author_idx ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS posts_category_idx ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS posts_type_idx ON public.posts(type);
CREATE INDEX IF NOT EXISTS posts_status_idx ON public.posts(status);
CREATE INDEX IF NOT EXISTS posts_created_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_slug_idx ON public.posts(slug);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_public_read" ON public.posts;
CREATE POLICY "posts_public_read" ON public.posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "posts_auth_insert" ON public.posts;
CREATE POLICY "posts_auth_insert" ON public.posts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_suspended = true)
  );

DROP POLICY IF EXISTS "posts_owner_update" ON public.posts;
CREATE POLICY "posts_owner_update" ON public.posts
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "admin_update_posts" ON public.posts;
CREATE POLICY "admin_update_posts" ON public.posts
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "posts_owner_delete" ON public.posts;
CREATE POLICY "posts_owner_delete" ON public.posts
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "admin_delete_posts" ON public.posts;
CREATE POLICY "admin_delete_posts" ON public.posts
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS posts_updated_at ON public.posts;
CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Post Images
CREATE TABLE IF NOT EXISTS public.post_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_images_post_idx ON public.post_images(post_id);

ALTER TABLE public.post_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_images_read" ON public.post_images;
CREATE POLICY "post_images_read" ON public.post_images
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "post_images_insert" ON public.post_images;
CREATE POLICY "post_images_insert" ON public.post_images
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
  );

DROP POLICY IF EXISTS "post_images_delete" ON public.post_images;
CREATE POLICY "post_images_delete" ON public.post_images
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
  );

DROP POLICY IF EXISTS "admin_delete_post_images" ON public.post_images;
CREATE POLICY "admin_delete_post_images" ON public.post_images
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Post Bible References
CREATE TABLE IF NOT EXISTS public.post_bible_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  bible_reference_id uuid NOT NULL REFERENCES public.bible_references(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_bible_refs_post_idx ON public.post_bible_references(post_id);

ALTER TABLE public.post_bible_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "post_bible_refs_read" ON public.post_bible_references;
CREATE POLICY "post_bible_refs_read" ON public.post_bible_references
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "post_bible_refs_insert" ON public.post_bible_references;
CREATE POLICY "post_bible_refs_insert" ON public.post_bible_references
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
  );

DROP POLICY IF EXISTS "post_bible_refs_delete" ON public.post_bible_references;
CREATE POLICY "post_bible_refs_delete" ON public.post_bible_references
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.author_id = auth.uid())
  );

-- Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  content text NOT NULL,
  anonymous boolean DEFAULT false,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_post_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_author_idx ON public.comments(author_id);
CREATE INDEX IF NOT EXISTS comments_parent_idx ON public.comments(parent_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_read" ON public.comments;
CREATE POLICY "comments_read" ON public.comments
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "comments_insert" ON public.comments;
CREATE POLICY "comments_insert" ON public.comments
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.is_suspended = true)
  );

DROP POLICY IF EXISTS "comments_owner_update" ON public.comments;
CREATE POLICY "comments_owner_update" ON public.comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "admin_update_comments" ON public.comments;
CREATE POLICY "admin_update_comments" ON public.comments
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "comments_owner_delete" ON public.comments;
CREATE POLICY "comments_owner_delete" ON public.comments
  FOR DELETE TO authenticated
  USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "admin_delete_comments" ON public.comments;
CREATE POLICY "admin_delete_comments" ON public.comments
  FOR DELETE TO authenticated
  USING (public.is_admin());

DROP TRIGGER IF EXISTS comments_updated_at ON public.comments;
CREATE TRIGGER comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reactions
CREATE TABLE IF NOT EXISTS public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('heart','pray','thinking')),
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, user_id, type)
);

CREATE INDEX IF NOT EXISTS reactions_post_idx ON public.reactions(post_id);

ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reactions_read" ON public.reactions;
CREATE POLICY "reactions_read" ON public.reactions
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "reactions_insert" ON public.reactions;
CREATE POLICY "reactions_insert" ON public.reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "reactions_delete" ON public.reactions;
CREATE POLICY "reactions_delete" ON public.reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS bookmarks_user_idx ON public.bookmarks(user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookmarks_read" ON public.bookmarks;
CREATE POLICY "bookmarks_read" ON public.bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_insert" ON public.bookmarks;
CREATE POLICY "bookmarks_insert" ON public.bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete" ON public.bookmarks;
CREATE POLICY "bookmarks_delete" ON public.bookmarks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Follows
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX IF NOT EXISTS follows_following_idx ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS follows_follower_idx ON public.follows(follower_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "follows_read" ON public.follows;
CREATE POLICY "follows_read" ON public.follows
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "follows_insert" ON public.follows;
CREATE POLICY "follows_insert" ON public.follows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "follows_delete" ON public.follows;
CREATE POLICY "follows_delete" ON public.follows
  FOR DELETE TO authenticated
  USING (auth.uid() = follower_id);