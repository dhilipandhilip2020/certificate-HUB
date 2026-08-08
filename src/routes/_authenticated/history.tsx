import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sendCertificateEmail } from "@/lib/email.functions";
import {
  certificateDownloadUrl,
  type CertificateRow,
  type EmailLogRow,
  type Student,
} from "@/lib/cert-service";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({
    meta: [
      { title: "Email History | Certificate Distribution System" },
      {
        name: "description",
        content: "Full record of generated certificates, delivery status, errors and retry actions.",
      },
      { property: "og:title", content: "Email History | Certificate Distribution System" },
      {
        property: "og:description",
        content: "Full record of certificate delivery status, errors and retries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const queryClient = useQueryClient();
  const sendEmail = useServerFn(sendCertificateEmail);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [retrying, setRetrying] = useState<string | null>(null);

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*");
      if (error) throw new Error(error.message);
      return (data ?? []) as Student[];
    },
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("generated_at", { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as CertificateRow[];
    },
  });

  const { data: logs = [] } = useQuery({
    queryKey: ["email-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("email_logs").select("*");
      if (error) throw new Error(error.message);
      return (data ?? []) as EmailLogRow[];
    },
  });

  const studentById = useMemo(() => new Map(students.map((s) => [s.id, s])), [students]);
  const logByStudent = useMemo(
    () => new Map(logs.filter((l) => l.student_id).map((l) => [l.student_id!, l])),
    [logs],
  );

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return certificates
      .map((cert) => ({
        cert,
        student: studentById.get(cert.student_id),
        log: logByStudent.get(cert.student_id),
      }))
      .filter(({ cert, student, log }) => {
        const rowStatus = log?.status ?? "Pending";
        if (status !== "all" && rowStatus !== status) return false;
        if (!term) return true;
        return (
          (student?.name ?? "").toLowerCase().includes(term) ||
          (student?.email ?? "").toLowerCase().includes(term) ||
          cert.certificate_code.toLowerCase().includes(term)
        );
      });
  }, [certificates, studentById, logByStudent, search, status]);

  async function retry(studentId: string) {
    setRetrying(studentId);
    try {
      await sendEmail({ data: { studentId } });
      toast.success("Retry sent.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Retry failed.");
    } finally {
      setRetrying(null);
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    }
  }

  async function download(path: string) {
    try {
      window.open(await certificateDownloadUrl(path), "_blank", "noopener");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open the certificate.");
    }
  }

  return (
    <AdminLayout
      title="Email History"
      description="Every certificate that was generated, with its delivery result"
      actions={
        <Button
          variant="outline"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["email-logs"] });
            queryClient.invalidateQueries({ queryKey: ["certificates"] });
          }}
        >
          <RefreshCw className="mr-2 size-4" /> Refresh
        </Button>
      }
    >
      <div className="surface-card p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, email or certificate code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Certificate code</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Nothing to show yet.
                  </TableCell>
                </TableRow>
              )}
              {rows.map(({ cert, student, log }) => (
                <TableRow key={cert.id}>
                  <TableCell className="font-medium">{student?.name ?? "—"}</TableCell>
                  <TableCell>{student?.email ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{cert.certificate_code}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(cert.generated_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log?.sent_at ? new Date(log.sent_at).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell>{log?.attempts ?? 0}</TableCell>
                  <TableCell>
                    {log?.status === "Sent" ? (
                      <Badge className="bg-success text-success-foreground">Sent</Badge>
                    ) : log?.status === "Failed" ? (
                      <Badge variant="destructive" title={log.error ?? undefined}>
                        Failed
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={!cert.file_path}
                      onClick={() => cert.file_path && download(cert.file_path)}
                    >
                      <Download className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={retrying === cert.student_id}
                      onClick={() => retry(cert.student_id)}
                    >
                      {retrying === cert.student_id ? "Sending…" : "Resend"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {rows.some(({ log }) => log?.status === "Failed") && (
          <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h3 className="text-sm font-semibold text-destructive">Failure details</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {rows
                .filter(({ log }) => log?.status === "Failed")
                .map(({ cert, student, log }) => (
                  <li key={cert.id}>
                    <span className="font-medium text-foreground">{student?.name}</span>:{" "}
                    {log?.error ?? "Unknown error"}
                  </li>
                ))}
            </ul>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
