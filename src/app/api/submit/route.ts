// app/api/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateFilledDocx, DocxFormInput } from "@/lib/docxTemplate";
import { uploadFileToDrive } from "@/lib/googleDrive";

export const runtime = "nodejs";

type ApiResponse =
  | {
      success: true;
      fileId: string;
      fileName: string;
      webViewLink?: string;
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
function formatISOToDMY(iso?: string | null): string {
  if (!iso) return "";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [year, month, day] = parts;
  if (!year || !month || !day) return iso;
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
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

    // Validate cơ bản – có thể nới rộng thêm vì frontend đang bắt tất cả field
    if (!body.fullName || !body.className || !body.phone || !body.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Thiếu thông tin bắt buộc (họ tên, lớp, SĐT, email).",
        },
        { status: 400 }
      );
    }

    // ⭐ Convert ngày từ yyyy-mm-dd -> dd/mm/yyyy để đổ vào DOCX
    const birthDateDMY = formatISOToDMY(body.birthDate || "");
    const idDateDMY = formatISOToDMY(body.idDate || "");

    const input: DocxFormInput = {
      fullName: body.fullName,
      birthDate: birthDateDMY,       // <-- 27/11/2025
      nationality: body.nationality || "",
      hometown: body.hometown || "",
      className: body.className,
      studentCode: body.studentCode || "",
      address: body.address || "",
      phone: body.phone,
      email: body.email,
      idNumber: body.idNumber || "",
      idDate: idDateDMY,             // <-- 27/11/2025
      idPlace: body.idPlace || "",
    };

    // 1) Tạo DOCX từ template.docx
    const filledDocx = await generateFilledDocx(input);

    // 2) Đặt tên file
    const safeName = removeVietnameseTones(input.fullName);
    const safeClass = sanitizeForFilename(input.className);
    const timestamp = getTimestampString();
    const fileName = `${safeName}_${safeClass}_${timestamp}.docx`;

    // 3) Upload lên Google Drive
    const result = await uploadFileToDrive(
      filledDocx,
      fileName,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    return NextResponse.json(
      {
        success: true,
        fileId: result.fileId,
        fileName: result.fileName,
        webViewLink: result.webViewLink,
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
