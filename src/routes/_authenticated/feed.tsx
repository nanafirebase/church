import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { db, POST_SELECT, useMyProfile, type Post } from "@/lib/social";
import { PostCard } from "@/components/social/post-card";
import { UserAvatar } from "@/components/social/user-avatar";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/feed")({
  head: () => ({ meta: [{ title: "Feed — Unfold Jesus" }, { name: "description", content: "Questions and reflections from the Unfold Jesus community." }] }),
  component: Feed,
});

function Feed() {
  const { user } = Route.useRouteContext();
  const { data: me } = useMyProfile(user.id);
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"all" | "friends">("all");

  const friendIds = useQuery({
    queryKey: ["posts", "friend-ids", user.id],
    queryFn: async () => {
      const { data } = await db.from("friendships").select("requester_id, addressee_id").eq("status", "accepted");
      return (data ?? []).map((f: { requester_id: string; addressee_id: string }) => (f.requester_id === user.id ? f.addressee_id : f.requester_id)) as string[];
    },
  });

  const posts = useQuery({
    queryKey: ["posts", "feed", tab, friendIds.data],
    enabled: tab === "all" || !!friendIds.data,
    queryFn: async () => {
      let q = db.from("posts").select(POST_SELECT).order("created_at", { ascending: false }).limit(50);
      if (tab === "friends") q = q.in("author_id", [user.id, ...(friendIds.data ?? [])]);
      const { data, error } = await q;
      if (error) throw error;
      return data as Post[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await db.from("posts").insert({ author_id: user.id, content: text.trim() });
      if (error) throw error;
    },
    onSuccess: () => { setText(""); qc.invalidateQueries({ queryKey: ["posts"] }); },
    onError: () => toast.error("Couldn't post"),
  });

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); if (text.trim()) create.mutate(); }} className="border border-border bg-card p-4">
        <div className="flex gap-3">
          <UserAvatar profile={me} />
          <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 1000))} placeholder="Ask a question or share what Scripture is teaching you…" className="min-h-20 flex-1 resize-none bg-transparent leading-7 outline-none placeholder:text-muted-foreground" />
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">{text.length}/1000</span>
          <Button type="submit" size="sm" disabled={!text.trim() || create.isPending}>Post</Button>
        </div>
      </form>

      <div className="flex gap-2">
        {(["all", "friends"] as const).map((t) => (
          <Button key={t} size="sm" variant={tab === t ? "default" : "outline"} onClick={() => setTab(t)}>{t === "all" ? "Everyone" : "Friends"}</Button>
        ))}
      </div>

      {posts.isLoading && <p className="text-muted-foreground">Loading…</p>}
      {posts.data?.length === 0 && <p className="py-10 text-center text-muted-foreground">Nothing here yet. Start the conversation.</p>}
      {posts.data?.map((p) => <PostCard key={p.id} post={p} userId={user.id} />)}
    </div>
  );
}
