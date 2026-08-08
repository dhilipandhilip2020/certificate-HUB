import { supabase } from "@/integrations/supabase/client";
import { generateCertificatePdf } from "./pdf-certificate";
import { mergeConfig, makeCertificateCode, safeFileName, type CertConfig } from "./certificate";

export interface Student {
  id: string;
  name: string;
  email: string;
  mobile_number: string | null;
  gender: string;
  department: string | null;
  class: string | null;
  event: string | null;
  certificate_type: string | null;
  created_at: string;
}

export interface TemplateRow {
  id: string;
  name: string;
  file_path: string;
  mime_type: string | null;
  config: unknown;
  is_active: boolean;
  created_at: string;
}

export interface CertificateRow {
  id: string;
  student_id: string;
  certificate_code: string;
  file_path: string | null;
  file_name: string | null;
  status: string;
  generated_at: string;
}

export interface EmailLogRow {
  id: string;
  student_id: string | null;
  certificate_id: string | null;
  to_email: string;
  subject: string | null;
  status: string;
  attempts: number;
  error: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface LoadedTemplate {
  row: TemplateRow;
  config: CertConfig;
  bytes: Uint8Array;
  mimeType: string;
  objectUrl: string;
}

export async function fetchActiveTemplate(): Promise<TemplateRow | null> {
  const { data, error } = await supabase
    .from("certificate_templates")
    .select("*")
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as TemplateRow) ?? null;
}

export async function loadTemplateAsset(row: TemplateRow): Promise<LoadedTemplate> {
  const { data, error } = await supabase.storage
    .from("certificate-templates")
    .download(row.file_path);
  if (error || !data) throw new Error("Could not download the certificate template file.");
  const bytes = new Uint8Array(await data.arrayBuffer());
  const mimeType = row.mime_type ?? data.type ?? "image/png";
  return {
    row,
    config: mergeConfig(row.config),
    bytes,
    mimeType,
    objectUrl: URL.createObjectURL(new Blob([bytes], { type: mimeType })),
  };
}

/** Generates the PDF for one student, uploads it privately and records it. */
export async function generateForStudent(student: Student, template: LoadedTemplate) {
  const pdfBytes = await generateCertificatePdf(
    { bytes: template.bytes, mimeType: template.mimeType },
    template.config,
    student.name,
    student.gender,
  );

  const code = makeCertificateCode();
  const fileName = safeFileName(student.name);
  const normalizedMobile = String(student.mobile_number ?? "").replace(/[^\d]/g, "").trim();
  const folder = normalizedMobile || student.id;
  const path = `${folder}/${code}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("generated-certificates")
    .upload(path, new Blob([pdfBytes as BlobPart], { type: "application/pdf" }), {
      contentType: "application/pdf",
      upsert: true,
    });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { error: dbError } = await supabase.from("certificates").upsert(
    {
      student_id: student.id,
      template_id: template.row.id,
      certificate_code: code,
      file_path: path,
      file_name: fileName,
      status: "Generated",
      generated_at: new Date().toISOString(),
    },
    { onConflict: "student_id" },
  );
  if (dbError) throw new Error(dbError.message);

  return { code, path, fileName };
}

export async function certificateDownloadUrl(path: string) {
  const { data, error } = await supabase.storage
    .from("generated-certificates")
    .createSignedUrl(path, 60 * 10);
  if (error || !data) throw new Error("Could not create a download link.");
  return data.signedUrl;
}
