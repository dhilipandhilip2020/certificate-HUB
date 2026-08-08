import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

function applyVars(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, key: string) => vars[key] ?? "");
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function postToResend(payload: Record<string, unknown>) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "Email service is not configured. Add the RESEND_API_KEY secret in project settings before sending certificates.",
    );
  }
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Resend request failed [${res.status}]: ${text}`);
    throw new Error(`Email provider rejected the message [${res.status}]: ${text}`);
  }
  return text;
}

/** Reports whether the email provider key is configured (no secret value is returned). */
export const getEmailProviderStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => ({ configured: Boolean(process.env["RESEND_API_KEY"]) }));

/** Sends a harmless preview message to the administrator's own test address. */
export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { toEmail: string }) => input)
  .handler(async ({ data, context }) => {
    if (!isValidEmail(data.toEmail)) throw new Error("The test email address is not valid.");

    const { data: settings } = await context.supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    const vars = {
      student_name: "Sample Student",
      event_name: "Electro Hunt 2026",
      department: "EEE",
      class: "EEE A",
      certificate_id: "CERT-SAMPLE-0001",
    };
    const subject = `[TEST] ${applyVars(settings?.subject ?? "Certificate", vars)}`;
    const body = applyVars(settings?.body ?? "", vars);

    await postToResend({
      from: `${settings?.from_name ?? "Certificate Distribution Team"} <${settings?.from_email ?? "onboarding@resend.dev"}>`,
      to: [data.toEmail.trim()],
      subject,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(body)}</div><hr/><p style="font-family:Arial,sans-serif;font-size:12px;color:#667">This is a test message. No certificate is attached.</p>`,
    });

    return { sent: true };
  });

/**
 * Sends one student's generated certificate as a PDF attachment and records
 * the outcome in the email log. Never sends to an invalid address.
 */
export const sendCertificateEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { studentId: string }) => input)
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;

    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("id", data.studentId)
      .maybeSingle();
    if (studentError) throw new Error(studentError.message);
    if (!student) throw new Error("Student not found.");

    const { data: cert } = await supabase
      .from("certificates")
      .select("*")
      .eq("student_id", student.id)
      .maybeSingle();

    const { data: settings } = await supabase
      .from("app_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    const { data: existingLog } = await supabase
      .from("email_logs")
      .select("*")
      .eq("student_id", student.id)
      .maybeSingle();

    const attempts = (existingLog?.attempts ?? 0) + 1;

    const writeLog = async (fields: Record<string, unknown>) => {
      const row = {
        student_id: student.id,
        certificate_id: cert?.id ?? null,
        to_email: student.email,
        subject: (fields["subject"] as string) ?? existingLog?.subject ?? null,
        attempts,
        ...fields,
      };
      if (existingLog) {
        await supabase.from("email_logs").update(row).eq("id", existingLog.id);
      } else {
        await supabase.from("email_logs").insert(row);
      }
    };

    const fail = async (message: string) => {
      await writeLog({ status: "Failed", error: message });
      throw new Error(message);
    };

    if (!isValidEmail(student.email)) await fail("Invalid email address — nothing was sent.");
    if (!cert?.file_path) await fail("No certificate has been generated for this student yet.");
    if (existingLog?.status === "Sent")
      return { sent: false, skipped: true, reason: "Already sent to this student." };

    const { data: file, error: fileError } = await supabase.storage
      .from("generated-certificates")
      .download(cert!.file_path!);
    if (fileError || !file) await fail("The generated certificate file could not be read from storage.");

    const bytes = new Uint8Array(await file!.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192) {
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    }
    const base64 = btoa(binary);

    const vars = {
      student_name: student.name,
      event_name: student.event ?? "",
      department: student.department ?? "",
      class: student.class ?? "",
      certificate_id: cert!.certificate_code,
    };
    const subject = applyVars(settings?.subject ?? "Your certificate", vars);
    const body = applyVars(settings?.body ?? "", vars);

    try {
      await postToResend({
        from: `${settings?.from_name ?? "Certificate Distribution Team"} <${settings?.from_email ?? "onboarding@resend.dev"}>`,
        to: [student.email.trim()],
        subject,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap">${escapeHtml(body)}</div>`,
        attachments: [{ filename: cert!.file_name ?? "Certificate.pdf", content: base64 }],
      });
    } catch (error) {
      await writeLog({
        status: "Failed",
        subject,
        error: error instanceof Error ? error.message : "Unknown sending error",
      });
      throw error;
    }

    await writeLog({ status: "Sent", subject, error: null, sent_at: new Date().toISOString() });
    await supabase.from("certificates").update({ status: "Sent" }).eq("id", cert!.id);

    return { sent: true };
  });
