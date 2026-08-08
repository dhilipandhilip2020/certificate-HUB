import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { CertConfig } from "./certificate";
import { normalizeGender } from "./certificate";

function hexToRgb(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return rgb(0, 0, 0);
  const n = parseInt(m[1]!, 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

function fontName(cfg: CertConfig) {
  if (cfg.fontFamily === "Times") return cfg.bold ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman;
  if (cfg.fontFamily === "Courier") return cfg.bold ? StandardFonts.CourierBold : StandardFonts.Courier;
  return cfg.bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
}

function trackedWidth(font: PDFFont, text: string, size: number, spacing: number) {
  if (!spacing) return font.widthOfTextAtSize(text, size);
  let w = 0;
  for (const ch of text) w += font.widthOfTextAtSize(ch, size) + spacing;
  return w - spacing;
}

export interface TemplateAsset {
  bytes: Uint8Array;
  mimeType: string;
}

/**
 * Build a single-page PDF from the template image with the student's name
 * drawn at the configured position. Returns raw PDF bytes.
 */
export async function generateCertificatePdf(
  template: TemplateAsset,
  cfg: CertConfig,
  studentName: string,
  gender: string,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  let page;
  let imgW: number;
  let imgH: number;

  if (template.mimeType === "application/pdf") {
    const src = await PDFDocument.load(template.bytes);
    const [copied] = await pdf.copyPages(src, [0]);
    page = pdf.addPage(copied!);
    imgW = page.getWidth();
    imgH = page.getHeight();
  } else {
    const image =
      template.mimeType === "image/png"
        ? await pdf.embedPng(template.bytes)
        : await pdf.embedJpg(template.bytes);
    imgW = image.width;
    imgH = image.height;
    page = pdf.addPage([imgW, imgH]);
    page.drawImage(image, { x: 0, y: 0, width: imgW, height: imgH });
  }

  const font = await pdf.embedFont(fontName(cfg));
  const color = hexToRgb(cfg.color);
  const size = cfg.fontSize;
  const width = trackedWidth(font, studentName, size, cfg.letterSpacing);

  let x = cfg.nameX;
  if (cfg.align === "center") x -= width / 2;
  else if (cfg.align === "right") x -= width;
  const y = imgH - cfg.nameY; // canvas top-left -> pdf bottom-left

  if (cfg.letterSpacing) {
    let cursor = x;
    for (const ch of studentName) {
      page.drawText(ch, { x: cursor, y, size, font, color });
      cursor += font.widthOfTextAtSize(ch, size) + cfg.letterSpacing;
    }
  } else {
    page.drawText(studentName, { x, y, size, font, color });
  }

  if (cfg.titleEnabled) {
    const female = normalizeGender(gender) === "Female";
    const t = female
      ? { x: cfg.mrX, y: cfg.mrY, w: cfg.mrWidth }
      : { x: cfg.mrsX, y: cfg.mrsY, w: cfg.mrsWidth };
    page.drawLine({
      start: { x: t.x, y: imgH - t.y },
      end: { x: t.x + t.w, y: imgH - t.y },
      thickness: cfg.strikeThickness,
      color,
    });
  }

  return pdf.save();
}
