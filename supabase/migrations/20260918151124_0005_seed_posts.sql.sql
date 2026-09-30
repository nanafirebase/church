/*
# Seed Posts — Featured Demo Content
Creates the flagship post with full "Explain It Simply" content.
Author: demo admin user (unfold_team). Public-domain Bible text.
*/

INSERT INTO public.posts (
  author_id, type, title, content, category_id, slug, anonymous,
  status, is_featured, is_pinned,
  what_bible_says, in_simple_terms, why_confusing,
  what_christians_believe, where_christians_disagree
)
SELECT
  'a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab',
  'question',
  'If Jesus is God, why did He pray to God?',
  $seed_content$This is one of the most common and important questions people ask about Jesus. If Christians believe Jesus is God, then why do the Gospels show Him praying to God? Doesn't that imply there are two Gods, or that Jesus is somehow less than God? Let's explore what the Bible says.$seed_content$,
  c.id,
  'if-jesus-is-god-why-did-he-pray-to-god',
  false,
  'published',
  true,
  true,
  $seed_bible$The Bible teaches that Jesus is fully God (John 1:1, John 20:28, Colossians 2:9) and also fully human (John 1:14, Philippians 2:6-8). In His humanity, Jesus prayed to the Father regularly — sometimes early in the morning (Mark 1:35), sometimes all night (Luke 6:12). His prayers show real dependence, trust, and relationship with the Father.

Key passages:
- John 10:30 — "I and the Father are one."
- Luke 22:42 — "Father, if you are willing, remove this cup from me. Nevertheless, not my will, but yours, be done."
- John 6:38 — "For I have come down from heaven, not to do my own will, but the will of him who sent me."
- John 10:18 — "No one takes it away from me, but I lay it down by myself. I have power to lay it down, and I have power to take it again."$seed_bible$,
  $seed_simple$Christians believe Jesus is one person with two natures — fully God and fully human at the same time. When Jesus prayed, He was praying as a human being. His prayers were real and genuine — not a performance.

Think of it this way: Jesus, in His human nature, depended on the Father just as we are called to. He modeled what it looks like to trust God completely. His praying doesn't mean He isn't God — it means He is also genuinely human, and as a human, He related to the Father through prayer.$seed_simple$,
  $seed_confusing$This feels confusing because it seems like Jesus is talking to Himself. If He's God, why would He need to pray at all? And when He says "not my will, but yours," it sounds like His will is different from God's will — which wouldn't make sense if He IS God.

The confusion comes from thinking of Jesus as either God OR human, rather than both at once. If Jesus were only God, praying wouldn't make sense. If He were only human, praying would be expected but He couldn't save us. The Christian answer is that He is both — so His prayers are the prayers of a real human who is also God.$seed_confusing$,
  $seed_believe$Mainstream Christianity (across Catholic, Orthodox, and Protestant traditions) teaches that Jesus is fully God and fully human — two natures in one person. This was formally articulated at the Council of Chalcedon in 451 AD and is held by the vast majority of Christians today.

The key idea is that Jesus' human nature and divine nature are both real and complete, united in one person. His prayers come from His human nature. His divine nature shares fully in the Godhead with the Father and the Holy Spirit.

When Jesus says "the Father is greater than I" (John 14:28), Christians understand this as referring to His incarnate state — His voluntary humility as a human — not a denial of His divinity.$seed_believe$,
  $seed_disagree$Some nuances exist around how to understand the relationship between the Father and the Son:

1. Subordination in incarnation: Some theologians emphasize that Jesus' statement "the Father is greater than I" refers only to His earthly, incarnate state. Others see a broader principle of eternal relational ordering within the Trinity, where the Son is functionally subordinate to the Father even while being equal in essence.

2. Kenotic theology: Some interpret Philippians 2:7 (Jesus "emptied himself") more literally, suggesting Jesus voluntarily gave up the independent exercise of divine attributes during His earthly life. Others argue He retained all divine attributes but chose not to use them independently.

3. Oneness Pentecostals: A minority view (not accepted by mainstream Christianity) holds that Jesus IS the Father — that there is no distinction of persons within the Godhead. This view differs significantly from the Trinitarian doctrine held by most Christians.

These are areas where Christians who affirm Jesus' full divinity still discuss the details of how the Father-Son relationship works.$seed_disagree$
FROM public.categories c WHERE c.slug = 'jesus'
AND NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.slug = 'if-jesus-is-god-why-did-he-pray-to-god');

-- Link bible references to the featured post
INSERT INTO public.post_bible_references (post_id, bible_reference_id)
SELECT p.id, br.id
FROM public.posts p, public.bible_references br
WHERE p.slug = 'if-jesus-is-god-why-did-he-pray-to-god'
  AND br.reference_text IN ('John 10:30', 'Luke 22:42', 'John 1:1', 'John 1:14', 'John 6:38', 'John 10:18', 'John 20:28', 'John 14:28', 'Philippians 2:6-8', 'Colossians 2:9')
  AND NOT EXISTS (
    SELECT 1 FROM public.post_bible_references pbr
    WHERE pbr.post_id = p.id AND pbr.bible_reference_id = br.id
  );

