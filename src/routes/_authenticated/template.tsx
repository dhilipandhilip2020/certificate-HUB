import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_CONFIG,
  mergeConfig,
  renderCertificateToCanvas,
  type Align,
  type CertConfig,
  type FontFamily,
} from "@/lib/certificate";
import { fetchActiveTemplate, type TemplateRow } from "@/lib/cert-service";

export const Route = createFileRoute("/_authenticated/template")({
  head: () => ({
    meta: [
      { title: "Certificate Template | Certificate Distribution System" },
      {
        name: "description",
        content:
          "Upload a certificate background and position the student name and Mr./Mrs. strike-through visually.",
      },
      { property: "og:title", content: "Certificate Template | Certificate Distribution System" },
      {
        property: "og:description",
        content: "Upload a certificate background and position the student name visually.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TemplatePage,
});

function TemplatePage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<CertConfig>(DEFAULT_CONFIG);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sampleName, setSampleName] = useState("Kavin Balaji");
  const [sampleGender, setSampleGender] = useState("Male");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: template, isLoading } = useQuery({
    queryKey: ["active-template"],
    queryFn: fetchActiveTemplate,
  });

  useEffect(() => {
    if (!template) return;
    setConfig(mergeConfig(template.config));
    let revoked: string | null = null;
    (async () => {
      const { data, error } = await supabase.storage
        .from("certificate-templates")
        .download(template.file_path);
      if (error || !data) {
        toast.error("Could not load the saved template image.");
        return;
      }
      const url = URL.createObjectURL(data);
      revoked = url;
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = url;
    })();
    return () => {
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [template]);

  useEffect(() => {
    if (!image || !canvasRef.current) return;
    renderCertificateToCanvas(
      canvasRef.current,
      image,
      image.naturalWidth,
      image.naturalHeight,
      config,
      sampleName || "Student Name",
      sampleGender,
    );
  }, [image, config, sampleName, sampleGender]);

  const set = <K extends keyof CertConfig>(key: K, value: CertConfig[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a PNG or JPG image of the certificate background.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Please keep the template image under 10 MB.");
      return;
    }
    setUploading(true);
    try {
      const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]+/g, "_")}`;
      const { error: upErr } = await supabase.storage
        .from("certificate-templates")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw new Error(upErr.message);

      await supabase
        .from("certificate_templates")
        .update({ is_active: false })
        .eq("is_active", true);

      const { error: insErr } = await supabase.from("certificate_templates").insert({
        name: file.name,
        file_path: path,
        mime_type: file.type,
        config: config as unknown as Record<string, number | string | boolean>,
        is_active: true,
      });
      if (insErr) throw new Error(insErr.message);

      toast.success("Template uploaded. Position the name below, then save.");
      queryClient.invalidateQueries({ queryKey: ["active-template"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function save(row: TemplateRow) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("certificate_templates")
        .update({ config: config as unknown as Record<string, number | string | boolean> })
        .eq("id", row.id);
      if (error) throw new Error(error.message);
      toast.success("Layout saved. New certificates will use these positions.");
      queryClient.invalidateQueries({ queryKey: ["active-template"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the layout.");
    } finally {
      setSaving(false);
    }
  }

  const dimensions = useMemo(
    () => (image ? { w: image.naturalWidth, h: image.naturalHeight } : { w: 1200, h: 900 }),
    [image],
  );

  return (
    <AdminLayout
      title="Certificate Template"
      description="Upload the blank certificate design and place the student name exactly where it belongs"
      actions={
        <>
          <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Upload className="mr-2 size-4" />
            )}
            {template ? "Replace template" : "Upload template"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Button disabled={!template || saving} onClick={() => template && save(template)}>
            {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
            Save layout
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="surface-card p-10 text-center text-muted-foreground">Loading template…</div>
      ) : !template ? (
        <Alert>
          <AlertDescription>
            No template uploaded yet. Upload a PNG or JPG of your blank certificate (the design
            without any student name) to begin.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="surface-card p-4">
            <div className="mb-3 flex flex-wrap items-end gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Preview name</Label>
                <Input
                  className="w-56"
                  value={sampleName}
                  onChange={(e) => setSampleName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Preview gender</Label>
                <Select value={sampleGender} onValueChange={setSampleGender}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-muted-foreground">
                Template size: {dimensions.w} × {dimensions.h} px
              </p>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-secondary">
              <canvas ref={canvasRef} className="block h-auto w-full" />
            </div>
          </div>

          <div className="surface-card space-y-5 p-6">
            <div>
              <h2 className="text-base font-semibold">Name placement</h2>
              <p className="text-xs text-muted-foreground">
                Coordinates are in template pixels, measured from the top-left corner.
              </p>
            </div>

            <NumberField label="Horizontal position (X)" value={config.nameX} max={dimensions.w} onChange={(v) => set("nameX", v)} />
            <NumberField label="Vertical position (Y)" value={config.nameY} max={dimensions.h} onChange={(v) => set("nameY", v)} />
            <NumberField label="Font size" value={config.fontSize} min={8} max={200} onChange={(v) => set("fontSize", v)} />
            <NumberField label="Letter spacing" value={config.letterSpacing} min={-5} max={40} onChange={(v) => set("letterSpacing", v)} />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Font</Label>
                <Select
                  value={config.fontFamily}
                  onValueChange={(v) => set("fontFamily", v as FontFamily)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Times">Times (serif)</SelectItem>
                    <SelectItem value="Helvetica">Helvetica (sans)</SelectItem>
                    <SelectItem value="Courier">Courier (mono)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Alignment</Label>
                <Select value={config.align} onValueChange={(v) => set("align", v as Align)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="bold">Bold text</Label>
              <Switch id="bold" checked={config.bold} onCheckedChange={(v) => set("bold", v)} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Text colour</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-background"
                  value={config.color}
                  onChange={(e) => set("color", e.target.value)}
                />
                <Input value={config.color} onChange={(e) => set("color", e.target.value)} />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="title">Mr./Mrs. strike-through</Label>
                  <p className="text-xs text-muted-foreground">
                    Strikes out the title that doesn't apply — never the name.
                  </p>
                </div>
                <Switch
                  id="title"
                  checked={config.titleEnabled}
                  onCheckedChange={(v) => set("titleEnabled", v)}
                />
              </div>

              {config.titleEnabled && (
                <div className="mt-4 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Position a line over each printed title. For a male student the "Mrs." line is
                    struck; for a female student the "Mr." line is struck.
                  </p>
                  <NumberField label="Mr. line — X" value={config.mrX} max={dimensions.w} onChange={(v) => set("mrX", v)} />
                  <NumberField label="Mr. line — Y" value={config.mrY} max={dimensions.h} onChange={(v) => set("mrY", v)} />
                  <NumberField label="Mr. line — width" value={config.mrWidth} min={5} max={400} onChange={(v) => set("mrWidth", v)} />
                  <NumberField label="Mrs. line — X" value={config.mrsX} max={dimensions.w} onChange={(v) => set("mrsX", v)} />
                  <NumberField label="Mrs. line — Y" value={config.mrsY} max={dimensions.h} onChange={(v) => set("mrsY", v)} />
                  <NumberField label="Mrs. line — width" value={config.mrsWidth} min={5} max={400} onChange={(v) => set("mrsWidth", v)} />
                  <NumberField label="Line thickness" value={config.strikeThickness} min={1} max={12} onChange={(v) => set("strikeThickness", v)} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = 2000,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <Input
          type="number"
          className="h-7 w-20 text-right"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={([v]) => onChange(v ?? 0)}
      />
    </div>
  );
}
