// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateFilledDocx, DocxFormInput } from "@/lib/docxTemplate";
import { uploadFileToDrive } from "@/lib/googleDrive";
import { generatePreviewPdfFromDocxInput } from "@/lib/pdfTemplate"; // <-- THÊM
export const runtime = "nodejs";

type ApiResponse =
  | {
      success: true;
      docx: {
        fileId: string;
        fileName: string;
        webViewLink?: string;
      };
      pdf: {
        fileId: string;
        fileName: string;
        webViewLink?: string;
      };
    }
  | {
      success: false;
      error: string;
    };

function getTimestampString(): string {
  const now = new Date();
  const pad = (n: number) => `${n}`.padStart(2, "0");

  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());

  // ddMMyyyy_HHmmss
  return `${day}${month}${year}_${hour}${minute}${second}`;
}

// Bỏ dấu + ký tự lạ để dùng trong tên file
function sanitizeForFilename(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9_\-]/g, "");
}

function removeVietnameseTones(str: string): string {
  return str
    .normalize("NFD") // tách dấu
    .replace(/[\u0300-\u036f]/g, "") // xóa toàn bộ dấu tổ hợp
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9\s]/g, "") // loại bỏ ký tự lạ
    .replace(/\s+/g, "_") // chuyển space thành _
    .trim();
}

/**
 * Chuyển '2025-11-27' -> '27/11/2025'
 * Nếu value trống hoặc không đúng format thì trả về chuỗi cũ.
 */
export function formatISOToDMY(iso?: string | null): string {
  if (!iso) return "";

  // Bắt 3 nhóm đầu tiên (YYYY-MM-DD)
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return iso;

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
}

// Hỗ trợ cả JSON (fetch) lẫn form-data (HTML form submit)
async function parseBody(req: NextRequest): Promise<Partial<DocxFormInput>> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    // Trường hợp dùng fetch(...) với body JSON
    return (await req.json()) as Partial<DocxFormInput>;
  }

  // Mặc định: nhận từ HTML form (application/x-www-form-urlencoded hoặc multipart/form-data)
  const formData = await req.formData();
  const body: any = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      body[key] = value;
    }
  });
  return body as Partial<DocxFormInput>;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await parseBody(req);

    // ✅ CHỈ BẮT BUỘC: fullName, phone, email
    //    className KHÔNG bắt buộc nữa
    if (!body.fullName || !body.phone || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc (họ tên, SĐT, email).",
        },
        { status: 400 }
      );
    }

    // ⭐ Convert ngày từ yyyy-mm-dd -> dd/mm/yyyy để đổ vào DOCX/PDF
    const birthDateDMY = formatISOToDMY(body.birthDate || "");
    const idDateDMY = formatISOToDMY(body.idDate || "");

    const input: DocxFormInput = {
      fullName: body.fullName,
      birthDate: birthDateDMY, // <-- 27/11/2025
      nationality: body.nationality || "",
      hometown: body.hometown || "",
      className: body.className || "", // có thể rỗng
      studentCode: body.studentCode || "",
      address: body.address || "",
      phone: body.phone,
      email: body.email,
      idNumber: body.idNumber || "",
      idDate: idDateDMY, // <-- 27/11/2025
      idPlace: body.idPlace || "",
    };

    // 1) Tạo DOCX từ template.docx
    const filledDocx = await generateFilledDocx(input);

    // 2) Tạo PDF từ cùng input (dùng chung logic với preview)
    const pdfBytes = await generatePreviewPdfFromDocxInput(input);
    // đảm bảo kiểu Buffer cho google drive
    const filledPdf = Buffer.isBuffer(pdfBytes)
      ? pdfBytes
      : Buffer.from(pdfBytes);

    // 3) Đặt base-name dùng chung cho cả DOCX và PDF
    const safeName = removeVietnameseTones(input.fullName);
    const safeId = sanitizeForFilename(input.idNumber || "NoId");
    const timestamp = getTimestampString();
    const baseName = `${safeName}_${safeId}_${timestamp}`;

    const docxFileName = `${baseName}.docx`;
    const pdfFileName = `${baseName}.pdf`;

    // 4) Upload DOCX lên Google Drive
    const docxResult = await uploadFileToDrive(
      filledDocx,
      docxFileName,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    // 5) Upload PDF lên Google Drive
    const pdfResult = await uploadFileToDrive(
      filledPdf,
      pdfFileName,
      "application/pdf"
    );

    // 6) Trả về cả 2 file
    return NextResponse.json(
      {
        success: true,
        docx: {
          fileId: docxResult.fileId,
          fileName: docxResult.fileName,
          webViewLink: docxResult.webViewLink,
        },
        pdf: {
          fileId: pdfResult.fileId,
          fileName: pdfResult.fileName,
          webViewLink: pdfResult.webViewLink,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error in /api/submit:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Lỗi hệ thống khi xử lý bài nộp.",
      },
      { status: 500 }
    );
  }
}
