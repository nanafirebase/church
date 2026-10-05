import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Search } from "lucide-react";
import { db, type Profile } from "@/lib/social";
import { UserAvatar } from "@/components/social/user-avatar";
import { FriendButton } from "@/components/social/friend-button";

export const Route = createFileRoute("/_authenticated/friends")({
  head: () => ({ meta: [{ title: "Friends — Unfold Jesus" }, { name: "description", content: "Find people and manage friend requests." }] }),
  component: Friends,
});

type F = { id: string; requester_id: string; addressee_id: string; status: string; requester: Profile; addressee: Profile };

function Row({ p, me }: { p: Profile; me: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <Link to="/u/$username" params={{ username: p.username }} className="flex min-w-0 items-center gap-3">
        <UserAvatar profile={p} />
        <div className="min-w-0"><p className="truncate font-semibold">{p.display_name}</p><p className="truncate text-sm text-muted-foreground">@{p.username}</p></div>
      </Link>
      <FriendButton me={me} other={p.id} />
    </div>
  );
}

function Friends() {
  const { user } = Route.useRouteContext();
  const [q, setQ] = useState("");

  const rels = useQuery({
    queryKey: ["friendships", "all", user.id],
    queryFn: async () => {
      const { data, error } = await db.from("friendships").select("*, requester:profiles!friendships_requester_id_fkey(*), addressee:profiles!friendships_addressee_id_fkey(*)");
      if (error) throw error;
      return data as F[];
    },
  });

  const people = useQuery({
    queryKey: ["people", q],
    queryFn: async () => {
      let query = db.from("profiles").select("*").neq("id", user.id).limit(20);
      if (q.trim()) query = query.or(`username.ilike.%${q.trim()}%,display_name.ilike.%${q.trim()}%`);
      const { data } = await query;
      return (data ?? []) as Profile[];
    },
  });

  const incoming = rels.data?.filter((r) => r.status === "pending" && r.addressee_id === user.id) ?? [];
  const friends = rels.data?.filter((r) => r.status === "accepted").map((r) => (r.requester_id === user.id ? r.addressee : r.requester)) ?? [];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="border border-border bg-card p-4"><h2 className="font-display text-2xl font-semibold">{title}</h2><div className="mt-2 divide-y divide-border">{children}</div></section>
  );

  return (
    <div className="space-y-4">
      {incoming.length > 0 && <Section title="Friend requests">{incoming.map((r) => <Row key={r.id} p={r.requester} me={user.id} />)}</Section>}
      <Section title={`Your friends (${friends.length})`}>
        {friends.length === 0 ? <p className="py-3 text-sm text-muted-foreground">No friends yet — find people below.</p> : friends.map((p) => <Row key={p.id} p={p} me={user.id} />)}
      </Section>
      <Section title="Find people">
        <label className="mt-2 flex min-h-11 items-center gap-2 rounded-md border border-input bg-background px-3">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value.replace(/[,()%]/g, ""))} placeholder="Search by name or username" className="flex-1 bg-transparent outline-none" />
        </label>
        {people.data?.map((p) => <Row key={p.id} p={p} me={user.id} />)}
      </Section>
    </div>
  );
}
