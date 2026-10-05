import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Unfold Jesus" },
      { name: "description", content: "Sign in or create your Unfold Jesus account to ask, reply, and connect with friends." },
      { property: "og:title", content: "Sign in — Unfold Jesus" },
      { property: "og:description", content: "Join a thoughtful community exploring questions about Jesus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: () => ({ mode: ("signin" as "signin" | "signup" | "forgot") as unknown }),
  component: AuthPage,
});

type Mode = "signin" | "signup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<Mode>(typeof search.mode === "string" && ["signin", "signup", "forgot"].includes(search.mode) ? (search.mode as Mode) : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((e, s) => { if (s && e === "SIGNED_IN") navigate({ to: "/feed" }); });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/feed", data: { display_name: name, username } },
        });
        if (error) throw error;
        if (!data.session) setNotice("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setNotice("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error("Google sign-in failed");
  };

  const titles: Record<Mode, string> = { signin: "Welcome back", signup: "Create your account", forgot: "Reset your password" };

  return (
    <div className="grid min-h-screen place-items-center bg-secondary/55 px-4 py-10">
      <div className="w-full max-w-md border border-border bg-card p-6 shadow-card sm:p-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><BookOpen className="size-4" /></span>
          <span className="font-display text-xl font-semibold">Unfold Jesus</span>
        </Link>
        <h1 className="mt-6 font-display text-3xl font-semibold">{titles[mode]}</h1>

        {mode !== "forgot" && (
          <>
            <Button type="button" variant="outline" className="mt-6 w-full" size="lg" onClick={google}>Continue with Google</Button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />or<span className="h-px flex-1 bg-border" /></div>
          </>
        )}

        <form onSubmit={submit} className={mode === "forgot" ? "mt-6 space-y-4" : "space-y-4"}>
          {mode === "signup" && (
            <>
              <div className="space-y-1.5"><Label htmlFor="name">Display name</Label><Input id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div className="space-y-1.5"><Label htmlFor="username">Username</Label><Input id="username" required pattern="[a-zA-Z0-9_]{3,20}" title="3–20 letters, numbers or underscores" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
            </>
          )}
          <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          {mode !== "forgot" && (
            <div className="space-y-1.5">
              <div className="flex justify-between"><Label htmlFor="password">Password</Label>
                {mode === "signin" && <button type="button" onClick={() => setMode("forgot")} className="text-xs font-medium text-primary hover:underline">Forgot password?</button>}
              </div>
              <Input id="password" type="password" required minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Please wait…" : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
          </Button>
        </form>
        {notice && <p className="mt-4 rounded-md bg-support-soft p-3 text-sm text-support" role="status">{notice}</p>}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signin" ? <>New here? <button onClick={() => setMode("signup")} className="font-semibold text-primary hover:underline">Create an account</button></>
            : <>Already have an account? <button onClick={() => setMode("signin")} className="font-semibold text-primary hover:underline">Sign in</button></>}
        </p>
      </div>
    </div>
  );
}
