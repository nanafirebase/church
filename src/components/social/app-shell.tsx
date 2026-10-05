import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, Home, LogOut, User, Users } from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMyProfile } from "@/lib/social";
import { UserAvatar } from "./user-avatar";
import { Button } from "@/components/ui/button";

export function AppShell({ children, user }: { children: ReactNode; user: { id: string } }) {
  const { data: me } = useMyProfile(user.id);
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const nav = [
    { to: "/feed", label: "Feed", icon: Home },
    { to: "/friends", label: "Friends", icon: Users },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-20 text-foreground md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><BookOpen className="size-4" /></span>
            <span className="font-display text-xl font-semibold">Unfold Jesus</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground" activeProps={{ className: "text-foreground bg-muted" }}>{n.label}</Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {me && <Link to="/u/$username" params={{ username: me.username }} aria-label="My profile"><UserAvatar profile={me} className="size-9" /></Link>}
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-border bg-background md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted-foreground" activeProps={{ className: "text-primary" }}>
            <n.icon className="size-5" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
