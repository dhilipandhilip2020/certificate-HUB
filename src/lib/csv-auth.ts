export interface CsvStudent {
  mobile_number: string;
  name: string;
  register_number: string;
  event: string;
  department: string;
}

// Built-in fallback database matching allowed_students.csv
const FALLBACK_CSV_STUDENTS: CsvStudent[] = [
  { mobile_number: "9361714142", name: "Ilayaraja V", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8148294456", name: "DIVYADHARSHINI", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8681009286", name: "Harini k", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6380432122", name: "HARINI SHRI D", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9952272468", name: "Adarsha Lakshan", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6369090315", name: "Manoj", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8778213913", name: "HARISH B", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7010517212", name: "Dharshini E", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7010517212", name: "Dharshini E", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8838185977", name: "Mahalakshmi. G", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7200141771", name: "Hariprakash N", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9962312277", name: "Jayakrishna M", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9344733250", name: "KAVIYA PRIYA .E", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6369471178", name: "Dharun K", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7010463128", name: "HEMAMALINI.E", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7904212603", name: "M.Abivarshini", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8122380139", name: "Anandhan", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9342679861", name: "Arya Nisan S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8838666131", name: "AJAYANTHA G", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9043323372", name: "Karthikeyan T", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6374098915", name: "V. HIRUTHIKA", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8072727834", name: "Boobalan A", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7708172655", name: "Bharani Dharan S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9042278578", name: "Abishekini", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6380956169", name: "DHANUSHREE K", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9344733250", name: "KAVIYA PRIYA E", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6369090315", name: "M.Manoj", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9943340788", name: "Deepa Shalini.V", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8838577248", name: "JEEVITHA A", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9159228548", name: "KABILAN KARKI A K", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8122177399", name: "S MADHANKUMAR", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9025745358", name: "M. Loganathan", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8825996599", name: "GNANAVEL V", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9043657720", name: "Kavibalan B", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8681009286", name: "Harini K", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9384405315", name: "Dinakaran L", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8072766165", name: "Balakumar", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9345711178", name: "M.Kishore", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9363535899", name: "Mohammed Akil S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6382268630", name: "Dinesh m", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7395847644", name: "Bharanidharan S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9363929663", name: "GOWTHAM", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9345711178", name: "M.Kishore", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9952618416", name: "Kamesh", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9566322719", name: "Karthikeyan", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6381201977", name: "BHARATH S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9342679861", name: "Arya Nisan S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6369666988", name: "Dharani ks", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9043657720", name: "Kavibalan B", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
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
