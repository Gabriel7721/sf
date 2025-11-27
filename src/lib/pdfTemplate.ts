// src/lib/pdfTemplate.ts
import { PDFDocument, PDFName, PDFBool, PDFDict } from "pdf-lib";
import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";

import { DocxFormInput } from "./docxTemplate";
import { formatISOToDMY } from "./dateFormat";

export type FormInput = {
  fullName: string;
  nationality: string;
  studentCode: string;
  className: string;
  // extraField7?: string;
  // extraField8?: string;
  country: string;
  address: string;
  idIssue: string;
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
  return path.join(process.cwd(), "public", "fonts", "TimesNewRoman.ttf");
  // return path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
}

export function toVietnamDate(dateStr: string): string {
  if (!dateStr) return "";

  // 1) Trường hợp ISO có hoặc không kèm time:
  //    "2025-11-03" hoặc "2025-11-03T00:00:00.000Z"
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch; // y=2025, m=11, d=03
    return `${d}/${m}/${y}`; // -> 03/11/2025
  }

  // 2) Trường hợp đã là dd/mm/yyyy → trả nguyên
  if (dateStr.includes("/")) {
    return dateStr;
  }

  // 3) Mặc định: trả nguyên nếu format lạ
  return dateStr;
}

/**
 * Hàm gốc: fill form PDF từ FormInput (giữ nguyên như anh đang dùng)
 */
export async function fillPdfWithFormData(
  input: FormInput
): Promise<Uint8Array> {
  const templatePath = getTemplatePath();
  const fontPath = getFontPath();

  const [existingPdfBytes, fontBytes] = await Promise.all([
    fs.promises.readFile(templatePath),
    fs.promises.readFile(fontPath),
  ]);

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfDoc.registerFontkit(fontkit);

  // Khuyến nghị: subset = false để tránh thiếu glyph tiếng Việt
  const unicodeFont = await pdfDoc.embedFont(fontBytes, { subset: false });

  const form = pdfDoc.getForm();

  form.getTextField("Text1").setText(input.fullName);
  form.getTextField("Text4").setText(input.nationality);
  form.getTextField("Text12").setText(input.studentCode);
  form.getTextField("Text5").setText(input.className);

  // try {
  //   form.getTextField("Text7").setText(input.extraField7 ?? "");
  // } catch {}
  // try {
  //   form.getTextField("Text8").setText(input.extraField8 ?? "");
  // } catch {}

  form.getTextField("Text6").setText(input.address);
  form.getTextField("Text14").setText(toVietnamDate(input.idIssueDate));
  form.getTextField("Text9").setText(input.idIssuePlace);
  form.getTextField("Text7").setText(input.phone);
  form.getTextField("Text13").setText(input.email);
  form.getTextField("Text10").setText(toVietnamDate(input.birthDate));
  form.getTextField("Text8").setText(input.idIssue);
  form.getTextField("Text11").setText(input.country);

  input.startYear = new Date().getFullYear().toString();
  form.getTextField("Text16").setText(input.startYear);

  // 1) Update appearance dùng font Unicode
  form.updateFieldAppearances(unicodeFont);

  // 2) TẮT NeedAppearances để viewer không tự vẽ lại
  const acroFormObj = pdfDoc.catalog.lookup(PDFName.of("AcroForm"));

  if (acroFormObj instanceof PDFDict) {
    acroFormObj.set(PDFName.of("NeedAppearances"), PDFBool.False);
  }

  // 3) TUỲ CHỌN: nếu anh chỉ cần file cuối cùng, không cần edit lại trên Acrobat,
  //    flatten form để biến thành text cố định => không bị viewer can thiệp nữa.
  form.flatten();

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Hàm tiện ích: nhận luôn DocxFormInput (cùng type với generateFilledDocx),
 * map sang FormInput cho PDF preview.
 */
export async function generatePreviewPdfFromDocxInput(
  docxInput: DocxFormInput
): Promise<Uint8Array> {
  // đổi sang Uint8Array
  const mapped: FormInput = {
    fullName: docxInput.fullName,
    nationality: docxInput.nationality,
    studentCode: docxInput.studentCode,
    className: docxInput.className,
    // extraField7: docxInput.hometown ?? "",
    // extraField8: "",
    address: docxInput.address,
    idIssueDate: docxInput.idDate,
    idIssuePlace: docxInput.idPlace,
    phone: docxInput.phone,
    email: docxInput.email,
    birthDate: docxInput.birthDate,
    startYear: "",
    idIssue: docxInput.idNumber,
    country: docxInput.hometown
  };

  return fillPdfWithFormData(mapped);
}
