// src/lib/pdfTemplate.ts
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";

export type FormInput = {
  fullName: string;
  nationality: string;
  studentCode: string;
  className: string;
  extraField7?: string;
  extraField8?: string;
  address: string;
  idIssueDate: string;
  idIssuePlace: string;
  phone: string;
  email: string;
  birthDate: string;
  startYear: string;
};

function getTemplatePath() {
  return path.join(process.cwd(), "public", "template.pdf");
}

function getFontPath() {
  return path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
}

export async function fillPdfWithFormData(input: FormInput): Promise<Buffer> {
  const templatePath = getTemplatePath();
  const fontPath = getFontPath();

  const [existingPdfBytes, fontBytes] = await Promise.all([
    fs.promises.readFile(templatePath),
    fs.promises.readFile(fontPath),
  ]);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // ⚠️ Must be BEFORE embedFont()
  pdfDoc.registerFontkit(fontkit);

  // Embed Unicode font
  const unicodeFont = await pdfDoc.embedFont(fontBytes, { subset: true });

  const form = pdfDoc.getForm();

  // Mapping fields
  form.getTextField("Text1").setText(input.fullName);
  form.getTextField("Text4").setText(input.nationality);
  form.getTextField("Text5").setText(input.studentCode);
  form.getTextField("Text6").setText(input.className);

  try {
    form.getTextField("Text7").setText(input.extraField7 ?? "");
  } catch {}

  try {
    form.getTextField("Text8").setText(input.extraField8 ?? "");
  } catch {}

  form.getTextField("Text9").setText(input.address);
  form.getTextField("Text10").setText(input.idIssueDate);
  form.getTextField("Text11").setText(input.idIssuePlace);
  form.getTextField("Text12").setText(input.phone);
  form.getTextField("Text13").setText(input.email);
  form.getTextField("Text14").setText(input.birthDate);
  form.getTextField("Text16").setText(input.startYear);

  // Apply font to appearance
  form.updateFieldAppearances(unicodeFont);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
