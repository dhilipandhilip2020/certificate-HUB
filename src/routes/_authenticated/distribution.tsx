import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { sendCertificateEmail, getEmailProviderStatus } from "@/lib/email.functions";
import type { CertificateRow, EmailLogRow, Student } from "@/lib/cert-service";

export const Route = createFileRoute("/_authenticated/distribution")({
  head: () => ({
    meta: [
      { title: "Email Distribution | Certificate Distribution System" },
      {
        name: "description",
        content: "Send generated certificates to students by email in bulk with live progress and status tracking.",
      },
      { property: "og:title", content: "Email Distribution | Certificate Distribution System" },
      {
        property: "og:description",
        content: "Send generated certificates to students by email with live progress tracking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DistributionPage,
});

interface Settings {
  id: number;
  subject: string;
  body: string;
  from_name: string;
  from_email: string;
}

function DistributionPage() {
  const queryClient = useQueryClient();
  const sendEmail = useServerFn(sendCertificateEmail);
  const providerStatus = useServerFn(getEmailProviderStatus);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0, skipped: 0 });

  const { data: provider } = useQuery({
    queryKey: ["email-provider"],
    queryFn: () => providerStatus({}),
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").order("name");
      if (error) throw new Error(error.message);
      return (data ?? []) as Student[];
    },
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("certificates").select("*");
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

  const { data: settings } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw new Error(error.message);
      return data as Settings | null;
    },
  });

  const certByStudent = useMemo(
    () => new Map(certificates.map((c) => [c.student_id, c])),
    [certificates],
  );
  const logByStudent = useMemo(
    () => new Map(logs.filter((l) => l.student_id).map((l) => [l.student_id!, l])),
    [logs],
  );

  const sendable = students.filter((s) => certByStudent.has(s.id));
  const selectedIds = Object.keys(selected).filter((id) => selected[id]);

  async function sendAll(ids: string[]) {
    if (!ids.length) {
      toast.error("Select at least one student with a generated certificate.");
      return;
    }
    setSending(true);
    setProgress({ done: 0, total: ids.length, failed: 0, skipped: 0 });
    let failed = 0;
    let skipped = 0;

    for (const [index, id] of ids.entries()) {
      const student = students.find((s) => s.id === id);
      try {
        const result = await sendEmail({ data: { studentId: id } });
        if (result && "skipped" in result && result.skipped) skipped += 1;
      } catch (error) {
        failed += 1;
        toast.error(
          `${student?.name ?? "Student"}: ${error instanceof Error ? error.message : "send failed"}`,
        );
      }
      setProgress({ done: index + 1, total: ids.length, failed, skipped });
      queryClient.invalidateQueries({ queryKey: ["email-logs"] });
    }

    setSending(false);
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    queryClient.invalidateQueries({ queryKey: ["certificates"] });
    toast.success(
      `Finished: ${ids.length - failed - skipped} sent${failed ? `, ${failed} failed` : ""}${
        skipped ? `, ${skipped} already sent` : ""
      }.`,
    );
  }

  return (
    <AdminLayout
      title="Email Distribution"
      description="Send each student their own certificate as a PDF attachment"
      actions={
        <>
          <Button
            variant="outline"
            disabled={sending || !sendable.length}
            onClick={() => sendAll(sendable.map((s) => s.id))}
          >
            Send to all ({sendable.length})
          </Button>
          <Button disabled={sending || !selectedIds.length} onClick={() => sendAll(selectedIds)}>
            {sending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Send className="mr-2 size-4" />
            )}
            Send selected ({selectedIds.length})
          </Button>
        </>
      }
    >
      {provider && !provider.configured && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            The email service isn't configured yet, so sending will fail. Open{" "}
            <Link to="/settings" className="font-medium underline">
              Settings
            </Link>{" "}
            to finish setup.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="surface-card p-6">
          {progress.total > 0 && (
            <div className="mb-5 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{sending ? "Sending emails…" : "Sending finished"}</span>
                <span className="text-muted-foreground">
                  {progress.done} / {progress.total}
                  {progress.failed > 0 && ` · ${progress.failed} failed`}
                  {progress.skipped > 0 && ` · ${progress.skipped} skipped`}
                </span>
              </div>
              <Progress className="mt-3" value={(progress.done / progress.total) * 100} />
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={sendable.length > 0 && selectedIds.length === sendable.length}
                      onCheckedChange={(checked) =>
                        setSelected(
                          checked ? Object.fromEntries(sendable.map((s) => [s.id, true])) : {},
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sendable.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No generated certificates yet. Generate them first on the{" "}
                      <Link to="/generate" className="font-medium text-primary underline">
                        Generate
                      </Link>{" "}
                      page.
                    </TableCell>
                  </TableRow>
                )}
                {sendable.map((student) => {
                  const log = logByStudent.get(student.id);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={Boolean(selected[student.id])}
                          onCheckedChange={(checked) =>
                            setSelected((prev) => ({ ...prev, [student.id]: Boolean(checked) }))
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{log?.attempts ?? 0}</TableCell>
                      <TableCell>
                        <StatusBadge status={log?.status} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="surface-card space-y-4 p-6">
          <div>
            <h2 className="text-base font-semibold">Email content</h2>
            <p className="text-xs text-muted-foreground">
              This is the message every student receives. Edit it in Settings.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">From</Label>
            <Input readOnly value={`${settings?.from_name ?? ""} <${settings?.from_email ?? ""}>`} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Subject</Label>
            <Input readOnly value={settings?.subject ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Message</Label>
            <Textarea readOnly rows={10} value={settings?.body ?? ""} />
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/settings">Edit email content</Link>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: string | undefined }) {
  if (status === "Sent") return <Badge className="bg-success text-success-foreground">Sent</Badge>;
  if (status === "Failed") return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">Pending</Badge>;
}
