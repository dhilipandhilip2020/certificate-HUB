/* ==========================================================================
   Certificate Distribution System - Pure Vanilla JavaScript Module
   Mahendra Engineering College (Autonomous)
   ========================================================================== */

// Demo CSV Database Fallback with the 53 Student Records
const FALLBACK_CSV_DATA = [
  { mobile: "9003886998", name: "RAMESH. S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6379228464", name: "PRATHAP S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9442849054", name: "Sanjay Kumar V", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8438371462", name: "Viji. V", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6374371774", name: "Praveen. K", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6381911160", name: "NISANTH.G", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9025563441", name: "THARUNKUMAR T", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9884375243", name: "Srikanth.S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8098897939", name: "T M Sabari", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9087404182", name: "E.sam ashish", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8072337939", name: "SOWBAKYAA.S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7708488621", name: "Vishnukumar V", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7418180841", name: "R.Pooja Sri", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9488560772", name: "RATHINAVEL. A", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7338867535", name: "SHIVANI A", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8344579635", name: "MUTHUKUMARAN B", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9042879869", name: "NIVEDHA.G", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9087345060", name: "THARANISH K", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8807468040", name: "Sumeshwaran", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9344729296", name: "SEMMIYA.E", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7695972456", name: "PAVITHRA G", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9585431226", name: "V SARANGOBI", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8778895117", name: "Rithick Kesavan.S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9363259394", name: "SRI HARINI", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7010529256", name: "MURUGAN D", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8754978401", name: "REEMA S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9566832099", name: "Sitharth N", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9344733250", name: "KAVIYA PRIYA.E", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7305805419", name: "C SivaSankar", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7867969906", name: "Nafeesh N", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8122112118", name: "NANDHAKISHORE P.V.", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9952272468", name: "Adarsha Lakshan A.M", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6382123044", name: "Pugalmurugan. P", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9894750795", name: "sujith B", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9361596038", name: "Navajeevan c", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9361714142", name: "Ilayaraja V", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6383966548", name: "Rekka R", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6382003197", name: "A YUVAN KUMAR", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9751878937", name: "Sabarishwaran", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6381182898", name: "Priyadharshini p", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7418531145", name: "A.TAMIMUL ANSARI", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8610933003", name: "DHARVINKUMAR. K", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9361940844", name: "SOUNDARYAN PP", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "6385471713", name: "Pugazhenthi.p", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8838185977", name: "Mahalakshmi. G", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8825555104", name: "Praveenkumar.v", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8428586617", name: "SRIDHAR", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8148870364", name: "M.riyaksh kumar", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "7010537643", name: "Yokeshwaran.S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "8438183499", name: "Naresh. D", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9042653435", name: "Naveen. S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9043843082", name: "R.Rithish", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" },
  { mobile: "9080717355", name: "Sabari.S", reg: "", event: "PROJECT EXPO - 2026", dept: "EEE" }
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

/** Step 3: Draw 6380161093.jpeg background template and overlay ONLY Student Name */
function renderLiveCertificateCanvas() {
  const canvas = document.getElementById("cert-canvas");
  const loader = document.getElementById("canvas-loader");

  canvas.classList.add("hidden");
  loader.style.display = "flex";

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "/certificates/6380161093.jpeg";

  img.onload = () => {
    canvas.width = img.naturalWidth || 1414;
    canvas.height = img.naturalHeight || 1000;
    const ctx = canvas.getContext("2d");

    // 1. Draw 6380161093.jpeg background image
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;

    // 2. Format text for slot: ONLY Student Name (NO Register Number)
    const textToPrint = currentStudent.name.toUpperCase();

    // 3. Configure typography
    const fontSize = Math.max(Math.round(H * 0.028), 26);
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    ctx.fillStyle = "#0f172a"; // Deep navy color
    ctx.textAlign = "center";

    // 4. Position on Line 1 underline slot
    const slotCenterX = W * 0.61;
    const slotY = H * 0.528;

    ctx.fillText(textToPrint, slotCenterX, slotY);

    // Show canvas, hide loader
    loader.style.display = "none";
    canvas.classList.remove("hidden");
  };

  img.onerror = () => {
    console.error("Could not load /certificates/6380161093.jpeg");
    loader.innerHTML = "<p style='color:#ef4444;'>Error loading certificate template file 6380161093.jpeg.</p>";
  };
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
    const fontHelveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);

    // Fetch official 6380161093.jpeg template
    const res = await fetch("/certificates/6380161093.jpeg");
    if (!res.ok) throw new Error("Could not download 6380161093.jpeg template.");
    const imgBuf = await res.arrayBuffer();

    const jpgImage = await pdf.embedJpg(imgBuf);
    const W = jpgImage.width;
    const H = jpgImage.height;

    const page = pdf.addPage([W, H]);
    page.drawImage(jpgImage, { x: 0, y: 0, width: W, height: H });

    // Format text: ONLY Student Name
    const textToPrint = currentStudent.name.toUpperCase();
    const fontSize = Math.max(Math.round(H * 0.028), 22);
    const textWidth = fontHelveticaBold.widthOfTextAtSize(textToPrint, fontSize);

    // Calculate position
    const slotCenterX = W * 0.61;
    let x = slotCenterX - textWidth / 2;
    const minX = W * 0.36;
    if (x < minX) x = minX;
    const y = H * 0.472; // PDF coordinates start from bottom-left

    page.drawText(textToPrint, {
      x,
      y,
      size: fontSize,
      font: fontHelveticaBold,
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
