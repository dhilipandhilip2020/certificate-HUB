import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Download, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  certificateDownloadUrl,
  fetchActiveTemplate,
  generateForStudent,
  loadTemplateAsset,
  type CertificateRow,
  type LoadedTemplate,
  type Student,
} from "@/lib/cert-service";
import { renderCertificateToCanvas } from "@/lib/certificate";

export const Route = createFileRoute("/_authenticated/generate")({
  head: () => ({
    meta: [
      { title: "Generate Certificates | Certificate Distribution System" },
      {
        name: "description",
        content: "Generate individual PDF certificates for selected students and preview them before sending.",
      },
      { property: "og:title", content: "Generate Certificates | Certificate Distribution System" },
      {
        property: "og:description",
        content: "Generate individual PDF certificates for selected students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeneratePage,
});

function GeneratePage() {
  const queryClient = useQueryClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });
  const [previewFor, setPreviewFor] = useState<Student | null>(null);

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

  const { data: templateRow } = useQuery({
    queryKey: ["active-template"],
    queryFn: fetchActiveTemplate,
  });

  const certByStudent = useMemo(
    () => new Map(certificates.map((c) => [c.student_id, c])),
    [certificates],
  );

  const selectedIds = Object.keys(selected).filter((id) => selected[id]);
  const allChecked = students.length > 0 && selectedIds.length === students.length;

  async function withTemplate(): Promise<LoadedTemplate | null> {
    if (!templateRow) {
      toast.error("Upload and save a certificate template first.");
      return null;
    }
    try {
      return await loadTemplateAsset(templateRow);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Template could not be loaded.");
      return null;
    }
  }

  async function generate(ids: string[]) {
    if (!ids.length) {
      toast.error("Select at least one student.");
      return;
    }
    const template = await withTemplate();
    if (!template) return;

    setRunning(true);
    setProgress({ done: 0, total: ids.length, failed: 0 });
    let failed = 0;

    for (const [index, id] of ids.entries()) {
      const student = students.find((s) => s.id === id);
      if (!student) continue;
      try {
        await generateForStudent(student, template);
      } catch (error) {
        failed += 1;
        toast.error(
          `${student.name}: ${error instanceof Error ? error.message : "generation failed"}`,
        );
      }
      setProgress({ done: index + 1, total: ids.length, failed });
    }

    URL.revokeObjectURL(template.objectUrl);
    setRunning(false);
    queryClient.invalidateQueries({ queryKey: ["certificates"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    toast.success(
      `Generated ${ids.length - failed} certificate(s)${failed ? `, ${failed} failed` : ""}. No emails were sent.`,
    );
  }

  async function openPreview(student: Student) {
    const template = await withTemplate();
    if (!template) return;
    setPreviewFor(student);
    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        renderCertificateToCanvas(
          canvasRef.current,
          img,
          img.naturalWidth,
          img.naturalHeight,
          template.config,
          student.name,
          student.gender,
        );
      }
      URL.revokeObjectURL(template.objectUrl);
    };
    img.src = template.objectUrl;
  }

  async function download(path: string) {
    try {
      const url = await certificateDownloadUrl(path);
      window.open(url, "_blank", "noopener");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open the certificate.");
    }
  }

  return (
    <AdminLayout
      title="Generate Certificates"
      description="Create the PDF certificate for each student — sending happens separately"
      actions={
        <>
          <Button
            variant="outline"
            disabled={running || !students.length}
            onClick={() => generate(students.map((s) => s.id))}
          >
            Generate for all
          </Button>
          <Button disabled={running || !selectedIds.length} onClick={() => generate(selectedIds)}>
            {running ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Award className="mr-2 size-4" />
            )}
            Generate selected ({selectedIds.length})
          </Button>
        </>
      }
    >
      {!templateRow && (
        <Alert className="mb-6">
          <AlertDescription>
            No active certificate template. Go to{" "}
            <Link to="/template" className="font-medium text-primary underline">
              Certificate Template
            </Link>{" "}
            to upload one first.
          </AlertDescription>
        </Alert>
      )}

      {progress.total > 0 && (
        <div className="surface-card mb-6 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {running ? "Generating certificates…" : "Generation finished"}
            </span>
            <span className="text-muted-foreground">
              {progress.done} / {progress.total}
              {progress.failed > 0 && ` · ${progress.failed} failed`}
            </span>
          </div>
          <Progress className="mt-3" value={(progress.done / progress.total) * 100} />
        </div>
      )}

      <div className="surface-card p-6">
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={allChecked}
                    onCheckedChange={(checked) =>
                      setSelected(
                        checked
                          ? Object.fromEntries(students.map((s) => [s.id, true]))
                          : {},
                      )
                    }
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Certificate code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No students yet — import them from the Students page.
                  </TableCell>
                </TableRow>
              )}
              {students.map((student) => {
                const cert = certByStudent.get(student.id);
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
                    <TableCell>{student.event ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {cert?.certificate_code ?? "—"}
                    </TableCell>
                    <TableCell>
                      {cert ? (
                        <Badge variant="secondary">{cert.status}</Badge>
                      ) : (
                        <Badge variant="outline">Not generated</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openPreview(student)}>
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={!cert?.file_path}
                        onClick={() => cert?.file_path && download(cert.file_path)}
                      >
                        <Download className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={Boolean(previewFor)} onOpenChange={(open) => !open && setPreviewFor(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview — {previewFor?.name}</DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-lg border border-border bg-secondary">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
