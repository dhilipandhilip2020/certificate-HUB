import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, GraduationCap, Loader2, ArrowLeft, LogOut, CheckCircle2, Award, User, Hash, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getStudentSession, clearStudentSession, type StudentSessionData } from "@/lib/csv-auth";
import { generateCertificateDataUrlAsync, generateFullCertificatePdf } from "@/lib/cert-canvas";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download Official Certificate | Mahendra Engineering College" },
      {
        name: "description",
        content: "View and download your official event certificate filled with your Name and Register Number.",
      },
      { property: "og:title", content: "Download Official Certificate" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CertificateDownloadPortalPage,
});

function CertificateDownloadPortalPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  
  const [session, setSession] = useState<StudentSessionData | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve student session data
    const stored = getStudentSession();
    
    const name = search.name || stored?.name || "Dhilip Kumar S";
    const registerNumber = search.reg || stored?.registerNumber || "611221105012";
    const mobile = search.mobile || stored?.mobile || "6380161093";
    const event = search.event || stored?.event || "PROJECT EXPO - 2026";
    const department = stored?.department || "EEE";

    const activeSession: StudentSessionData = {
      mobile,
      name,
      registerNumber,
      event,
      department,
      verifiedAt: stored?.verifiedAt || new Date().toISOString(),
    };

    setSession(activeSession);

    // Render live filled template preview using 6380161093.jpeg background template
    setLoadingPreview(true);
    generateCertificateDataUrlAsync({
      studentName: activeSession.name,
      registerNumber: activeSession.registerNumber,
      eventName: activeSession.event,
      department: activeSession.department,
      mobileNumber: activeSession.mobile,
    })
      .then((dataUrl) => {
        setPreviewUrl(dataUrl);
      })
      .catch((err) => {
        console.error("Error generating certificate preview:", err);
      })
      .finally(() => {
        setLoadingPreview(false);
      });
  }, [search.name, search.reg, search.mobile, search.event]);

  async function handleDownloadPdf() {
    if (!session) return;
    setDownloading(true);
    setError(null);

    try {
      // Build raw PDF filled with Name & Register Number over 6380161093.jpeg
      const pdfBytes = await generateFullCertificatePdf({
        studentName: session.name,
        registerNumber: session.registerNumber,
        eventName: session.event,
        department: session.department,
        mobileNumber: session.mobile,
      });

      // Trigger instant browser download
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = session.name.replace(/[^a-zA-Z0-9]/g, "_");
      link.download = `Certificate_${safeName}_${session.registerNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate PDF download.");
    } finally {
      setDownloading(false);
    }
  }

  function handleLogout() {
    clearStudentSession();
    navigate({ to: "/", replace: true });
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Navigation Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Back to Login">
              <ArrowLeft className="size-5" />
            </Button>
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Mahendra Engineering College (Autonomous)
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Official Event Certificate</h1>
              <div className="text-xs text-muted-foreground">Department of Electrical and Electronics Engineering</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 py-1 px-3 bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
              <CheckCircle2 className="size-3.5" /> Mobile Verified Student
            </Badge>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="size-4" /> Start Over / Exit
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Generation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_2.2fr]">
          {/* Left Column: Student Details Card */}
          <div className="space-y-6">
            <div className="surface-card p-6 rounded-2xl border border-border shadow-sm space-y-6">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Award className="size-3.5" /> Template Filled & Ready
                </div>
                <h2 className="mt-3 text-2xl font-bold text-foreground">{session.name}</h2>
                <p className="text-sm font-mono text-muted-foreground">Reg. No: {session.registerNumber}</p>
              </div>

              <div className="space-y-3 divide-y divide-border/60 text-sm">
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <User className="size-3.5" /> Name:
                  </span>
                  <span className="font-semibold text-foreground">{session.name}</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Hash className="size-3.5" /> Register No:
                  </span>
                  <span className="font-mono font-bold text-foreground">{session.registerNumber}</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Mobile No:</span>
                  <span className="font-mono text-foreground">{session.mobile}</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Event:</span>
                  <span className="font-semibold text-foreground">PROJECT EXPO - 2026</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-muted-foreground font-medium">Department:</span>
                  <span className="font-medium text-foreground">Electrical and Electronics Engineering</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  size="lg"
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  className="w-full gap-2 font-semibold shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="size-5 animate-spin" /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="size-5" /> Download Official Certificate (PDF)
                    </>
                  )}
                </Button>

                <Button variant="outline" size="sm" onClick={() => navigate({ to: "/", replace: true })} className="w-full gap-1.5">
                  <RefreshCw className="size-3.5" /> Edit Details / Change Mobile Number
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Filled Certificate Preview */}
          <div className="surface-card p-6 rounded-2xl border border-border shadow-sm flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Filled Certificate Preview</h3>
                <p className="text-xs text-muted-foreground">
                  Template: <code className="bg-muted px-1 rounded">6380161093.jpeg</code> | Slot filled with: <strong>{session.name} ({session.registerNumber})</strong>
                </p>
              </div>
              <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                Official Template
              </Badge>
            </div>

            <div className="flex-1 min-h-[460px] rounded-xl border border-border bg-slate-900/5 p-2 flex items-center justify-center overflow-hidden">
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground py-12">
                  <Loader2 className="size-8 animate-spin mb-2 text-primary" />
                  <span>Loading template & filling Name & Register Number...</span>
                </div>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt={`Official Filled Certificate for ${session.name}`}
                  className="max-h-[520px] w-auto max-w-full rounded-lg object-contain shadow-lg border border-border"
                />
              ) : (
                <div className="text-sm text-destructive">Could not load preview.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}