import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Award, MailCheck, MailX, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard | Certificate Distribution System" },
      {
        name: "description",
        content: "Overview of students, generated certificates and email delivery results.",
      },
      { property: "og:title", content: "Dashboard | Certificate Distribution System" },
      {
        property: "og:description",
        content: "Overview of students, generated certificates and email delivery results.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

async function loadStats() {
  const [students, certs, sent, failed, template] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }),
    supabase.from("certificates").select("*", { count: "exact", head: true }),
    supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "Sent"),
    supabase.from("email_logs").select("*", { count: "exact", head: true }).eq("status", "Failed"),
    supabase.from("certificate_templates").select("id").eq("is_active", true).maybeSingle(),
  ]);
  return {
    students: students.count ?? 0,
    certificates: certs.count ?? 0,
    sent: sent.count ?? 0,
    failed: failed.count ?? 0,
    hasTemplate: Boolean(template.data),
  };
}

const CARDS = [
  { key: "students", label: "Total Students", icon: Users, tone: "text-primary bg-accent" },
  { key: "certificates", label: "Certificates Generated", icon: Award, tone: "text-primary bg-accent" },
  { key: "sent", label: "Emails Sent", icon: MailCheck, tone: "text-success bg-success/10" },
  { key: "failed", label: "Emails Failed", icon: MailX, tone: "text-destructive bg-destructive/10" },
] as const;

function DashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ["dashboard-stats"], queryFn: loadStats });

  const steps = [
    { label: "Upload students from Excel", done: (data?.students ?? 0) > 0, to: "/students" as const },
    { label: "Upload & configure certificate template", done: Boolean(data?.hasTemplate), to: "/template" as const },
    { label: "Generate certificates", done: (data?.certificates ?? 0) > 0, to: "/generate" as const },
    { label: "Send certificates by email", done: (data?.sent ?? 0) > 0, to: "/distribution" as const },
  ];

  return (
    <AdminLayout title="Dashboard" description="Certificate generation and delivery at a glance">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((card) => (
          <div key={card.key} className="surface-card p-5">
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <span className={`flex size-9 items-center justify-center rounded-lg ${card.tone}`}>
                <card.icon className="size-4" />
              </span>
            </div>
            {isLoading ? (
              <Skeleton className="mt-3 h-9 w-16" />
            ) : (
              <p className="mt-3 text-3xl font-semibold tabular-nums">{data?.[card.key] ?? 0}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="surface-card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Workflow progress</h2>
          <p className="text-sm text-muted-foreground">
            Complete each step in order. Nothing is emailed until you explicitly send it.
          </p>
          <ol className="mt-5 space-y-2">
            {steps.map((step, index) => (
              <li key={step.label}>
                <Link
                  to={step.to}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-secondary"
                >
                  {step.done ? (
                    <CheckCircle2 className="size-5 shrink-0 text-success" />
                  ) : (
                    <Circle className="size-5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-sm font-medium">
                    {index + 1}. {step.label}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="surface-card p-6">
          <h2 className="text-lg font-semibold">Quick links</h2>
          <div className="mt-4 space-y-2 text-sm">
            {[
              { to: "/students", label: "Manage students" },
              { to: "/template", label: "Certificate template editor" },
              { to: "/generate", label: "Generate certificates" },
              { to: "/history", label: "Email history & retries" },
              { to: "/settings", label: "Settings & test email" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center justify-between rounded-lg px-3 py-2 font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {link.label}
                <ArrowRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
