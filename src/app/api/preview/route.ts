// app/api/preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DocxFormInput } from "@/lib/docxTemplate";
import { generatePreviewPdfFromDocxInput } from "@/lib/pdfTemplate";
import { formatISOToDMY } from "@/lib/dateFormat";

export const runtime = "nodejs";

async function parseBody(req: NextRequest): Promise<Partial<DocxFormInput>> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await req.json()) as Partial<DocxFormInput>;
  }

  const formData = await req.formData();
  const body: Record<string, string> = {};
  formData.forEach((value, key) => {
    if (typeof value === "string") {
      body[key] = value;
    }
  });
  return body as Partial<DocxFormInput>;
}

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req);

    // Validate cơ bản
    if (!body.fullName || !body.phone || !body.email) {
      return new NextResponse("Thiếu thông tin bắt buộc.", { status: 400 });
    }

    // Chuẩn hóa ngày sang dd/mm/yyyy cho PDF (frontend gửi yyyy-mm-dd)
    const input: DocxFormInput = {
      fullName: body.fullName,
      birthDate: formatISOToDMY(body.birthDate || ""),
      nationality: body.nationality || "",
      hometown: body.hometown || "",
      className: body.className || "",
      studentCode: body.studentCode || "",
      address: body.address || "",
      phone: body.phone,
      email: body.email,
      idNumber: body.idNumber || "",
      idDate: formatISOToDMY(body.idDate || ""),
      idPlace: body.idPlace || "",
    };

    // Hàm này nên khai báo trả về: Promise<Uint8Array>
    const pdfBytes = await generatePreviewPdfFromDocxInput(input);

    // ÉP KIỂU để NextResponse hài lòng (runtime vẫn ok)
    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": pdfBytes.length.toString(),
      },
    });
  } catch (err) {
    console.error("Error in /api/preview:", err);
    return new NextResponse("Lỗi khi tạo PDF xem trước.", { status: 500 });
  }
}
