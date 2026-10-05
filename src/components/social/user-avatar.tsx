import { useAvatarUrl, type Profile } from "@/lib/social";
import { cn } from "@/lib/utils";

export function UserAvatar({ profile, className }: { profile?: Pick<Profile, "avatar_url" | "display_name" | "username"> | null | undefined; className?: string }) {
  const { data: url } = useAvatarUrl(profile?.avatar_url);
  const initial = (profile?.display_name || profile?.username || "?").charAt(0).toUpperCase();
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary font-semibold text-secondary-foreground", className)}>
      {url ? <img src={url} alt={profile?.display_name ?? ""} className="size-full object-cover" /> : initial}
    </span>
  );
}
