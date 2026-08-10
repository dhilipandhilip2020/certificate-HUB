export interface CsvStudent {
  mobile_number: string;
  name: string;
  register_number: string;
  event: string;
  department: string;
}

// Built-in fallback database matching allowed_students.csv
const FALLBACK_CSV_STUDENTS: CsvStudent[] = [
  { mobile_number: "9003886998", name: "RAMESH. S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6379228464", name: "PRATHAP S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9442849054", name: "Sanjay Kumar V", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8438371462", name: "Viji. V", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6374371774", name: "Praveen. K", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6381911160", name: "NISANTH.G", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9025563441", name: "THARUNKUMAR T", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9884375243", name: "Srikanth.S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8098897939", name: "T M Sabari", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9087404182", name: "E.sam ashish", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8072337939", name: "SOWBAKYAA.S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7708488621", name: "Vishnukumar V", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7418180841", name: "R.Pooja Sri", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9488560772", name: "RATHINAVEL. A", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7338867535", name: "SHIVANI A", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8344579635", name: "MUTHUKUMARAN B", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9042879869", name: "NIVEDHA.G", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9087345060", name: "THARANISH K", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8807468040", name: "Sumeshwaran", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9344729296", name: "SEMMIYA.E", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7695972456", name: "PAVITHRA G", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9585431226", name: "V SARANGOBI", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8778895117", name: "Rithick Kesavan.S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9363259394", name: "SRI HARINI", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7010529256", name: "MURUGAN D", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8754978401", name: "REEMA S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9566832099", name: "Sitharth N", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9344733250", name: "KAVIYA PRIYA.E", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7305805419", name: "C SivaSankar", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7867969906", name: "Nafeesh N", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8122112118", name: "NANDHAKISHORE P.V.", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9952272468", name: "Adarsha Lakshan A.M", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6382123044", name: "Pugalmurugan. P", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9894750795", name: "sujith B", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9361596038", name: "Navajeevan c", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9361714142", name: "Ilayaraja V", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6383966548", name: "Rekka R", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6382003197", name: "A YUVAN KUMAR", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9751878937", name: "Sabarishwaran", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6381182898", name: "Priyadharshini p", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7418531145", name: "A.TAMIMUL ANSARI", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8610933003", name: "DHARVINKUMAR. K", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9361940844", name: "SOUNDARYAN PP", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "6385471713", name: "Pugazhenthi.p", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8838185977", name: "Mahalakshmi. G", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8825555104", name: "Praveenkumar.v", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8428586617", name: "SRIDHAR", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8148870364", name: "M.riyaksh kumar", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "7010537643", name: "Yokeshwaran.S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "8438183499", name: "Naresh. D", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9042653435", name: "Naveen. S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9043843082", name: "R.Rithish", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
  { mobile_number: "9080717355", name: "Sabari.S", register_number: "", event: "PROJECT EXPO - 2026", department: "EEE" },
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
