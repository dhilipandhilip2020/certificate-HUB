export interface CsvStudent {
  mobile_number: string;
  name: string;
  register_number: string;
  event: string;
  department: string;
}

// Built-in fallback database matching allowed_students.csv
const FALLBACK_CSV_STUDENTS: CsvStudent[] = [
  {
    mobile_number: "6380161093",
    name: "Dhilip Kumar S",
    register_number: "611221105012",
    event: "ELECTRO HUNT '26",
    department: "EEE",
  },
  {
    mobile_number: "9876543210",
    name: "Kavin B",
    register_number: "611221105018",
    event: "ELECTRO HUNT '26",
    department: "EEE",
  },
  {
    mobile_number: "9123456789",
    name: "Priya R",
    register_number: "611221105025",
    event: "ELECTRO HUNT '26",
    department: "EEE",
  },
  {
    mobile_number: "9988776655",
    name: "Santhosh M",
    register_number: "611221105030",
    event: "ELECTRO HUNT '26",
    department: "ECE",
  },
  {
    mobile_number: "7010203040",
    name: "Anitha P",
    register_number: "611221105041",
    event: "ELECTRO HUNT '26",
    department: "CSE",
  },
];

/** Parse CSV raw string into CsvStudent array. */
export function parseCsvContent(csvText: string): CsvStudent[] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [];

  const headers = lines[0]!.toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const students: CsvStudent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]!.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    if (values.length < 2) continue;

    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || "";
    });

    const mobile = rowObj["mobile_number"] || rowObj["mobile"] || rowObj["phone"] || values[0] || "";
    const name = rowObj["name"] || rowObj["student_name"] || values[1] || "";
    const register_number = rowObj["register_number"] || rowObj["reg_no"] || rowObj["roll_no"] || values[2] || "";
    const event = rowObj["event"] || values[3] || "ELECTRO HUNT '26";
    const department = rowObj["department"] || values[4] || "EEE";

    if (mobile) {
      students.push({
        mobile_number: mobile.replace(/[^\d]/g, "").trim(),
        name,
        register_number,
        event,
        department,
      });
    }
  }
  return students;
}

/** Verify if mobile number exists in allowed CSV file or dataset. */
export async function verifyMobileInCsv(mobileInput: string): Promise<CsvStudent | null> {
  const cleanMobile = mobileInput.replace(/[^\d]/g, "").trim();
  if (!cleanMobile) return null;

  let studentsList: CsvStudent[] = FALLBACK_CSV_STUDENTS;

  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/allowed_students.csv");
      if (res.ok) {
        const text = await res.text();
        const parsed = parseCsvContent(text);
        if (parsed.length > 0) {
          studentsList = parsed;
        }
      }
    }
  } catch (err) {
    console.warn("Using fallback CSV student database:", err);
  }

  // Also check local storage custom CSV entries if added dynamically
  if (typeof window !== "undefined") {
    const customLocal = window.localStorage.getItem("custom_allowed_csv_students");
    if (customLocal) {
      try {
        const parsedLocal = JSON.parse(customLocal) as CsvStudent[];
        studentsList = [...studentsList, ...parsedLocal];
      } catch (e) {
        // ignore parse error
      }
    }
  }

  const match = studentsList.find(
    (s) => s.mobile_number.replace(/[^\d]/g, "").trim() === cleanMobile
  );

  return match ? { ...match } : null;
}

const SESSION_KEY = "current_student_session";

export interface StudentSessionData {
  mobile: string;
  name: string;
  registerNumber: string;
  event: string;
  department: string;
  verifiedAt: string;
}

export function saveStudentSession(session: StudentSessionData) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getStudentSession(): StudentSessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY) || window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function clearStudentSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(SESSION_KEY);
}
