import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { AlertTriangle, Download, Pencil, Search, Trash2, Upload, UserPlus, FileUp, Smartphone, Loader2 } from "lucide-react";
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
import { saveLocalCertificate } from "@/lib/mobile-cert-store";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({
    meta: [
      { title: "Students & Certificate Upload | Certificate Distribution System" },
      {
        name: "description",
        content: "Upload student certificates by mobile number or import students from Excel.",
      },
      { property: "og:title", content: "Students & Certificate Upload" },
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
  const certFileRef = useRef<HTMLInputElement>(null);

  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("all");
  const [cls, setCls] = useState("all");
  const [event, setEvent] = useState("all");
  const [editing, setEditing] = useState<Partial<Student> | null>(null);

  // Upload Certificate By Mobile Dialog State
  const [uploadCertDialogOpen, setUploadCertDialogOpen] = useState(false);
  const [uploadMobile, setUploadMobile] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [uploadEvent, setUploadEvent] = useState("ELECTRO HUNT '26");
  const [uploadCertType, setUploadCertType] = useState("Participation Certificate");
  const [selectedCertFile, setSelectedCertFile] = useState<File | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);

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
        (!term || s.name.toLowerCase().includes(term) || s.email?.toLowerCase().includes(term) || (s.mobile_number && s.mobile_number.includes(term))),
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

      const existingEmails = new Set(students.map((s) => s.email?.toLowerCase()));
      const seen = new Set<string>();

      const result: ParsedRow[] = rows.map((row, index) => {
        const name = pick(row, ["name", "studentname", "fullname"]);
        const email = pick(row, ["email", "emailaddress", "mail"]).toLowerCase();
        const mobile_number = pick(row, ["mobile", "mobile_number", "mobilenumber", "phone", "phone_number"]);
        const gender = pick(row, ["gender", "sex"]);
        const errors: string[] = [];

        if (!name) errors.push("Missing student name");
        if (email && !EMAIL_RE.test(email)) errors.push("Invalid email address");
        if (!gender) errors.push("Missing gender");
        if (mobile_number && mobile_number.replace(/[^\d]/g, "").length < 7) {
          errors.push("Invalid mobile number");
        }
        if (email && seen.has(email)) errors.push("Duplicate email in this file");
        if (email && existingEmails.has(email)) errors.push("Email already exists in system");
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
      toast.success(`Read ${result.length} row(s) from ${file.name}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not read Excel file.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const importMutation = useMutation({
    mutationFn: async (rows: ParsedRow[]) => {
      const payload = rows.map((r) => ({
        name: r.name,
        email: r.email || `${r.mobile_number || Date.now()}@student.edu`,
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
      toast.success(`${count} student(s) imported.`);
      setParsed(null);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const saveMutation = useMutation({
    mutationFn: async (student: Partial<Student>) => {
      if (!student.name?.trim()) throw new Error("Student name is required.");
      const payload = {
        name: student.name.trim(),
        email: student.email?.trim().toLowerCase() || `${student.mobile_number || Date.now()}@student.edu`,
        mobile_number: student.mobile_number ? student.mobile_number.replace(/[^\d]/g, "").trim() || null : null,
        gender: normalizeGender(student.gender),
        department: student.department || null,
        class: student.class || null,
        event: student.event || null,
        certificate_type: student.certificate_type || "Participation",
      };

      if (student.id) {
        const { error } = await supabase.from("students").update(payload).eq("id", student.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("students").insert(payload);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      toast.success(editing?.id ? "Student updated." : "Student created.");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["students"] });
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
    },
    onError: (error: Error) => toast.error(error.message),
  });

  async function handleUploadCertificateByMobile(e: React.FormEvent) {
    e.preventDefault();
    const normalized = uploadMobile.replace(/[^\d]/g, "").trim();
    if (!normalized || normalized.length < 7) {
      toast.error("Please enter a valid student mobile number.");
      return;
    }
    if (!uploadName.trim()) {
      toast.error("Please enter the student's name.");
      return;
    }
    if (!selectedCertFile) {
      toast.error("Please select a certificate PDF or image file.");
      return;
    }

    setUploadingCert(true);
    try {
      // Read file as Data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedCertFile);
      });

      // Save into local store so student can log in instantly using mobile number
      saveLocalCertificate({
        name: uploadName.trim(),
        email: `${normalized}@student.edu`,
        mobile_number: normalized,
        event: uploadEvent.trim(),
        certificate_type: uploadCertType.trim(),
        file_path: dataUrl,
        file_name: selectedCertFile.name,
        file_type: selectedCertFile.type || (selectedCertFile.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
      });

      // Optionally attempt to save in Supabase students table
      try {
        await supabase.from("students").upsert({
          name: uploadName.trim(),
          email: `${normalized}@student.edu`,
          mobile_number: normalized,
          event: uploadEvent.trim(),
          certificate_type: uploadCertType.trim(),
          gender: "Not Specified",
        }, { onConflict: "mobile_number" });
      } catch (dbErr) {
        console.log("Supabase sync optional step:", dbErr);
      }

      toast.success(`Uploaded certificate for mobile number ${normalized}! The student can now log in using this number.`);
      setUploadCertDialogOpen(false);
      setUploadMobile("");
      setUploadName("");
      setSelectedCertFile(null);
      queryClient.invalidateQueries({ queryKey: ["students"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload certificate file.");
    } finally {
      setUploadingCert(false);
    }
  }

  function downloadTemplateWorkbook() {
    const sheet = XLSX.utils.json_to_sheet([
      {
        "Student Name": "John Doe",
        Email: "john@example.com",
        "Mobile Number": "6380161093",
        Gender: "Male",
        Department: "EEE",
        Class: "III Year",
        Event: "ELECTRO HUNT '26",
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
      title="Students & Certificate Upload"
      description="Upload certificates tied to student mobile numbers or import participant lists"
      actions={
        <>
          <Button variant="default" onClick={() => setUploadCertDialogOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <FileUp className="size-4" /> Upload Certificate by Mobile
          </Button>
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
      {/* Upload Certificate by Mobile Dialog */}
      <Dialog open={uploadCertDialogOpen} onOpenChange={setUploadCertDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileUp className="size-5 text-emerald-600" /> Upload Certificate by Mobile Number
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUploadCertificateByMobile} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="upload-mobile" className="font-semibold">Student Mobile Number *</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="upload-mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  className="pl-9"
                  value={uploadMobile}
                  onChange={(e) => setUploadMobile(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">The student will log in using this mobile number to view/download the file.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-name" className="font-semibold">Student Name *</Label>
              <Input
                id="upload-name"
                placeholder="e.g. John Doe"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="upload-event">Event Name</Label>
                <Input
                  id="upload-event"
                  value={uploadEvent}
                  onChange={(e) => setUploadEvent(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="upload-certtype">Certificate Type</Label>
                <Input
                  id="upload-certtype"
                  value={uploadCertType}
                  onChange={(e) => setUploadCertType(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="upload-file" className="font-semibold">Select Certificate File (PDF or Image) *</Label>
              <Input
                id="upload-file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setSelectedCertFile(e.target.files?.[0] || null)}
                required
              />
              <p className="text-xs text-muted-foreground">Supports PDF documents and image files (.jpeg, .png).</p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setUploadCertDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={uploadingCert}>
                {uploadingCert ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileUp className="mr-2 size-4" />}
                Save & Link to Mobile
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {parsed && (
        <div className="surface-card mb-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Import preview</h2>
              <p className="text-sm text-muted-foreground">
                {validRows.length} valid · {invalidRows.length} with problems.
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
                      Row {row.rowNumber} ({row.name || row.mobile_number || "blank"}):{" "}
                      {row.errors.join(", ")}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Main Student List Table Card */}
      <div className="surface-card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, mobile or email..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="Department"
              value={dept}
              onChange={setDept}
              options={options.departments}
            />
            <FilterSelect label="Class" value={cls} onChange={setCls} options={options.classes} />
            <FilterSelect label="Event" value={event} onChange={setEvent} options={options.events} />
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Certificate Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading student records...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No student records found. Click "Upload Certificate by Mobile" or "Add student" above.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="font-mono text-sm">{s.mobile_number || "—"}</TableCell>
                    <TableCell>{s.event || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{s.certificate_type || "Participation"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUploadMobile(s.mobile_number || "");
                            setUploadName(s.name);
                            setUploadEvent(s.event || "ELECTRO HUNT '26");
                            setUploadCertDialogOpen(true);
                          }}
                          title="Upload Certificate for this Student"
                        >
                          <FileUp className="size-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditing(s)}
                          title="Edit Student"
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(s.id)}
                          title="Delete Student"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Student Modal */}
      <Dialog open={Boolean(editing)} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit student" : "Add student"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["name", "Name"],
                ["mobile_number", "Mobile Number"],
                ["email", "Email"],
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
