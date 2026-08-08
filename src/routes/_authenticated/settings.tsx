import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2, Save, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getEmailProviderStatus, sendTestEmail } from "@/lib/email.functions";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Certificate Distribution System" },
      {
        name: "description",
        content: "Configure the sender identity, email subject and message template, and send a test email.",
      },
      { property: "og:title", content: "Settings | Certificate Distribution System" },
      {
        property: "og:description",
        content: "Configure sender identity, email template and send a test email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

interface Settings {
  id: number;
  subject: string;
  body: string;
  from_name: string;
  from_email: string;
}

const VARIABLES = [
  ["{{student_name}}", "The student's full name"],
  ["{{event_name}}", "The event the student attended"],
  ["{{department}}", "The student's department"],
  ["{{class}}", "The student's class or section"],
  ["{{certificate_id}}", "The unique certificate code"],
] as const;

function SettingsPage() {
  const queryClient = useQueryClient();
  const providerStatus = useServerFn(getEmailProviderStatus);
  const testEmail = useServerFn(sendTestEmail);
  const [form, setForm] = useState<Settings | null>(null);
  const [testTo, setTestTo] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const { data: provider } = useQuery({
    queryKey: ["email-provider"],
    queryFn: () => providerStatus({}),
  });

  const { data: settings } = useQuery({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Settings | null;
    },
  });

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  async function save() {
    if (!form) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.from_email.trim())) {
      toast.error("Please enter a valid sender email address.");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("app_settings")
        .update({
          subject: form.subject.trim(),
          body: form.body,
          from_name: form.from_name.trim(),
          from_email: form.from_email.trim(),
        })
        .eq("id", 1);
      if (error) throw new Error(error.message);
      toast.success("Settings saved.");
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function runTest() {
    setTesting(true);
    try {
      await testEmail({ data: { toEmail: testTo } });
      toast.success("Test email sent. Check that inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Test email failed.");
    } finally {
      setTesting(false);
    }
  }

  return (
    <AdminLayout
      title="Settings"
      description="Sender details, email wording and delivery checks"
      actions={
        <Button disabled={!form || saving} onClick={save}>
          {saving ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Save className="mr-2 size-4" />}
          Save settings
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="surface-card space-y-5 p-6">
          <h2 className="text-base font-semibold">Email content</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="from_name">Sender name</Label>
              <Input
                id="from_name"
                value={form?.from_name ?? ""}
                onChange={(e) => setForm((p) => (p ? { ...p, from_name: e.target.value } : p))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from_email">Sender email</Label>
              <Input
                id="from_email"
                type="email"
                value={form?.from_email ?? ""}
                onChange={(e) => setForm((p) => (p ? { ...p, from_email: e.target.value } : p))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject line</Label>
            <Input
              id="subject"
              value={form?.subject ?? ""}
              onChange={(e) => setForm((p) => (p ? { ...p, subject: e.target.value } : p))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              rows={12}
              value={form?.body ?? ""}
              onChange={(e) => setForm((p) => (p ? { ...p, body: e.target.value } : p))}
            />
            <p className="text-xs text-muted-foreground">
              The certificate PDF is attached automatically to every message.
            </p>
          </div>

          <div className="rounded-lg border border-border p-4">
            <h3 className="text-sm font-semibold">Available placeholders</h3>
            <p className="text-xs text-muted-foreground">
              Type these anywhere in the subject or message — each student gets their own values.
            </p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {VARIABLES.map(([token, meaning]) => (
                <li key={token} className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-xs">{token}</code>
                  <span className="text-muted-foreground">{meaning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          <div className="surface-card space-y-3 p-6">
            <h2 className="text-base font-semibold">Email service</h2>
            {provider?.configured ? (
              <p className="flex items-center gap-2 text-sm text-success">
                <CheckCircle2 className="size-4" /> Connected and ready to send.
              </p>
            ) : (
              <>
                <p className="flex items-center gap-2 text-sm text-destructive">
                  <XCircle className="size-4" /> Not configured yet.
                </p>
                <Alert>
                  <AlertDescription className="text-sm">
                    Sending needs an email provider key (RESEND_API_KEY) stored in the project
                    secrets. Ask in chat to set it up and certificates will start delivering.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>

          <div className="surface-card space-y-3 p-6">
            <h2 className="text-base font-semibold">Send a test email</h2>
            <p className="text-xs text-muted-foreground">
              Sends the message to one address of your choice. No certificate is attached and no
              student is contacted.
            </p>
            <Input
              type="email"
              placeholder="you@college.edu"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
            />
            <Button className="w-full" disabled={!testTo || testing} onClick={runTest}>
              {testing ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Send className="mr-2 size-4" />
              )}
              Send test email
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
