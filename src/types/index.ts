export type PostType = 'question' | 'doubt' | 'thought' | 'bible_passage' | 'testimony';
export type PostStatus = 'published' | 'hidden' | 'deleted' | 'pending_review';
export type ReactionType = 'heart' | 'pray' | 'thinking';
export type ReportReason = 'spam' | 'harassment' | 'hate' | 'sexual' | 'scam' | 'misinformation' | 'copyright' | 'other';
export type ReportTarget = 'post' | 'comment' | 'prayer_request' | 'story' | 'user';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  country: string | null;
  is_verified_contributor: boolean;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface BibleReference {
  id: string;
  book: string;
  chapter: number;
  verse_start: number | null;
  verse_end: number | null;
  reference_text: string;
  passage_text: string | null;
}

export interface PostImage {
  id: string;
  post_id: string;
  image_url: string;
  sort_order: number;
}

export interface Post {
  id: string;
  author_id: string;
  type: PostType;
  title: string;
  content: string;
  category_id: string | null;
  slug: string;
  anonymous: boolean;
  view_count: number;
  status: PostStatus;
  is_featured: boolean;
  is_pinned: boolean;
  what_bible_says: string | null;
  in_simple_terms: string | null;
  why_confusing: string | null;
  what_christians_believe: string | null;
  where_christians_disagree: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
  author?: Profile;
  post_images?: PostImage[];
  post_bible_references?: { bible_reference_id: string; bible_references: BibleReference }[];
  reaction_counts?: Record<ReactionType, number>;
  user_reactions?: ReactionType[];
  comment_count?: number;
  is_bookmarked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  anonymous: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: Comment[];
}

export interface PrayerRequest {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string | null;
  anonymous: boolean;
  prayer_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  user_supported?: boolean;
}

export interface Story {
  id: string;
  author_id: string;
  title: string;
  content: string;
  anonymous: boolean;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface DailyQuestion {
  id: string;
  question: string;
  bible_refs: string | null;
  explanation: string | null;
  publish_date: string;
  is_active: boolean;
}

export interface DailyVerse {
  id: string;
  reference: string;
  verse_text: string;
  explanation: string | null;
  publish_date: string;
  is_active: boolean;
}

export interface DonationProject {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  target_amount: number | null;
  amount_raised: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  featured_image: string | null;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface Donation {
  id: string;
  user_id: string | null;
  project_id: string;
  amount: number;
  currency: string;
  status: string;
  paystack_reference: string;
  donor_name: string | null;
  anonymous: boolean;
  verified_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface FollowCounts {
  followers: number;
  following: number;
}
