// src/lib/docxTemplate.ts
import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export type DocxFormInput = {
  fullName: string;
  birthDate: string;
  nationality: string;
  hometown: string;
  className: string;
  studentCode: string;
  address: string;
  phone: string;
  email: string;
  idNumber: string;
  idDate: string;
  idPlace: string;
};

function getTemplatePath() {
  return path.join(process.cwd(), 'public', 'template.docx');
}

/**
 * Load template.docx, fill placeholders, return Buffer của DOCX mới.
 */
export async function generateFilledDocx(input: DocxFormInput): Promise<Buffer> {
  const templatePath = getTemplatePath();

  // Đọc file DOCX dạng binary string cho docxtemplater
  const content = fs.readFileSync(templatePath, 'binary');

  const zip = new PizZip(content);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Map dữ liệu -> placeholder trong template.docx
  doc.setData({
    fullName: input.fullName,
    birthDate: input.birthDate,
    nationality: input.nationality,
    hometown: input.hometown,
    className: input.className,
    studentCode: input.studentCode,
    address: input.address,
    phone: input.phone,
    email: input.email,
    idNumber: input.idNumber,
    idDate: input.idDate,
    idPlace: input.idPlace,
  });

  try {
    doc.render();
  } catch (error: any) {
    console.error('DOCX render error:', error);
    throw error;
  }

  const buf = doc.getZip().generate({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });

  return buf;
}