-- Additional sample questions
INSERT INTO public.posts (author_id, type, title, content, category_id, slug, status, is_featured)
SELECT 'a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'question', 'Why did Jesus say "My God, my God, why have you forsaken me?"', 'On the cross, Jesus cried out these words from Psalm 22. What did He mean? Was He abandoned by God? This passage has troubled many readers.', c.id, 'why-did-jesus-say-my-god-why-have-you-forsaken-me', 'published', true
FROM public.categories c WHERE c.slug = 'jesus'
AND NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.slug = 'why-did-jesus-say-my-god-why-have-you-forsaken-me');

INSERT INTO public.posts (author_id, type, title, content, category_id, slug, status)
SELECT 'a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'question', 'Did Jesus really claim to be God, or did His followers say that about Him later?', 'Some people say Jesus never explicitly claimed to be God — that this was an idea invented by His followers after His death. Is that accurate? What do the earliest Gospel records actually show?', c.id, 'did-jesus-claim-to-be-god-or-followers-later', 'published'
FROM public.categories c WHERE c.slug = 'jesus'
AND NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.slug = 'did-jesus-claim-to-be-god-or-followers-later');

INSERT INTO public.posts (author_id, type, title, content, category_id, slug, status)
SELECT 'a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'doubt', 'I struggle to believe Jesus is God. Does that make me a bad Christian?', 'I have been going to church for a while, but honestly, the idea that Jesus is God feels hard to accept. I want to believe, but my mind keeps asking questions. Is it okay to have doubts about this?', c.id, 'struggle-to-believe-jesus-is-god', 'published'
FROM public.categories c WHERE c.slug = 'doubt'
AND NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.slug = 'struggle-to-believe-jesus-is-god');

INSERT INTO public.posts (author_id, type, title, content, category_id, slug, status)
SELECT 'a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'question', 'If God is good, why does He allow suffering?', 'This is perhaps the most asked question in human history. If God is all-powerful and all-loving, why is there so much pain and suffering in the world?', c.id, 'if-god-is-good-why-does-he-allow-suffering', 'published'
FROM public.categories c WHERE c.slug = 'suffering'
AND NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.slug = 'if-god-is-good-why-does-he-allow-suffering');

INSERT INTO public.posts (author_id, type, title, content, category_id, slug, status)
SELECT 'a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'question', 'What does the Bible actually say about salvation?', 'People talk about being "saved" but I am not sure what that really means. Is it about believing the right things? Living a good life? Something else entirely?', c.id, 'what-does-bible-say-about-salvation', 'published'
FROM public.categories c WHERE c.slug = 'salvation'
AND NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.slug = 'what-does-bible-say-about-salvation');

INSERT INTO public.posts (author_id, type, title, content, category_id, slug, status)
SELECT 'a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'question', 'How can I know God purpose for my life?', 'I keep hearing that God has a plan for everyone, but I have no idea what mine is. How do I figure it out? Does the Bible give any guidance on finding your purpose?', c.id, 'how-can-i-know-gods-purpose-for-my-life', 'published'
FROM public.categories c WHERE c.slug = 'purpose'
AND NOT EXISTS (SELECT 1 FROM public.posts p WHERE p.slug = 'how-can-i-know-gods-purpose-for-my-life');

-- Sample prayer requests
INSERT INTO public.prayer_requests (author_id, title, content, category, anonymous, prayer_count)
VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'Prayer for my family', 'My family is going through a difficult season. Please pray for peace, healing, and that we would grow closer to God through this.', 'Family', false, 12),
  ('a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'Struggling with anxiety', 'I have been dealing with severe anxiety and it is affecting my faith. Please pray that God would give me peace and strength.', 'Healing', true, 24)
ON CONFLICT DO NOTHING;

-- Sample stories
INSERT INTO public.stories (author_id, title, content, anonymous, status, is_featured)
VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'How I found faith in the middle of doubt', 'I grew up in church but walked away in my twenties. For years, I felt like Christianity did not have room for my questions. Then I discovered that the Bible itself is full of people who wrestled with God — Jacob, Job, the Psalms. That changed everything for me.', false, 'published', true),
  ('a1b2c3d4-e5f6-4a7b-8c9d-0123456789ab', 'From skepticism to belief', 'I was a convinced atheist for over a decade. What started me on the journey back was reading the Gospels for myself — not what people said about them, but the actual text. I was struck by how little Jesus fit my preconceptions.', true, 'published', false)
ON CONFLICT DO NOTHING;