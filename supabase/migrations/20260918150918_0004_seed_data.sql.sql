/*
# Seed Data — Demo Content for Unfold Jesus
All content is clearly demo/seed data. Bible references use public domain text only.
*/

-- Categories
INSERT INTO public.categories (name, slug, description, icon, sort_order) VALUES
  ('Jesus', 'jesus', 'Questions about who Jesus is, His life, and His teachings.', 'User', 1),
  ('God', 'god', 'Questions about the nature and character of God.', 'Sparkles', 2),
  ('Holy Spirit', 'holy-spirit', 'Questions about the Holy Spirit and His work.', 'Wind', 3),
  ('Bible', 'bible', 'Questions about Scripture, interpretation, and understanding.', 'BookOpen', 4),
  ('Prayer', 'prayer', 'Questions about prayer, how to pray, and why it matters.', 'HandHeart', 5),
  ('Salvation', 'salvation', 'Questions about salvation, grace, and being saved.', 'Gift', 6),
  ('Sin', 'sin', 'Questions about sin, forgiveness, and overcoming.', 'Scale', 7),
  ('Faith', 'faith', 'Questions about faith, doubt, and trust in God.', 'Shield', 8),
  ('Doubt', 'doubt', 'Questions about doubts, struggles, and honest uncertainty.', 'HelpCircle', 9),
  ('Relationships', 'relationships', 'Questions about relationships from a Christian perspective.', 'Heart', 10),
  ('Purpose', 'purpose', 'Questions about meaning, calling, and purpose in life.', 'Compass', 11),
  ('Suffering', 'suffering', 'Questions about pain, suffering, and where God is in it.', 'CloudRain', 12),
  ('Death and Eternity', 'death-and-eternity', 'Questions about death, heaven, hell, and eternal life.', 'Infinity', 13),
  ('Christianity and Science', 'christianity-and-science', 'Questions about faith, science, and their relationship.', 'Atom', 14),
  ('Christianity and Culture', 'christianity-and-culture', 'Questions about living as a Christian in modern culture.', 'Globe', 15),
  ('Church', 'church', 'Questions about church, community, and gathering together.', 'Home', 16),
  ('Difficult Bible Passages', 'difficult-bible-passages', 'Questions about confusing or challenging Bible verses.', 'BookMarked', 17)
ON CONFLICT (name) DO NOTHING;

-- Bible Books (New Testament for seed)
INSERT INTO public.bible_books (id, name, testament, chapter_count, sort_order) VALUES
  (40, 'Matthew', 'NT', 28, 40),
  (41, 'Mark', 'NT', 16, 41),
  (42, 'Luke', 'NT', 24, 42),
  (43, 'John', 'NT', 21, 43),
  (44, 'Acts', 'NT', 28, 44),
  (45, 'Romans', 'NT', 16, 45),
  (46, '1 Corinthians', 'NT', 16, 46),
  (47, '2 Corinthians', 'NT', 13, 47),
  (48, 'Galatians', 'NT', 6, 48),
  (49, 'Ephesians', 'NT', 6, 49),
  (50, 'Philippians', 'NT', 4, 50),
  (51, 'Colossians', 'NT', 4, 51),
  (52, '1 Thessalonians', 'NT', 5, 52),
  (53, '2 Thessalonians', 'NT', 3, 53),
  (54, '1 Timothy', 'NT', 6, 54),
  (55, '2 Timothy', 'NT', 4, 55),
  (56, 'Titus', 'NT', 3, 56),
  (57, 'Philemon', 'NT', 1, 57),
  (58, 'Hebrews', 'NT', 13, 58),
  (59, 'James', 'NT', 5, 59),
  (60, '1 Peter', 'NT', 5, 60),
  (61, '2 Peter', 'NT', 3, 61),
  (62, '1 John', 'NT', 5, 62),
  (63, '2 John', 'NT', 1, 63),
  (64, '3 John', 'NT', 1, 64),
  (65, 'Jude', 'NT', 1, 65),
  (66, 'Revelation', 'NT', 22, 66)
ON CONFLICT (id) DO NOTHING;

-- Bible Books (Old Testament)
INSERT INTO public.bible_books (id, name, testament, chapter_count, sort_order) VALUES
  (1, 'Genesis', 'OT', 50, 1),
  (2, 'Exodus', 'OT', 40, 2),
  (3, 'Leviticus', 'OT', 27, 3),
  (4, 'Numbers', 'OT', 36, 4),
  (5, 'Deuteronomy', 'OT', 34, 5),
  (6, 'Joshua', 'OT', 24, 6),
  (7, 'Judges', 'OT', 21, 7),
  (8, 'Ruth', 'OT', 4, 8),
  (9, '1 Samuel', 'OT', 31, 9),
  (10, '2 Samuel', 'OT', 24, 10),
  (11, '1 Kings', 'OT', 22, 11),
  (12, '2 Kings', 'OT', 25, 12),
  (13, '1 Chronicles', 'OT', 29, 13),
  (14, '2 Chronicles', 'OT', 36, 14),
  (15, 'Ezra', 'OT', 10, 15),
  (16, 'Nehemiah', 'OT', 13, 16),
  (17, 'Esther', 'OT', 10, 17),
  (18, 'Job', 'OT', 42, 18),
  (19, 'Psalms', 'OT', 150, 19),
  (20, 'Proverbs', 'OT', 31, 20),
  (21, 'Ecclesiastes', 'OT', 12, 21),
  (22, 'Song of Solomon', 'OT', 8, 22),
  (23, 'Isaiah', 'OT', 66, 23),
  (24, 'Jeremiah', 'OT', 52, 24),
  (25, 'Lamentations', 'OT', 5, 25),
  (26, 'Ezekiel', 'OT', 48, 26),
  (27, 'Daniel', 'OT', 12, 27),
  (28, 'Hosea', 'OT', 14, 28),
  (29, 'Joel', 'OT', 3, 29),
  (30, 'Amos', 'OT', 9, 30),
  (31, 'Obadiah', 'OT', 1, 31),
  (32, 'Jonah', 'OT', 4, 32),
  (33, 'Micah', 'OT', 7, 33),
  (34, 'Nahum', 'OT', 3, 34),
  (35, 'Habakkuk', 'OT', 3, 35),
  (36, 'Zephaniah', 'OT', 3, 36),
  (37, 'Haggai', 'OT', 2, 37),
  (38, 'Zechariah', 'OT', 14, 38),
  (39, 'Malachi', 'OT', 4, 39)
