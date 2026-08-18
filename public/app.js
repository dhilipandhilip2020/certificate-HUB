/* ==========================================================================
   Certificate Distribution System - Pure Vanilla JavaScript Module
   Mahendra Engineering College (Autonomous)
   ========================================================================== */

// Demo CSV Database Fallback with the 53 Student Records
const FALLBACK_CSV_DATA = [
  { mobile: "9361714142", name: "Ilayaraja V", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8148294456", name: "DIVYADHARSHINI", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8681009286", name: "Harini k", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6380432122", name: "HARINI SHRI D", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9952272468", name: "Adarsha Lakshan", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6369090315", name: "Manoj", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8778213913", name: "HARISH B", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7010517212", name: "Dharshini E", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7010517212", name: "Dharshini E", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8838185977", name: "Mahalakshmi. G", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7200141771", name: "Hariprakash N", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9962312277", name: "Jayakrishna M", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9344733250", name: "KAVIYA PRIYA .E", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6369471178", name: "Dharun K", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7010463128", name: "HEMAMALINI.E", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7904212603", name: "M.Abivarshini", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8122380139", name: "Anandhan", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9342679861", name: "Arya Nisan S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8838666131", name: "AJAYANTHA G", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9043323372", name: "Karthikeyan T", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6374098915", name: "V. HIRUTHIKA", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8072727834", name: "Boobalan A", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7708172655", name: "Bharani Dharan S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9042278578", name: "Abishekini", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6380956169", name: "DHANUSHREE K", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9344733250", name: "KAVIYA PRIYA E", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6369090315", name: "M.Manoj", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9943340788", name: "Deepa Shalini.V", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8838577248", name: "JEEVITHA A", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9159228548", name: "KABILAN KARKI A K", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8122177399", name: "S MADHANKUMAR", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9025745358", name: "M. Loganathan", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8825996599", name: "GNANAVEL V", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9043657720", name: "Kavibalan B", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8681009286", name: "Harini K", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9384405315", name: "Dinakaran L", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8072766165", name: "Balakumar", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9345711178", name: "M.Kishore", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9363535899", name: "Mohammed Akil S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6382268630", name: "Dinesh m", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7395847644", name: "Bharanidharan S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9363929663", name: "GOWTHAM", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9345711178", name: "M.Kishore", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9952618416", name: "Kamesh", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9566322719", name: "Karthikeyan", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6381201977", name: "BHARATH S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9342679861", name: "Arya Nisan S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6369666988", name: "Dharani ks", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9043657720", name: "Kavibalan B", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
];

// App State
let allowedStudents = [...FALLBACK_CSV_DATA];
let currentStudent = {
  mobile: "",
  name: "",
  reg: "",
  event: "PROJECT EXPO - 2026",
  dept: "EEE"
};

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadCsvDatabase();
});

/** Fetch and parse allowed_students.csv if available */
async function loadCsvDatabase() {
  try {
    const res = await fetch("/allowed_students.csv");
    if (res.ok) {
      const text = await res.text();
      const parsed = parseCsv(text);
      if (parsed.length > 0) {
        allowedStudents = parsed;
        console.log("Loaded CSV database successfully:", allowedStudents.length, "students.");
      }
    }
  } catch (err) {
    console.warn("Using fallback CSV student database:", err);
  }
}

/** Parse raw CSV text */
function parseCsv(csvText) {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) return [];

  const headers = lines[0].toLowerCase().split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    if (values.length < 2) continue;

    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });

    const mobile = (row["mobile_number"] || row["mobile"] || values[0] || "").replace(/[^\d]/g, "");
    const name = row["name"] || values[1] || "";
    const reg = row["register_number"] || row["reg_no"] || values[2] || "";
    const event = row["event"] || values[3] || "PROJECT EXPO - 2026";
    const dept = row["department"] || values[4] || "EEE";

    if (mobile) {
      records.push({ mobile, name, reg, event, dept });
    }
  }
  return records;
}

/** Quick fill helper for demo tags */
function fillMobile(num) {
  const input = document.getElementById("input-mobile");
  if (input) {
    input.value = num;
  }
}

/** Step Navigation Handler */
function goToStep(stepNum) {
  const card1 = document.getElementById("step-1-card");
  const card2 = document.getElementById("step-2-card");
  const card3 = document.getElementById("step-3-card");

  card1.classList.add("hidden");
  card2.classList.add("hidden");
  card3.classList.add("hidden");

  hideAlert("alert-error-step1");
  hideAlert("alert-error-step2");

  if (stepNum === 1) {
    card1.classList.remove("hidden");
  } else if (stepNum === 2) {
    card2.classList.remove("hidden");
  } else if (stepNum === 3) {
    card3.classList.remove("hidden");
  }
}

/** Step 1: Handle Mobile Verification */
function handleMobileSubmit(event) {
  event.preventDefault();
  hideAlert("alert-error-step1");

  const mobileInput = document.getElementById("input-mobile").value.replace(/[^\d]/g, "").trim();

  if (!mobileInput || mobileInput.length < 7) {
    showAlert("alert-error-step1", "alert-msg-step1", "Please enter a valid student mobile number.");
    return;
  }

  // Check mobile number against CSV database
  const match = allowedStudents.find(s => s.mobile.replace(/[^\d]/g, "").trim() === mobileInput);

  if (!match) {
    showAlert(
      "alert-error-step1",
      "alert-msg-step1",
      `Access Denied: Mobile number ${mobileInput} is not registered in allowed_students.csv.`
    );
    return;
  }

  // Verification successful! Set state and move to Step 2
  currentStudent.mobile = mobileInput;
  currentStudent.name = (match.name || "RAMESH. S").toUpperCase();
  currentStudent.reg = match.reg || "";
  currentStudent.event = match.event || "PROJECT EXPO - 2026";
  currentStudent.dept = match.dept || "EEE";

  document.getElementById("input-name").value = currentStudent.name;

  goToStep(2);
}

