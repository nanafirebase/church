import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Loader2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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
type Method = "email" | "phone";

function AuthPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const initialMode: Mode = typeof search.mode === "string" && ["signin", "signup", "forgot"].includes(search.mode) ? (search.mode as Mode) : "signin";

  const [mode, setMode] = useState<Mode>(initialMode);
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((e, s) => {
      if (s && e === "SIGNED_IN") navigate({ to: "/feed" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const formatPhone = (raw: string) => {
    let v = raw.replace(/[^\d+]/g, "");
    if (!v.startsWith("+") && v.length > 0) v = "+" + v;
    return v;
  };

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) { toast.error("Enter a valid phone number with country code"); return; }
    setBusy(true);
    setNotice("");
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone, options: { channel: "sms" } });
      if (error) throw error;
      setOtpSent(true);
      setNotice("Verification code sent to your phone.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send code");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { toast.error("Enter the 6-digit code"); return; }
    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, options: { redirectTo: window.location.origin + "/feed" } });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

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
        if (!data.session) setNotice("Account created. You can now sign in.");
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

  const switchMode = (m: Mode) => {
    setMode(m);
    setNotice("");
    setOtpSent(false);
    setOtp("");
  };

  const titles: Record<Mode, string> = { signin: "Welcome back", signup: "Create your account", forgot: "Reset your password" };
  const subtitles: Record<Mode, string> = {
    signin: "Sign in to continue your journey",
    signup: "Join a thoughtful community exploring faith",
    forgot: "We'll send you a reset link",
  };

  const showMethodTabs = mode !== "forgot";

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-secondary/55 px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_oklab,var(--primary)_8%,transparent),transparent)]" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div className="border border-border bg-card p-6 shadow-card sm:p-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" />
            <span>Back home</span>
          </Link>

          <div className="mt-4 flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground"><BookOpen className="size-5" /></span>
            <span className="font-display text-xl font-semibold">Unfold Jesus</span>
          </div>

          <h1 className="mt-6 font-display text-3xl font-semibold leading-tight">{titles[mode]}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitles[mode]}</p>

          {showMethodTabs && (
            <div className="mt-6 grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
              <button
                type="button"
                onClick={() => setMethod("email")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                  method === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Mail className="size-4" /> Email
              </button>
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-sm px-3 py-2 text-sm font-medium transition-colors",
                  method === "phone" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Phone className="size-4" /> Phone
              </button>
            </div>
          )}

          {showMethodTabs && (
            <>
              <Button type="button" variant="outline" className={cn("w-full", method === "email" ? "mt-6" : "mt-5")} size="lg" onClick={google}>
                <GoogleIcon className="size-5" /> Continue with Google
              </Button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />or{showMethodTabs ? ` use ${method}` : ""}<span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          {showMethodTabs && method === "phone" ? (
            otpSent ? (
              <form onSubmit={verifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp">Verification code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    required
                    placeholder="123456"
                    className="text-center text-lg tracking-[0.4em]"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  <p className="text-xs text-muted-foreground">Sent to {phone}</p>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={busy}>
                  {busy ? <><Loader2 className="size-4 animate-spin" /> Verifying…</> : "Verify code"}
                </Button>
                <button type="button" onClick={() => { setOtpSent(false); setOtp(""); setNotice(""); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
                  Use a different number
                </button>
              </form>
            ) : (
              <form onSubmit={sendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+1 555 000 1234"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">Include your country code, e.g. +1 for US.</p>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={busy}>
                  {busy ? <><Loader2 className="size-4 animate-spin" /> Sending…</> : "Send code"}
                </Button>
              </form>
            )
          ) : (
            <form onSubmit={submit} className={cn("space-y-4", !showMethodTabs && "mt-6")}>
              {mode === "signup" && (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Display name</Label>
                    <Input id="name" required maxLength={50} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" required pattern="[a-zA-Z0-9_]{3,20}" title="3–20 letters, numbers or underscores" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="yourname" />
                  </div>
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              {mode !== "forgot" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "signin" && (
                      <button type="button" onClick={() => switchMode("forgot")} className="text-xs font-medium text-primary hover:underline">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                </div>
              )}
              <Button type="submit" className="w-full" size="lg" disabled={busy}>
                {busy ? <><Loader2 className="size-4 animate-spin" /> Please wait…</> : mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
              </Button>
            </form>
          )}

          {notice && (
            <p className="mt-4 rounded-md bg-support-soft p-3 text-sm text-support" role="status">
              {notice}
            </p>
          )}

          {mode !== "forgot" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {mode === "signin" ? (
                <>New here? <button onClick={() => switchMode("signup")} className="font-semibold text-primary hover:underline">Create an account</button></>
              ) : (
                <>Already have an account? <button onClick={() => switchMode("signin")} className="font-semibold text-primary hover:underline">Sign in</button></>
              )}
            </p>
          )}
          {mode === "forgot" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <button onClick={() => switchMode("signin")} className="font-semibold text-primary hover:underline">Back to sign in</button>
            </p>
          )}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing you agree to keep this community respectful and kind.
        </p>
      </div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