ON CONFLICT (id) DO NOTHING;

-- Bible References (public domain — World English Bible style paraphrase for seed)
INSERT INTO public.bible_references (book, chapter, verse_start, verse_end, reference_text, passage_text) VALUES
  ('John', 10, 30, 30, 'John 10:30', '"I and the Father are one."'),
  ('Luke', 22, 42, 42, 'Luke 22:42', '"Father, if you are willing, remove this cup from me. Nevertheless, not my will, but yours, be done."'),
  ('John', 1, 1, 1, 'John 1:1', '"In the beginning was the Word, and the Word was with God, and the Word was God."'),
  ('John', 1, 14, 14, 'John 1:14', '"The Word became flesh, and lived among us. We saw his glory, such glory as of the one and only Son of the Father, full of grace and truth."'),
  ('John', 6, 38, 38, 'John 6:38', '"For I have come down from heaven, not to do my own will, but the will of him who sent me."'),
  ('John', 10, 18, 18, 'John 10:18', '"No one takes it away from me, but I lay it down by myself. I have power to lay it down, and I have power to take it again."'),
  ('John', 20, 28, 28, 'John 20:28', 'Thomas answered him, "My Lord and my God!"'),
  ('John', 14, 28, 28, 'John 14:28', '"You heard how I told you, ''I go away, and I come to you.'' If you loved me, you would have rejoiced, because I said ''I am going to the Father,'' for the Father is greater than I."'),
  ('Philippians', 2, 6, 8, 'Philippians 2:6-8', 'who, existing in the form of God, didn''t consider equality with God something to be grasped, but emptied himself, taking the form of a servant, being made in the likeness of men. And being found in human form, he humbled himself, becoming obedient to the point of death, yes, the death of the cross.'),
  ('Colossians', 2, 9, 9, 'Colossians 2:9', '"For in him all the fullness of the Godhead dwells bodily"')
ON CONFLICT DO NOTHING;

-- Daily Question (today)
INSERT INTO public.daily_questions (question, bible_refs, explanation, publish_date, is_active)
VALUES (
  'If Jesus is God, why did He pray to God?',
  'John 10:30; Luke 22:42; John 1:1; John 6:38',
  'Jesus prayed because, in His human nature, He related to the Father in dependence and trust. Christians believe Jesus is fully God and fully human — so His prayers reveal His humanity, not a contradiction of His divinity.',
  CURRENT_DATE,
  true
)
ON CONFLICT DO NOTHING;

-- Daily Verse
INSERT INTO public.daily_verses (reference, verse_text, explanation, publish_date, is_active)
VALUES (
  'John 1:14',
  'The Word became flesh, and lived among us. We saw his glory, such glory as of the one and only Son of the Father, full of grace and truth.',
  'This verse captures the heart of the Christian faith — God became human in Jesus. The eternal Word entered our world as a real person, showing us what God is like in terms we can see and understand.',
  CURRENT_DATE,
  true
)
ON CONFLICT DO NOTHING;

-- Donation Projects
INSERT INTO public.donation_projects (name, slug, description, target_amount, amount_raised, status, start_date, featured_image)
VALUES
  ('General Fund', 'general-fund', 'Supports the ongoing operations of Unfold Jesus, including content creation, server costs, and community moderation.', 5000000, 1250000, 'active', CURRENT_DATE - INTERVAL '60 days', null),
  ('Orphan Support', 'orphan-support', 'Provides food, shelter, and educational support for vulnerable children who have lost parents.', 2000000, 850000, 'active', CURRENT_DATE - INTERVAL '30 days', null),
  ('Widow Support', 'widow-support', 'Provides practical assistance, food, and community support for widows in need.', 1500000, 420000, 'active', CURRENT_DATE - INTERVAL '20 days', null)
ON CONFLICT (slug) DO NOTHING;

-- Create a demo admin user and a demo post
-- First, we need to create a service-role-managed demo content
-- Since we can't create auth users via SQL easily, we'll use a known UUID pattern for seed posts
-- The posts will reference a demo author_id that won't exist in auth.users
-- Instead, let's insert posts using a temporary approach

-- Insert a featured post with full explanation (using a generated UUID for author)
-- Note: This requires an actual user. We'll use execute_sql to create a demo user via auth
-- For now, we'll store the explanation content that can be linked once a user exists

-- Project updates for transparency
INSERT INTO public.project_updates (project_id, title, content)
SELECT p.id, 'Initial project launch', 'This project has been launched and is now accepting donations. We will provide regular updates on how funds are being used.'
FROM public.donation_projects p
WHERE p.slug = 'orphan-support'
AND NOT EXISTS (SELECT 1 FROM public.project_updates pu WHERE pu.project_id = p.id);