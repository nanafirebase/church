import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { db, POST_SELECT, type Post } from "@/lib/social";
import { PostCard } from "@/components/social/post-card";

export const Route = createFileRoute("/_authenticated/post/$id")({
  head: () => ({ meta: [{ title: "Post — Unfold Jesus" }, { name: "description", content: "A conversation on Unfold Jesus." }] }),
  component: PostPage,
});

function PostPage() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const post = useQuery({
    queryKey: ["posts", "one", id],
    queryFn: async () => {
      const { data, error } = await db.from("posts").select(POST_SELECT).eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Post | null;
    },
  });
  return (
    <div className="space-y-4">
      <Link to="/feed" className="inline-flex items-center gap-1 text-sm font-medium text-primary"><ArrowLeft className="size-4" /> Back to feed</Link>
      {post.isLoading && <p className="text-muted-foreground">Loading…</p>}
      {post.data === null && <p className="text-muted-foreground">This post was removed.</p>}
      {post.data && <PostCard post={post.data} userId={user.id} defaultOpen />}
    </div>
  );
}
