import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserCheck, UserPlus } from "lucide-react";
import { db } from "@/lib/social";
import { Button } from "@/components/ui/button";

type F = { id: string; requester_id: string; addressee_id: string; status: string };

export function FriendButton({ me, other }: { me: string; other: string }) {
  const qc = useQueryClient();
  const key = ["friendships"];
  const { data: rel } = useQuery({
    queryKey: [...key, "pair", me, other],
    queryFn: async () => {
      const { data } = await db.from("friendships").select("*")
        .or(`and(requester_id.eq.${me},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${me})`).maybeSingle();
      return (data ?? null) as F | null;
    },
  });
  const run = useMutation({
    mutationFn: async (action: "add" | "accept" | "remove") => {
      const q = action === "add" ? db.from("friendships").insert({ requester_id: me, addressee_id: other })
        : action === "accept" ? db.from("friendships").update({ status: "accepted" }).eq("id", rel!.id)
        : db.from("friendships").delete().eq("id", rel!.id);
      const { error } = await q;
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: key }); qc.invalidateQueries({ queryKey: ["posts"] }); },
  });

  if (me === other) return null;
  if (!rel) return <Button size="sm" onClick={() => run.mutate("add")}><UserPlus /> Add friend</Button>;
  if (rel.status === "accepted") return <Button size="sm" variant="outline" onClick={() => run.mutate("remove")}><UserCheck /> Friends</Button>;
  if (rel.addressee_id === me) return (
    <div className="flex gap-2">
      <Button size="sm" onClick={() => run.mutate("accept")}>Accept</Button>
      <Button size="sm" variant="outline" onClick={() => run.mutate("remove")}>Decline</Button>
    </div>
  );
  return <Button size="sm" variant="outline" onClick={() => run.mutate("remove")}>Cancel request</Button>;
}
