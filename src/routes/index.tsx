import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2, ShieldCheck, UserRound, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Certificate Distribution System" },
      {
        name: "description",
        content:
          "Student certificate portal and administrator login for the Certificate Distribution System.",
      },
      { property: "og:title", content: "Certificate Distribution System" },
      {
        property: "og:description",
        content: "Download event certificates or access the admin dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"electrohunt" | "admin">("electrohunt");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("student@gmail.com");
  const [password, setPassword] = useState("student");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) navigate({ to: "/dashboard", replace: true });
      else setChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleElectrohuntSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const normalized = email.trim().toLowerCase();
    if (normalized !== "student@gmail.com" || password !== "student") {
      setError("The default student credentials are student@gmail.com / student.");
      return;
    }

    setBusy(true);
    try {
      navigate({ to: "/download", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) throw signInError;
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary lg:flex-row">
      <div className="hidden flex-1 flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-6" />
          </span>
          <span className="text-lg font-semibold">Certificate Distribution System</span>
        </div>
        <div className="max-w-md space-y-4">
          <h2 className="text-4xl leading-tight font-semibold text-sidebar-foreground">
            {mode === "electrohunt"
              ? "Download your event certificate."
              : "Generate and deliver student certificates in minutes."}
          </h2>
          <p className="text-sidebar-foreground/75">
            {mode === "electrohunt"
              ? "Students can securely retrieve their generated certificates using the mobile number that was registered for the event."
              : "Import students from Excel, design the name placement once, generate individual PDF certificates and email them securely — all from a single console."}
          </p>
        </div>
        <p className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
          <ShieldCheck className="size-4" />
          {mode === "electrohunt" ? "Electrohunt student access" : "Administrator access only"}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "electrohunt" | "admin")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="electrohunt" className="gap-2">
                <GraduationCap className="size-4" /> Electrohunt
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2">
                <Lock className="size-4" /> Admin
              </TabsTrigger>
            </TabsList>

            <TabsContent value="electrohunt" className="mt-4">
              <div className="surface-card p-8">
                <div className="mb-6 space-y-1 text-center lg:text-left">
                  <h1 className="text-2xl font-semibold">Electrohunt Login</h1>
                  <p className="text-sm text-muted-foreground">
                    Sign in with the default student account to open the certificate portal.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleElectrohuntSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input
                      id="student-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input
                      id="student-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Login
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Default student: student@gmail.com / student
                </p>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="mt-4">
              <div className="surface-card p-8">
                <div className="mb-6 space-y-1 text-center lg:text-left">
                  <h1 className="text-2xl font-semibold">Administrator Login</h1>
                  <p className="text-sm text-muted-foreground">
                    Sign in to access the certificate dashboard.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="admin@college.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Login
                  </Button>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
