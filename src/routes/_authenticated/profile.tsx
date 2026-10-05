import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { db, useMyProfile } from "@/lib/social";
import { UserAvatar } from "@/components/social/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Edit profile — Unfold Jesus" }, { name: "description", content: "Update your profile photo, name, and bio." }] }),
  component: EditProfile,
});

function EditProfile() {
  const { user } = Route.useRouteContext();
  const { data: me } = useMyProfile(user.id);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ display_name: "", username: "", bio: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (me) setForm({ display_name: me.display_name, username: me.username, bio: me.bio }); }, [me]);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["profile"] }); qc.invalidateQueries({ queryKey: ["posts"] }); };

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5 MB"); return; }
    setUploading(true);
    const path = `${user.id}/${Date.now()}.${file.name.split(".").pop() || "jpg"}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) await db.from("profiles").update({ avatar_url: path }).eq("id", user.id);
    setUploading(false);
    if (error) { toast.error("Upload failed"); return; }
    toast.success("Profile photo updated");
    refresh();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await db.from("profiles").update({ ...form, username: form.username.toLowerCase() }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.code === "23505" ? "That username is taken" : "Couldn't save"); return; }
    toast.success("Profile saved");
    refresh();
  };

  return (
    <form onSubmit={save} className="space-y-5 border border-border bg-card p-5 sm:p-6">
      <h1 className="font-display text-3xl font-semibold">Edit profile</h1>
      <div className="flex items-center gap-4">
        <button type="button" onClick={() => fileRef.current?.click()} className="group relative rounded-full" aria-label="Change profile photo">
          <UserAvatar profile={me} className="size-24 text-3xl" />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-foreground/40 text-background opacity-0 transition-opacity group-hover:opacity-100"><Camera /></span>
        </button>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? "Uploading…" : "Change photo"}</Button>
          <p className="mt-1 text-xs text-muted-foreground">JPG or PNG, up to 5 MB.</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      </div>
      <div className="space-y-1.5"><Label htmlFor="dn">Display name</Label><Input id="dn" required maxLength={50} value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></div>
      <div className="space-y-1.5"><Label htmlFor="un">Username</Label><Input id="un" required pattern="[a-zA-Z0-9_]{3,20}" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
      <div className="space-y-1.5"><Label htmlFor="bio">Bio</Label><Textarea id="bio" maxLength={300} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        {me && <Button asChild variant="outline"><Link to="/u/$username" params={{ username: me.username }}>View profile</Link></Button>}
      </div>
    </form>
  );
}
