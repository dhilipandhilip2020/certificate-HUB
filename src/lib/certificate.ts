/**
 * Certificate template configuration + rendering helpers.
 *
 * Coordinate space: pixels of the uploaded template image, origin top-left.
 * The same numbers drive the on-screen canvas preview and the generated PDF.
 */

export type FontFamily = "Helvetica" | "Times" | "Courier";
export type Align = "left" | "center" | "right";

export interface CertConfig {
  nameX: number;
  nameY: number;
  fontSize: number;
  fontFamily: FontFamily;
  bold: boolean;
  align: Align;
  letterSpacing: number;
  color: string; // hex
  titleEnabled: boolean;
  mrX: number;
  mrY: number;
  mrWidth: number;
  mrsX: number;
  mrsY: number;
  mrsWidth: number;
  strikeThickness: number;
}

export const DEFAULT_CONFIG: CertConfig = {
  nameX: 600,
  nameY: 500,
  fontSize: 42,
  fontFamily: "Times",
  bold: true,
  align: "center",
  letterSpacing: 0,
  color: "#1b2a4a",
  titleEnabled: false,
  mrX: 380,
  mrY: 500,
  mrWidth: 60,
  mrsX: 460,
  mrsY: 500,
  mrsWidth: 70,
  strikeThickness: 3,
};

export function mergeConfig(raw: unknown): CertConfig {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_CONFIG };
  return { ...DEFAULT_CONFIG, ...(raw as Partial<CertConfig>) };
}

export function cssFont(cfg: CertConfig): string {
  const family =
    cfg.fontFamily === "Times"
      ? '"Times New Roman", Times, serif'
      : cfg.fontFamily === "Courier"
        ? '"Courier New", Courier, monospace'
        : "Helvetica, Arial, sans-serif";
  return `${cfg.bold ? "bold " : ""}${cfg.fontSize}px ${family}`;
}

function measure(ctx: CanvasRenderingContext2D, text: string, spacing: number) {
  if (!spacing) return ctx.measureText(text).width;
  let w = 0;
  for (const ch of text) w += ctx.measureText(ch).width + spacing;
  return w - spacing;
}

function drawTracked(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
) {
  if (!spacing) {
    ctx.fillText(text, x, y);
    return;
  }
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + spacing;
  }
}

export function normalizeGender(gender: string | null | undefined): "Male" | "Female" {
  return (gender ?? "").trim().toLowerCase().startsWith("f") ? "Female" : "Male";
}

/** Draw the full certificate (template + name + Mr./Mrs. strike-through) onto a canvas. */
export function renderCertificateToCanvas(
  canvas: HTMLCanvasElement,
  image: CanvasImageSource,
  imgWidth: number,
  imgHeight: number,
  cfg: CertConfig,
  studentName: string,
  gender: string,
) {
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, imgWidth, imgHeight);
  ctx.drawImage(image, 0, 0, imgWidth, imgHeight);

  ctx.font = cssFont(cfg);
  ctx.fillStyle = cfg.color;
  ctx.textBaseline = "alphabetic";

  const width = measure(ctx, studentName, cfg.letterSpacing);
  let x = cfg.nameX;
  if (cfg.align === "center") x -= width / 2;
  else if (cfg.align === "right") x -= width;

  drawTracked(ctx, studentName, x, cfg.nameY, cfg.letterSpacing);

  if (cfg.titleEnabled) {
    // Strike through the title that does NOT apply. Never touches the name.
    const female = normalizeGender(gender) === "Female";
    const target = female
      ? { x: cfg.mrX, y: cfg.mrY, w: cfg.mrWidth }
      : { x: cfg.mrsX, y: cfg.mrsY, w: cfg.mrsWidth };
    ctx.strokeStyle = cfg.color;
    ctx.lineWidth = cfg.strikeThickness;
    ctx.beginPath();
    ctx.moveTo(target.x, target.y);
    ctx.lineTo(target.x + target.w, target.y);
    ctx.stroke();
  }
}

export function safeFileName(name: string) {
  const cleaned = name
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `Certificate_${cleaned || "Student"}.pdf`;
}

export function makeCertificateCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CERT-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}-${rand}`;
}
