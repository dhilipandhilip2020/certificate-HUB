import { supabase } from "@/integrations/supabase/client";
import { certificateDownloadUrl, type CertificateRow, type Student } from "./cert-service";

export interface MobileCertificateRecord {
  id: string;
  student_id: string;
  name: string;
  email: string;
  mobile_number: string;
  gender: string;
  department: string | null;
  class: string | null;
  event: string | null;
  certificate_type: string | null;
  certificate_code: string;
  file_path: string; // URL, Data URL, or path
  file_name: string;
  file_type?: string; // "pdf" | "image" | string
  created_at: string;
}

const LOCAL_STORAGE_KEY = "electro-hunt-certificates";

/** Pre-seeds initial default record if local storage is empty. */
export function initializeMobileCertStore() {
  if (typeof window === "undefined") return;
  const existing = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!existing) {
    const now = new Date().toISOString();
    const defaultData = {
      records: [
        {
          id: "local-student-6380161093",
          student_id: "local-student-6380161093",
          name: "Dhilip",
          email: "dhilip@gmail.com",
          mobile_number: "6380161093",
          gender: "Male",
          department: "EEE",
          class: "III Year",
          event: "ELECTRO HUNT '26",
          certificate_type: "Participation Certificate",
          certificate_code: "EH-6380161093",
          file_path: "/certificates/6380161093.png",
          file_name: "6380161093.png",
          file_type: "image/png",
          created_at: now,
        },
      ],
    };
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultData));
  }
}

/** Get all local records from local storage. */
export function getLocalCertificates(): MobileCertificateRecord[] {
  if (typeof window === "undefined") return [];
  initializeMobileCertStore();
  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.records || [];
  } catch (err) {
    console.error("Failed to parse local certificate store", err);
    return [];
  }
}

/** Save a new or updated certificate record locally. */
export function saveLocalCertificate(record: Omit<MobileCertificateRecord, "id" | "student_id" | "created_at"> & { id?: string }) {
  if (typeof window === "undefined") return null;
  const records = getLocalCertificates();
  const normalizedMobile = record.mobile_number.replace(/[^\d]/g, "").trim();
  const now = new Date().toISOString();
  
  const id = record.id || `local-cert-${Date.now()}`;
  const fullRecord: MobileCertificateRecord = {
    id,
    student_id: id,
    name: record.name,
    email: record.email || `${normalizedMobile}@student.edu`,
    mobile_number: normalizedMobile,
    gender: record.gender || "Not Specified",
    department: record.department || "EEE",
    class: record.class || "General",
    event: record.event || "ELECTRO HUNT '26",
    certificate_type: record.certificate_type || "Participation",
    certificate_code: record.certificate_code || `CERT-${normalizedMobile}-${Math.floor(1000 + Math.random() * 9000)}`,
    file_path: record.file_path,
    file_name: record.file_name,
    file_type: record.file_type || (record.file_name.endsWith(".pdf") ? "application/pdf" : "image/jpeg"),
    created_at: now,
  };

  // Check if existing record with this mobile exists -> replace it
  const index = records.findIndex((r) => r.mobile_number.replace(/[^\d]/g, "").trim() === normalizedMobile);
  if (index >= 0) {
    records[index] = fullRecord;
  } else {
    records.unshift(fullRecord);
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ records }));
  return fullRecord;
}

/** Find a certificate by student mobile number in Local Storage and Supabase DB. */
export async function findCertificateByMobile(mobileInput: string): Promise<{
  student: Student;
  certificate: CertificateRow;
  downloadUrl: string;
  fileType?: string;
} | null> {
  const normalizedMobile = mobileInput.replace(/[^\d]/g, "").trim();
  if (!normalizedMobile) return null;

  // 1. Check local storage
  const localRecords = getLocalCertificates();
  const localMatch = localRecords.find(
    (r) => r.mobile_number.replace(/[^\d]/g, "").trim() === normalizedMobile
  );

  if (localMatch) {
    return {
      student: {
        id: localMatch.student_id,
        name: localMatch.name,
        email: localMatch.email,
        mobile_number: localMatch.mobile_number,
        gender: localMatch.gender,
        department: localMatch.department,
        class: localMatch.class,
        event: localMatch.event,
        certificate_type: localMatch.certificate_type,
        created_at: localMatch.created_at,
      },
      certificate: {
        id: localMatch.id,
        student_id: localMatch.student_id,
        certificate_code: localMatch.certificate_code,
        file_path: localMatch.file_path,
        file_name: localMatch.file_name,
        status: "Generated",
        generated_at: localMatch.created_at,
      },
      downloadUrl: localMatch.file_path,
      fileType: localMatch.file_type || "image/png",
    };
  }

  // 2. Check Supabase DB if available
  try {
    const { data: studentRows, error: studentError } = await supabase
      .from("students")
      .select("*");

    if (!studentError && studentRows && studentRows.length > 0) {
      const matchedStudent = (studentRows as Student[]).find((row) => {
        const source = String(row.mobile_number ?? "").replace(/[^\d]/g, "").trim();
        return source === normalizedMobile;
      });

      if (matchedStudent) {
        const { data: certRows, error: certError } = await supabase
          .from("certificates")
          .select("*")
          .eq("student_id", matchedStudent.id)
          .maybeSingle();

        if (!certError && certRows && certRows.file_path) {
          const cert = certRows as CertificateRow;
          const signedUrl = await certificateDownloadUrl(cert.file_path!);
          return {
            student: matchedStudent,
            certificate: cert,
            downloadUrl: signedUrl,
            fileType: cert.file_name?.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
          };
        }
      }
    }
  } catch (err) {
    console.warn("Supabase lookup error fallback:", err);
  }

  return null;
}
