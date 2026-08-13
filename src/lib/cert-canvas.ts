import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface CertificateDetails {
  studentName: string;
  registerNumber?: string;
  mobileNumber?: string;
  eventName?: string;
  department?: string;
  certificateCode?: string;
  issueDate?: string;
}

function hexToRgb(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return rgb(0.06, 0.09, 0.16);
  const n = parseInt(m[1]!, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/**
 * Generate PDF certificate using the official template image /certificates/6380161093.jpeg
 * with ONLY Student Name printed in the slot line (Register number omitted from certificate text).
 */
export async function generateFullCertificatePdf(details: CertificateDetails): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fontHelveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontTimesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

  let templateBytes: Uint8Array | null = null;

  try {
    if (typeof window !== "undefined") {
      const res = await fetch("/certificates/6380161093.jpeg");
      if (res.ok) {
        const buf = await res.arrayBuffer();
        templateBytes = new Uint8Array(buf);
      }
    }
  } catch (err) {
    console.warn("Could not fetch /certificates/6380161093.jpeg template:", err);
  }

  // If official 6380161093.jpeg template is loaded:
  if (templateBytes) {
    const jpgImage = await pdf.embedJpg(templateBytes);
    const W = jpgImage.width;
    const H = jpgImage.height;

    const page = pdf.addPage([W, H]);
    page.drawImage(jpgImage, { x: 0, y: 0, width: W, height: H });

    // Format text to display in slot: ONLY Student Name
    const textToPrint = (details.studentName || "STUDENT NAME").toUpperCase();

    // Font size & calculation relative to image height
    const fontSize = Math.max(Math.round(H * 0.028), 22);
    const textWidth = fontHelveticaBold.widthOfTextAtSize(textToPrint, fontSize);

    // Slot position on 6380161093.jpeg - BELOW Competition text with gap, ABOVE the yellow line, centered:
    const slotCenterX = W * 0.5;
    const x = slotCenterX - textWidth / 2;

    const y = H * 0.44;
    const navyColor = hexToRgb("#0f172a");

    // Draw Student Name on template line slot with Times Roman Bold font
    page.drawText(textToPrint, {
      x,
      y,
      size: fontSize,
      font: fontTimesBold,
      color: navyColor,
    });

    return pdf.save();
  }

  // Fallback standalone layout if template missing
  const width = 842;
  const height = 595;
  const page = pdf.addPage([width, height]);
  const navyColor = hexToRgb("#1e3a8a");
  const goldColor = hexToRgb("#b45309");

  page.drawRectangle({ x: 20, y: 20, width: width - 40, height: height - 40, borderColor: navyColor, borderWidth: 4 });
  page.drawRectangle({ x: 28, y: 28, width: width - 56, height: height - 56, borderColor: goldColor, borderWidth: 1.5 });

  const collegeText = "MAHENDRA ENGINEERING COLLEGE (AUTONOMOUS)";
  const collegeW = fontHelveticaBold.widthOfTextAtSize(collegeText, 22);
  page.drawText(collegeText, { x: (width - collegeW) / 2, y: height - 70, size: 22, font: fontHelveticaBold, color: navyColor });

  const nameStr = (details.studentName || "Student Name").toUpperCase();
  const nameW = fontTimesBold.widthOfTextAtSize(nameStr, 26);
  page.drawText(nameStr, { x: (width - nameW) / 2, y: height - 230, size: 26, font: fontTimesBold, color: navyColor });

  return pdf.save();
}

/**
 * Generate a live image Data URL preview embedding ONLY Student Name on 6380161093.jpeg
 */
export async function generateCertificateDataUrlAsync(details: CertificateDetails): Promise<string> {
  if (typeof window !== "undefined") {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "/certificates/6380161093.jpeg";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 1414;
        canvas.height = img.naturalHeight || 1000;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve("");
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const W = canvas.width;
        const H = canvas.height;

        const textToPrint = (details.studentName || "STUDENT NAME").toUpperCase();
        const fontSize = Math.max(Math.round(H * 0.028), 26);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = "#0f172a";
        ctx.textAlign = "center";

        const slotCenterX = W * 0.61;
        const slotY = H * 0.528;

        ctx.fillText(textToPrint, slotCenterX, slotY);

        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };

      img.onerror = () => resolve("");
    });
  }
  return "";
}
