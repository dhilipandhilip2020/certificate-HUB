import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { GraduationCap, Loader2, ShieldCheck, Smartphone, Lock, ArrowRight, CheckCircle2, AlertCircle, User, Hash, FileCheck, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { verifyMobileInCsv, saveStudentSession, type CsvStudent } from "@/lib/csv-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Student Certificate Portal | Mahendra Engineering College" },
      {
        name: "description",
        content: "Verify your mobile number against the CSV database and generate your official certificate with Name and Register Number.",
      },
      { property: "og:title", content: "Student Certificate Portal" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"student" | "admin">("student");
  
  // Step workflow state: 1 = Mobile Verification, 2 = Name & Register Number Form
  const [step, setStep] = useState<1 | 2>(1);
  
  // Student input state
  const [mobile, setMobile] = useState("9003886998");
  const [verifiedRecord, setVerifiedRecord] = useState<CsvStudent | null>(null);
  
  const [studentName, setStudentName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [eventName, setEventName] = useState("ELECTRO HUNT '26");
  const [department, setDepartment] = useState("EEE");

  // Admin Login state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
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

  /** Step 1: Verify mobile number against allowed_students.csv */
  async function handleMobileCheckSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanMobile = mobile.replace(/[^\d]/g, "").trim();
    if (!cleanMobile || cleanMobile.length < 7) {
      setError("Please enter a valid mobile number (at least 7 to 10 digits).");
      return;
    }

    setBusy(true);
    try {
      // Search allowed_students.csv for this mobile number
      const match = await verifyMobileInCsv(cleanMobile);

      if (!match) {
        setError(
          `Access Denied: Mobile number ${cleanMobile} is not registered in the CSV database. Please check your number or contact the event coordinator.`
        );
        return;
      }

      // Mobile Verification Approved! Save record and move to Step 2
      setVerifiedRecord(match);
      setStudentName(match.name || "");
      setRegisterNumber(match.register_number || "");
      setEventName(match.event || "ELECTRO HUNT '26");
      setDepartment(match.department || "EEE");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error reading CSV database.");
    } finally {
      setBusy(false);
    }
  }

  /** Step 2: Confirm Name & Register Number and generate certificate */
  function handleCertificateFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!studentName.trim()) {
      setError("Please enter your Student Name.");
      return;
    }

    if (!registerNumber.trim()) {
      setError("Please enter your Register Number / Roll No.");
      return;
    }

    // Save student session
    const sessionData = {
      mobile: mobile.replace(/[^\d]/g, "").trim(),
      name: studentName.trim(),
      registerNumber: registerNumber.trim(),
      event: eventName.trim() || "ELECTRO HUNT '26",
      department: department.trim() || "EEE",
      verifiedAt: new Date().toISOString(),
    };
    saveStudentSession(sessionData);

    // Open next page showing certificate
    navigate({
      to: "/download",
      search: {
        mobile: sessionData.mobile,
        name: sessionData.name,
        reg: sessionData.registerNumber,
        event: sessionData.event,
      },
      replace: false,
    });
  }

  async function handleAdminSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adminEmail.trim())) {
      setError("Please enter a valid admin email address.");
      return;
    }
    if (adminPassword.length < 4) {
      setError("Please enter your admin password.");
      return;
    }
    setBusy(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
      if (signInError) throw signInError;
      navigate({ to: "/dashboard", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid administrator credentials.");
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary lg:flex-row">
      {/* Left Sidebar Banner */}
      <div className="hidden flex-1 flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <header className="brand-header">
          <div className="brand-header__inner">
            <span className="brand-header__icon">
              <GraduationCap className="size-6" />
            </span>
            <div className="brand-header__text">
              <div className="brand-header__college">
                Mahendra Engineering College (Autonomous)
              </div>
              <div className="brand-header__department">
                Department of Electrical and Electronics Engineering (EEE)
              </div>
              <div className="brand-header__system">
                Certificate Distribution System
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <CheckCircle2 className="size-3.5" /> CSV Verified Portal
          </div>
          <h2 className="text-4xl leading-tight font-bold text-sidebar-foreground">
            {step === 1
              ? "Verify your registered mobile number to get your certificate."
              : "Enter your Name & Register Number for instant certificate generation."}
          </h2>
          <p className="text-sidebar-foreground/80 leading-relaxed">
            {step === 1
              ? "Your mobile number will be checked against the official event CSV database. Only registered numbers will be granted access."
              : "Confirm your full name and college register number. Your official certificate will be generated and ready for instant PDF download."}
          </p>
        </div>

        <p className="flex items-center gap-2 text-sm text-sidebar-foreground/70">
          <ShieldCheck className="size-4" />
          CSV Authentication & Dynamic Certificate Generator
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header Branding */}
          <div className="mb-6 lg:hidden text-center">
            <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-3">
              <GraduationCap className="size-6" />
            </div>
            <h2 className="text-xl font-bold">Mahendra Engineering College</h2>
            <p className="text-xs text-muted-foreground">Department of EEE - Certificate System</p>
          </div>

          <Tabs
            value={mode}
            onValueChange={(v) => {
              setError(null);
              setMode(v as "student" | "admin");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student" className="gap-2 font-medium">
                <Smartphone className="size-4" /> Student Portal
              </TabsTrigger>
              <TabsTrigger value="admin" className="gap-2 font-medium">
                <Lock className="size-4" /> Admin Login
              </TabsTrigger>
            </TabsList>

            {/* STUDENT PORTAL */}
            <TabsContent value="student" className="mt-4">
              {step === 1 ? (
                /* STEP 1: MOBILE NUMBER CSV VERIFICATION */
                <div className="surface-card p-8 rounded-2xl border border-border shadow-sm">
                  <div className="mb-6 space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                      Step 1 of 2: Mobile Authentication
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Enter Mobile Number</h1>
                    <p className="text-sm text-muted-foreground">
                      We check your mobile number against the event CSV database.
                    </p>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="mb-5">
                      <AlertCircle className="size-4" />
                      <AlertTitle>Access Rejected</AlertTitle>
                      <AlertDescription className="mt-1 text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleMobileCheckSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="student-mobile" className="font-semibold">
                        Registered Mobile Number
                      </Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="student-mobile"
                          type="tel"
                          inputMode="numeric"
                          placeholder="e.g. 6380161093"
                          className="pl-10 text-base font-medium"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Mobile number must be present in <code className="bg-muted px-1 rounded">allowed_students.csv</code>.
                      </p>
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2 font-semibold" disabled={busy}>
                      {busy ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Verifying CSV Database...
                        </>
                      ) : (
                        <>
                          Verify Mobile & Proceed <ArrowRight className="size-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 rounded-xl bg-muted/60 p-3.5 text-center text-xs text-muted-foreground space-y-1">
                    <div className="font-semibold text-foreground">Demo Registered Mobile Numbers:</div>
                    <div className="font-mono text-primary font-medium">6380161093 • 9876543210 • 9123456789</div>
                  </div>
                </div>
              ) : (
                /* STEP 2: STUDENT NAME & REGISTER NUMBER FORM */
                <div className="surface-card p-8 rounded-2xl border border-border shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                        <CheckCircle2 className="size-3.5" /> Mobile Verified
                      </div>
                      <h1 className="text-2xl font-bold tracking-tight mt-0.5">Certificate Details</h1>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStep(1);
                        setError(null);
                      }}
                      className="text-xs gap-1 text-muted-foreground"
                    >
                      <RefreshCw className="size-3" /> Change Number
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="mb-5">
                      <AlertCircle className="size-4" />
                      <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleCertificateFormSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="student-name" className="font-semibold">
                        Student Full Name *
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="student-name"
                          placeholder="e.g. Dhilip Kumar S"
                          className="pl-10 font-medium"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">This name will be printed on your official certificate.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="register-number" className="font-semibold">
                        College Register Number / Roll No *
                      </Label>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
                        <Input
                          id="register-number"
                          placeholder="e.g. 611221105012"
                          className="pl-10 font-mono font-medium"
                          value={registerNumber}
                          onChange={(e) => setRegisterNumber(e.target.value)}
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Register number will be printed on your certificate.</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="event-name" className="text-xs text-muted-foreground">Event Name</Label>
                      <Input
                        id="event-name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2 font-semibold bg-emerald-600 hover:bg-emerald-700 mt-2">
                      <FileCheck className="size-5" /> Generate & Open Official Certificate
                    </Button>
                  </form>
                </div>
              )}
            </TabsContent>

            {/* ADMIN LOGIN */}
            <TabsContent value="admin" className="mt-4">
              <div className="surface-card p-8 rounded-2xl border border-border shadow-sm">
                <div className="mb-6 space-y-1">
                  <h1 className="text-2xl font-bold tracking-tight">Administrator Login</h1>
                  <p className="text-sm text-muted-foreground">
                    Sign in to manage student rosters and certificate templates.
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive" className="mb-5">
                    <AlertCircle className="size-4" />
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@college.edu"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full font-semibold" disabled={busy}>
                    {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Log In to Admin Console
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
