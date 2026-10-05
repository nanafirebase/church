import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { db, POST_SELECT, type Post, type Profile } from "@/lib/social";
import { UserAvatar } from "@/components/social/user-avatar";
import { FriendButton } from "@/components/social/friend-button";
import { PostCard } from "@/components/social/post-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/u/$username")({
  head: ({ params }) => ({ meta: [{ title: `@${params.username} — Unfold Jesus` }, { name: "description", content: "Member profile on Unfold Jesus." }] }),
  component: UserPage,
});

function UserPage() {
  const { username } = Route.useParams();
  const { user } = Route.useRouteContext();
  const profile = useQuery({
    queryKey: ["profile", "username", username],
    queryFn: async () => {
      const { data } = await db.from("profiles").select("*").eq("username", username).maybeSingle();
      return data as Profile | null;
    },
  });
  const posts = useQuery({
    queryKey: ["posts", "user", profile.data?.id],
    enabled: !!profile.data,
    queryFn: async () => {
      const { data } = await db.from("posts").select(POST_SELECT).eq("author_id", profile.data!.id).order("created_at", { ascending: false });
      return (data ?? []) as Post[];
    },
  });

  if (profile.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!profile.data) return <p className="text-muted-foreground">This member doesn't exist.</p>;
  const p = profile.data;

  return (
    <div className="space-y-4">
      <section className="border border-border bg-card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <UserAvatar profile={p} className="size-20 text-2xl" />
          {p.id === user.id ? <Button asChild size="sm" variant="outline"><Link to="/profile">Edit profile</Link></Button> : <FriendButton me={user.id} other={p.id} />}
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold">{p.display_name}</h1>
        <p className="text-muted-foreground">@{p.username}</p>
        {p.bio && <p className="mt-3 whitespace-pre-wrap leading-7">{p.bio}</p>}
      </section>
      {posts.data?.length === 0 && <p className="py-6 text-center text-muted-foreground">No posts yet.</p>}
      {posts.data?.map((post) => <PostCard key={post.id} post={post} userId={user.id} />)}
    </div>
  );
}
