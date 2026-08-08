import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { Download, GraduationCap, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { CertificateRow, Student } from "@/lib/cert-service";
import { certificateDownloadUrl } from "@/lib/cert-service";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Student Certificate Portal | Certificate Distribution System" },
      {
        name: "description",
        content: "Student certificate download portal for retrieving a certificate using their mobile number.",
      },
      {
        property: "og:title",
        content: "Student Certificate Portal | Certificate Distribution System",
      },
      {
        property: "og:description",
        content: "Download event certificates using the registered mobile number.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CertificateDownloadPortalPage,
});

function CertificateDownloadPortalPage() {
  const search = Route.useSearch();
  const [mobile, setMobile] = useState("");
  const [busy, setBusy] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [certificate, setCertificate] = useState<CertificateRow | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (search.mobile) {
      setMobile(search.mobile);
    }
  }, [search.mobile]);

  useEffect(() => {
    if (search.mobile && !searched && !busy) {
      const normalized = search.mobile.replace(/[^\d]/g, "").trim();
      if (normalized.length >= 10) {
        doLookup(normalized);
      }
    }
  }, [search.mobile, searched, busy]);

  async function doLookup(normalizedMobile: string) {
    setError(null);
    setStudent(null);
    setCertificate(null);
    setDownloadUrl(null);
    setSearched(true);

    setBusy(true);
    try {
      const fallback = await lookupLocalCertificate(normalizedMobile);
      if (fallback) {
        setStudent(fallback.student);
        setCertificate(fallback.certificate);
        setDownloadUrl(fallback.downloadUrl);
        return;
      }

      const { data: studentRows, error: studentError } = await supabase
        .from("students")
        .select("*");

      if (studentError) {
        if (studentError.message.includes("mobile_number") || studentError.message.includes("column")) {
          setError("Student mobile lookup is not available in the current database schema.");
          return;
        }
        throw new Error(studentError.message);
      }

      const matchedStudent = (studentRows ?? []).find((row) => {
        const student = row as Student;
        const source = String(student.mobile_number ?? "").replace(/[^\d]/g, "").trim();
        return source === normalizedMobile;
      }) as Student | undefined;

      if (!matchedStudent) {
        setError("No certificate record was found for this mobile number.");
        return;
      }

      const { data: certRows, error: certError } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", matchedStudent.id)
        .maybeSingle();

      if (certError) throw new Error(certError.message);

      if (!certRows) {
        setError("A certificate is not available for this student yet.");
        return;
      }

      const cert = certRows as CertificateRow;
      if (!cert.file_path) {
        setError("The certificate file is not available for this student yet.");
        return;
      }

      const signedUrl = await certificateDownloadUrl(cert.file_path);

      setStudent(matchedStudent);
      setCertificate(cert);
      setDownloadUrl(signedUrl);
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Unable to retrieve certificate.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  async function lookupLocalCertificate(mobile: string): Promise<{
    student: Student;
    certificate: CertificateRow;
    downloadUrl: string;
  } | null> {
    const storageKey = "electro-hunt-certificates";

    if (typeof window === "undefined") {
      return null;
    }

    const now = new Date().toISOString();
    const existing = window.localStorage.getItem(storageKey);
    if (!existing) {
      const seed = {
        records: [
          {
            id: "local-student-1",
            name: "Student",
            email: "student@gmail.com",
            mobile_number: "6380161093",
            gender: "Male",
            department: null,
            class: null,
            event: "ELECTRO HUNT '26",
            certificate_type: "Participation",
            created_at: now,
          },
        ],
      };

      window.localStorage.setItem(storageKey, JSON.stringify(seed));
    }

    const payload = JSON.parse(window.localStorage.getItem(storageKey) ?? "{\"records\":[]}");
    const record = (payload.records ?? []).find((item: any) => {
      const stored = String(item.mobile_number ?? "").replace(/[^\d]/g, "").trim();
      return stored === mobile;
    });

    if (!record) {
      return null;
    }

    const staticFile = `/certificates/${mobile}.jpeg`;

    return {
      student: {
        id: record.id,
        name: record.name,
        email: record.email,
        mobile_number: record.mobile_number,
        gender: record.gender,
        department: record.department,
        class: record.class,
        event: record.event,
        certificate_type: record.certificate_type,
        created_at: record.created_at,
      },
      certificate: {
        id: "local-certificate-1",
        student_id: record.id,
        certificate_code: `EH-${mobile}`,
        file_path: staticFile,
        file_name: `${mobile}.jpeg`,
        status: "Generated",
        generated_at: now,
      },
      downloadUrl: staticFile,
    };
  }

  function lookupCertificate(event: FormEvent) {
    event.preventDefault();
    const normalized = mobile.replace(/[^\d]/g, "").trim();
    if (normalized.length < 10) {
      setError("Enter a valid mobile number to search for your certificate.");
      return;
    }
    doLookup(normalized);
  }

  return (
    <div className="min-h-screen bg-secondary px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <GraduationCap className="size-6" />
            </span>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Certificate Portal
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">ELECTRO HUNT '26</h1>
              <div className="mt-1 text-sm font-medium text-muted-foreground">Download Certificate</div>
            </div>
          </div>
          <Badge variant="outline" className="hidden md:inline-flex">
            Event Certificate Access
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-[0.92fr_1.08fr]">
          <section className="surface-card p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Student Certificate Retrieval</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter the registered mobile number used during certificate generation.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-5">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={lookupCertificate} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobile}
                  placeholder="e.g. 9876543210"
                  onChange={(event) => setMobile(event.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={busy}>
                {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Search className="mr-2 size-4" />}
                {busy ? "Searching..." : "Retrieve Certificate"}
              </Button>
            </form>

            <div className="mt-6 rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              <div className="font-medium text-foreground">Need help?</div>
              <div className="mt-1">
                Contact the event coordinator if your certificate is not visible with your registered mobile number.
              </div>
            </div>
          </section>

          <aside className="surface-card p-6 md:p-8">
            {student && certificate && downloadUrl ? (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Certificate Found
                  </span>
                  <h2 className="mt-2 text-2xl font-semibold">{student.name}</h2>
                </div>

                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Event</div>
                    <div className="mt-1 font-medium">{student.event ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Certificate Code</div>
                    <div className="mt-1 font-mono text-sm">{certificate.certificate_code}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Certificate Type</div>
                    <div className="mt-1 font-medium">{student.certificate_type ?? "Participation"}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Status</div>
                    <div className="mt-1">
                      <Badge variant="secondary">{certificate.status}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 size-4" /> Download PDF
                    </a>
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setStudent(null);
                    setCertificate(null);
                    setDownloadUrl(null);
                    setMobile("");
                    setSearched(false);
                  }}>
                    Search Another
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                  <GraduationCap className="size-6 text-muted-foreground" />
                </div>
                <div className="text-lg font-semibold">No certificate selected</div>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Search with the student's mobile number to view the linked certificate.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}