/** Step 2: Handle Details Form Submit */
function handleDetailsSubmit(event) {
  event.preventDefault();
  hideAlert("alert-error-step2");

  const nameVal = document.getElementById("input-name").value.trim().toUpperCase();

  if (!nameVal) {
    showAlert("alert-error-step2", "alert-msg-step2", "Please enter your Student Full Name.");
    return;
  }

  currentStudent.name = nameVal;

  // Update Summary Display
  document.getElementById("summary-name").innerText = currentStudent.name;
  document.getElementById("summary-mobile").innerText = currentStudent.mobile;

  // Move to Step 3 and render filled template canvas
  goToStep(3);
  renderLiveCertificateCanvas();
}

/** Step 3: Draw background template and overlay ONLY Student Name */
function renderLiveCertificateCanvas() {
  const canvas = document.getElementById("cert-canvas");
  const loader = document.getElementById("canvas-loader");

  canvas.classList.add("hidden");
  loader.style.display = "flex";

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    canvas.width = img.naturalWidth || 1414;
    canvas.height = img.naturalHeight || 1000;
    const ctx = canvas.getContext("2d");

    // 1. Draw background image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;

    // 2. Format text for slot: ONLY Student Name (NO Register Number)
    const textToPrint = currentStudent.name.toUpperCase();

    // 3. Configure typography with Georgia font
    const fontSize = Math.max(Math.round(H * 0.028), 26);
    ctx.font = `bold ${fontSize}px Georgia, serif`;
    ctx.fillStyle = "#0f172a"; // Deep navy color
    ctx.textAlign = "center";

    // 4. Position BELOW Competition text with gap, ABOVE the yellow line, centered
    const slotCenterX = W * 0.5;
    const slotY = H * 0.58;

    ctx.fillText(textToPrint, slotCenterX, slotY);

    // Show canvas, hide loader
    loader.style.display = "none";
    canvas.classList.remove("hidden");
  };

  img.onerror = () => {
    if (img.src.endsWith(".png")) {
      img.src = "/certificates/6380161093.jpeg";
    } else {
      console.error("Could not load certificate template");
      loader.innerHTML = "<p style='color:#ef4444;'>Error loading certificate template file.</p>";
    }
  };

  img.src = "/certificates/6380161093.png";
}

/** Generate and download high-res PDF client-side using pdf-lib (ONLY Student Name) */
async function downloadCertificatePDF() {
  if (!window.PDFLib) {
    alert("PDF generator library loading... Please try again in a moment.");
    return;
  }

  try {
    const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
    const pdf = await PDFDocument.create();
    const fontTimesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

    // Fetch official template (.png first, then .jpeg)
    let isPng = true;
    let res = await fetch("/certificates/6380161093.png");
    if (!res.ok) {
      isPng = false;
      res = await fetch("/certificates/6380161093.jpeg");
    }
    if (!res.ok) throw new Error("Could not download certificate template file.");
    const imgBuf = await res.arrayBuffer();

    const embeddedImage = isPng ? await pdf.embedPng(imgBuf) : await pdf.embedJpg(imgBuf);
    const W = embeddedImage.width;
    const H = embeddedImage.height;

    const page = pdf.addPage([W, H]);
    page.drawImage(embeddedImage, { x: 0, y: 0, width: W, height: H });

    // Format text: ONLY Student Name
    const textToPrint = currentStudent.name.toUpperCase();
    const fontSize = Math.max(Math.round(H * 0.028), 22);
    const textWidth = fontTimesBold.widthOfTextAtSize(textToPrint, fontSize);

    // Calculate position - BELOW Competition text with gap, ABOVE the yellow line, centered
    const slotCenterX = W * 0.5;
    const x = slotCenterX - textWidth / 2;
    const y = H * 0.42; // PDF coordinates start from bottom-left

    page.drawText(textToPrint, {
      x,
      y,
      size: fontSize,
      font: fontTimesBold,
      color: rgb(15 / 255, 23 / 255, 42 / 255),
    });

    // Save and download PDF
    const pdfBytes = await pdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = currentStudent.name.replace(/[^a-zA-Z0-9]/g, "_");
    a.download = `Certificate_${safeName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Error generating PDF: " + (err.message || err));
  }
}

/** Download Canvas as PNG Image */
function downloadCertificateImage() {
  const canvas = document.getElementById("cert-canvas");
  if (!canvas) return;

  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  const safeName = currentStudent.name.replace(/[^a-zA-Z0-9]/g, "_");
  a.download = `Certificate_${safeName}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* Helper alert functions */
function showAlert(alertId, msgId, message) {
  const alertEl = document.getElementById(alertId);
  const msgEl = document.getElementById(msgId);
  if (alertEl && msgEl) {
    msgEl.innerText = message;
    alertEl.classList.remove("hidden");
  }
}

function hideAlert(alertId) {
  const alertEl = document.getElementById(alertId);
  if (alertEl) {
    alertEl.classList.add("hidden");
  }
}
