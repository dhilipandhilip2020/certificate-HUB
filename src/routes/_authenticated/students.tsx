import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { AlertTriangle, Download, Pencil, Search, Trash2, Upload, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Student } from "@/lib/cert-service";
import { normalizeGender } from "@/lib/certificate";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({
    meta: [
      { title: "Students | Certificate Distribution System" },
      {
        name: "description",
        content: "Import students from Excel, review validation errors and manage participant data.",
      },
      { property: "og:title", content: "Students | Certificate Distribution System" },
      {
        property: "og:description",
        content: "Import students from Excel and manage participant records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudentsPage,
});

interface ParsedRow {
  name: string;
  email: string;
  mobile_number: string;
  gender: string;
  department: string;
  class: string;
  event: string;
  certificate_type: string;
  rowNumber: number;
  errors: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function pick(row: Record<string, unknown>, keys: string[]) {
  for (const key of Object.keys(row)) {
    const normalized = key.trim().toLowerCase().replace(/[\s_]+/g, "");
    if (keys.includes(normalized)) return String(row[key] ?? "").trim();
  }
  return "";
}

function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Student[];
    },
  });
}

function StudentsPage() {
  const queryClient = useQueryClient();
  const { data: students = [], isLoading } = useStudents();
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [cls, setCls] = useState("all");
  const [event, setEvent] = useState("all");
  const [editing, setEditing] = useState<Partial<Student> | null>(null);

  const options = useMemo(() => {
    const unique = (values: (string | null)[]) =>
      Array.from(new Set(values.filter((v): v is string => Boolean(v && v.trim())))).sort();
    return {
      departments: unique(students.map((s) => s.department)),
      classes: unique(students.map((s) => s.class)),
      events: unique(students.map((s) => s.event)),
    };
  }, [students]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return students.filter(
      (s) =>
        (dept === "all" || s.department === dept) &&
        (cls === "all" || s.class === cls) &&
        (event === "all" || s.event === event) &&
        (!term || s.name.toLowerCase().includes(term) || s.email.toLowerCase().includes(term)),
    );
  }, [students, search, dept, cls, event]);

  async function handleFile(file: File) {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) throw new Error("The workbook has no sheets.");
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName]!, {
        defval: "",
      });
      if (!rows.length) throw new Error("The first sheet is empty.");

      const existingEmails = new Set(students.map((s) => s.email.toLowerCase()));
      const seen = new Set<string>();

      const result: ParsedRow[] = rows.map((row, index) => {
        const name = pick(row, ["name", "studentname", "fullname"]);
        const email = pick(row, ["email", "emailaddress", "mail"]).toLowerCase();
        const mobile_number = pick(row, ["mobile", "mobile_number", "mobilenumber", "phone", "phone_number"]);
        const gender = pick(row, ["gender", "sex"]);
        const errors: string[] = [];

        if (!name) errors.push("Missing student name");
        if (!email) errors.push("Missing email");
        else if (!EMAIL_RE.test(email)) errors.push("Invalid email address");
        if (!gender) errors.push("Missing gender");
        if (mobile_number && mobile_number.replace(/[^\d]/g, "").length < 10) {
          errors.push("Invalid mobile number");
        }
        if (email && seen.has(email)) errors.push("Duplicate email in this file");
        if (email && existingEmails.has(email)) errors.push("Email already exists in the system");
        if (email) seen.add(email);

        return {
          name,
          email,
          mobile_number,
          gender: gender ? normalizeGender(gender) : "",
          department: pick(row, ["department", "dept", "branch"]),
          class: pick(row, ["class", "section", "classsection"]),
          event: pick(row, ["event", "eventname"]),
          certificate_type: pick(row, ["certificatetype", "certtype", "type"]) || "Participation",
          rowNumber: index + 2,
          errors,
        };
      });

      setParsed(result);
      toast.success(`Read ${result.length} row(s) from ${file.name}. Nothing has been saved yet.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read the Excel file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const importMutation = useMutation({
    mutationFn: async (rows: ParsedRow[]) => {
      const payload = rows.map((r) => ({
        name: r.name,
        email: r.email,
        mobile_number: r.mobile_number ? r.mobile_number.replace(/[^\d]/g, "").trim() || null : null,
        gender: r.gender,
        department: r.department || null,
        class: r.class || null,
        event: r.event || null,
        certificate_type: r.certificate_type || "Participation",
      }));
      const { error } = await supabase.from("students").insert(payload);
      if (error) throw new Error(error.message);
      return payload.length;
    },
    onSuccess: (count) => {
      toast.success(`${count} student(s) imported. No emails were sent.`);
      setParsed(null);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: async (student: Partial<Student>) => {
      if (!student.name?.trim()) throw new Error("Student name is required.");
      if (!student.email || !EMAIL_RE.test(student.email)) throw new Error("A valid email is required.");
      const payload = {
        name: student.name.trim(),
        email: student.email.trim().toLowerCase(),
        mobile_number: student.mobile_number ? student.mobile_number.replace(/[^\d]/g, "").trim() || null : null,
        gender: normalizeGender(student.gender),
        department: student.department || null,
        class: student.class || null,
        event: student.event || null,
        certificate_type: student.certificate_type || "Participation",
      };
      const query = student.id
        ? supabase.from("students").update(payload).eq("id", student.id)
        : supabase.from("students").insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Student saved.");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Student removed.");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function downloadTemplateWorkbook() {
    const sheet = XLSX.utils.json_to_sheet([
      {
        Name: "Kavin B",
        Email: "kavin@example.com",
        Gender: "Male",
        Department: "EEE",
        Class: "EEE A",
        Event: "Electro Hunt 2026",
        "Certificate Type": "Participation",
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Students");
    XLSX.writeFile(wb, "Student_Import_Template.xlsx");
  }

  const validRows = parsed?.filter((r) => r.errors.length === 0) ?? [];
  const invalidRows = parsed?.filter((r) => r.errors.length > 0) ?? [];

  return (
    <AdminLayout
      title="Students"
      description="Import from Excel, review data and fix issues before generating certificates"
      actions={
        <>
          <Button variant="outline" onClick={downloadTemplateWorkbook}>
            <Download className="mr-2 size-4" /> Excel format
          </Button>
          <Button variant="outline" onClick={() => setEditing({ gender: "Male" })}>
            <UserPlus className="mr-2 size-4" /> Add student
          </Button>
          <Button onClick={() => fileRef.current?.click()}>
            <Upload className="mr-2 size-4" /> Upload Excel
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </>
      }
    >
      {parsed && (
        <div className="surface-card mb-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Import preview</h2>
              <p className="text-sm text-muted-foreground">
                {validRows.length} valid · {invalidRows.length} with problems. Nothing is saved or
                emailed until you confirm.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setParsed(null)}>
                Cancel
              </Button>
              <Button
                disabled={!validRows.length || importMutation.isPending}
                onClick={() => importMutation.mutate(validRows)}
              >
                Import {validRows.length} student(s)
              </Button>
            </div>
          </div>

          {invalidRows.length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="size-4" />
              <AlertTitle>{invalidRows.length} row(s) will be skipped</AlertTitle>
              <AlertDescription>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
                  {invalidRows.slice(0, 12).map((row) => (
                    <li key={row.rowNumber}>
                      Row {row.rowNumber} ({row.name || row.email || "blank"}):{" "}
                      {row.errors.join(", ")}
                    </li>
                  ))}
                  {invalidRows.length > 12 && <li>…and {invalidRows.length - 12} more</li>}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4 max-h-80 overflow-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Row</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsed.map((row) => (
                  <TableRow key={row.rowNumber}>
                    <TableCell className="text-muted-foreground">{row.rowNumber}</TableCell>
                    <TableCell className="font-medium">{row.name || "—"}</TableCell>
                    <TableCell>{row.email || "—"}</TableCell>
                    <TableCell>{row.mobile_number || "—"}</TableCell>
                    <TableCell>{row.gender || "—"}</TableCell>
                    <TableCell>{row.department || "—"}</TableCell>
                    <TableCell>{row.class || "—"}</TableCell>
                    <TableCell>{row.event || "—"}</TableCell>
                    <TableCell>
                      {row.errors.length ? (
                        <Badge variant="destructive">{row.errors[0]}</Badge>
                      ) : (
                        <Badge variant="secondary">Valid</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="surface-card p-6">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative min-w-56 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <FilterSelect label="Department" value={dept} onChange={setDept} options={options.departments} />
          <FilterSelect label="Class" value={cls} onChange={setCls} options={options.classes} />
          <FilterSelect label="Event" value={event} onChange={setEvent} options={options.events} />
        </div>

        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Loading students…
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    No students match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.mobile_number ?? "—"}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{student.department ?? "—"}</TableCell>
                  <TableCell>{student.class ?? "—"}</TableCell>
                  <TableCell>{student.event ?? "—"}</TableCell>
                  <TableCell>{student.certificate_type ?? "—"}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(student)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(student.id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {filtered.length} of {students.length} student(s) shown.
        </p>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit student" : "Add student"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["name", "Name"],
                ["email", "Email"],
                ["mobile_number", "Mobile Number"],
                ["department", "Department"],
                ["class", "Class"],
                ["event", "Event"],
                ["certificate_type", "Certificate Type"],
              ] as const
            ).map(([field, label]) => (
              <div key={field} className="space-y-1.5">
                <Label htmlFor={field}>{label}</Label>
                <Input
                  id={field}
                  value={(editing?.[field] as string) ?? ""}
                  onChange={(e) => setEditing((prev) => ({ ...prev, [field]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-1.5">
              <Label>Gender</Label>
              <Select
                value={normalizeGender(editing?.gender)}
                onValueChange={(value) => setEditing((prev) => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              disabled={saveMutation.isPending}
              onClick={() => editing && saveMutation.mutate(editing)}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}s</SelectItem>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
