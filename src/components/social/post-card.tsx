import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Repeat2, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { db, timeAgo, type Post, type Profile } from "@/lib/social";
import { UserAvatar } from "./user-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Comment = { id: string; content: string; created_at: string; author_id: string; author: Profile };

export function PostCard({ post, userId, defaultOpen = false }: { post: Post; userId: string; defaultOpen?: boolean }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(defaultOpen);
  const [text, setText] = useState("");
  const isRepost = !!post.repost_of && !post.content && post.original;
  const target = isRepost ? post.original! : post;
  const liked = post.post_likes.some((l) => l.user_id === userId);
  const refresh = () => qc.invalidateQueries({ queryKey: ["posts"] });

  const like = useMutation({
    mutationFn: async () => {
      const q = liked
        ? db.from("post_likes").delete().eq("post_id", post.id).eq("user_id", userId)
        : db.from("post_likes").insert({ post_id: post.id, user_id: userId });
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const repost = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("posts").insert({ author_id: userId, repost_of: target.id, content: "" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Reposted"); refresh(); },
    onError: () => toast.error("Couldn't repost"),
  });

  const remove = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("posts").delete().eq("id", post.id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const comments = useQuery({
    queryKey: ["posts", "comments", post.id],
    enabled: open,
    queryFn: async () => {
      const { data, error } = await db.from("comments").select("*, author:profiles!comments_author_id_fkey(*)").eq("post_id", post.id).order("created_at");
      if (error) throw error;
      return data as Comment[];
    },
  });

  const addComment = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("comments").insert({ post_id: post.id, author_id: userId, content: text.trim() });
      if (error) throw error;
    },
    onSuccess: () => { setText(""); refresh(); },
  });

  const delComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  const share = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: "Unfold Jesus", text: target.content.slice(0, 100), url }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  };

  return (
    <article className="border border-border bg-card p-4 sm:p-5">
      {isRepost && (
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Repeat2 className="size-3.5" /> <Link to="/u/$username" params={{ username: post.author.username }} className="hover:underline">{post.author.display_name}</Link> reposted
        </p>
      )}
      <div className="flex gap-3">
        <Link to="/u/$username" params={{ username: target.author.username }}><UserAvatar profile={target.author} /></Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 truncate text-sm">
              <Link to="/u/$username" params={{ username: target.author.username }} className="font-semibold hover:underline">{target.author.display_name}</Link>
              <span className="text-muted-foreground"> @{target.author.username} · {timeAgo(target.created_at)}</span>
            </div>
            {post.author_id === userId && (
              <Button variant="ghost" size="icon" className="size-8" aria-label="Delete" onClick={() => remove.mutate()}><Trash2 className="size-4" /></Button>
            )}
          </div>
          <Link to="/post/$id" params={{ id: post.id }} className="mt-1 block whitespace-pre-wrap break-words leading-7">{target.content}</Link>
          {!isRepost && post.original && (
            <div className="mt-3 border border-border bg-background p-3 text-sm">
              <p className="font-semibold">{post.original.author.display_name} <span className="font-normal text-muted-foreground">@{post.original.author.username}</span></p>
              <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{post.original.content}</p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <button onClick={() => setOpen((v) => !v)} className="flex min-h-10 items-center gap-1.5 rounded-md px-2 hover:bg-muted hover:text-foreground" aria-label="Comments">
              <MessageCircle className="size-4" />{post.comments[0]?.count ?? 0}
            </button>
            <button onClick={() => repost.mutate()} className="flex min-h-10 items-center gap-1.5 rounded-md px-2 hover:bg-muted hover:text-support" aria-label="Repost">
              <Repeat2 className="size-4" />{post.reposts?.[0]?.count ?? 0}
            </button>
            <button onClick={() => like.mutate()} className={cn("flex min-h-10 items-center gap-1.5 rounded-md px-2 hover:bg-muted", liked && "text-destructive")} aria-label={liked ? "Unlike" : "Like"}>
              <Heart className={cn("size-4", liked && "fill-current")} />{post.post_likes.length}
            </button>
            <button onClick={share} className="flex min-h-10 items-center gap-1.5 rounded-md px-2 hover:bg-muted hover:text-foreground" aria-label="Share">
              <Share2 className="size-4" />
            </button>
          </div>

          {open && (
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              {comments.data?.map((c) => (
                <div key={c.id} className="flex gap-2">
                  <UserAvatar profile={c.author} className="size-8 text-xs" />
                  <div className="min-w-0 flex-1 rounded-md bg-muted px-3 py-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="font-semibold">{c.author.display_name} <span className="font-normal text-muted-foreground">· {timeAgo(c.created_at)}</span></span>
                      {c.author_id === userId && <button onClick={() => delComment.mutate(c.id)} className="text-xs text-muted-foreground hover:text-destructive">Delete</button>}
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap break-words">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.data?.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Be the first.</p>}
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (text.trim()) addComment.mutate(); }}>
                <input value={text} onChange={(e) => setText(e.target.value.slice(0, 1000))} placeholder="Write a kind reply…" className="min-h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary" />
                <Button type="submit" size="sm" disabled={!text.trim() || addComment.isPending}>Reply</Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
