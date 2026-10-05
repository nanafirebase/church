import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
};

export type Post = {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  repost_of: string | null;
  author: Profile;
  original: (Omit<Post, "original" | "post_likes" | "comments"> & { author: Profile }) | null;
  post_likes: { user_id: string }[];
  comments: { count: number }[];
  reposts: { count: number }[];
};

export const POST_SELECT =
  "id, content, created_at, author_id, repost_of, author:profiles!posts_author_id_fkey(*), original:posts!posts_repost_of_fkey(id, content, created_at, author_id, repost_of, author:profiles!posts_author_id_fkey(*)), post_likes(user_id), comments(count), reposts:posts!posts_repost_of_fkey(count)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = supabase as any;

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, user: session?.user ?? null, ready };
}

export function useMyProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", "id", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await db.from("profiles").select("*").eq("id", userId).single();
      if (error) throw error;
      return data as Profile;
    },
  });
}

export function useAvatarUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["avatar", path],
    enabled: !!path,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
      return data?.signedUrl ?? null;
    },
  });
}

export function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}
