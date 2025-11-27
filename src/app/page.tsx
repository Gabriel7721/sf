"use client";

import { FormEvent, useEffect, useState } from "react";

type SubmitResponse =
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

// Kiểu cho lỗi từng field
type FormErrors = {
  fullName?: string;
  birthDate?: string;
  nationality?: string;
  hometown?: string;
  className?: string;
  studentCode?: string;
  address?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  idDate?: string;
  idPlace?: string;
};

const FORM_STORAGE_KEY = "vtca-docx-form";

// Danh sách Tỉnh/TP theo chuẩn VN
const VIETNAM_PROVINCES: string[] = [
  "Thành phố Hà Nội",
  "Thành phố Hồ Chí Minh",
  "Thành phố Hải Phòng",
  "Thành phố Đà Nẵng",
  "Thành phố Cần Thơ",
  "Tỉnh An Giang",
  "Tỉnh Bà Rịa - Vũng Tàu",
  "Tỉnh Bắc Giang",
  "Tỉnh Bắc Kạn",
  "Tỉnh Bạc Liêu",
  "Tỉnh Bắc Ninh",
  "Tỉnh Bến Tre",
  "Tỉnh Bình Định",
  "Tỉnh Bình Dương",
  "Tỉnh Bình Phước",
  "Tỉnh Bình Thuận",
  "Tỉnh Cà Mau",
  "Tỉnh Cao Bằng",
  "Tỉnh Đắk Lắk",
  "Tỉnh Đắk Nông",
  "Tỉnh Điện Biên",
  "Tỉnh Đồng Nai",
  "Tỉnh Đồng Tháp",
  "Tỉnh Gia Lai",
  "Tỉnh Hà Giang",
  "Tỉnh Hà Nam",
  "Tỉnh Hà Tĩnh",
  "Tỉnh Hải Dương",
  "Tỉnh Hậu Giang",
  "Tỉnh Hòa Bình",
  "Tỉnh Hưng Yên",
  "Tỉnh Khánh Hòa",
  "Tỉnh Kiên Giang",
  "Tỉnh Kon Tum",
  "Tỉnh Lai Châu",
  "Tỉnh Lâm Đồng",
  "Tỉnh Lạng Sơn",
  "Tỉnh Lào Cai",
  "Tỉnh Long An",
  "Tỉnh Nam Định",
  "Tỉnh Nghệ An",
  "Tỉnh Ninh Bình",
  "Tỉnh Ninh Thuận",
  "Tỉnh Phú Thọ",
  "Tỉnh Phú Yên",
  "Tỉnh Quảng Bình",
  "Tỉnh Quảng Nam",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Quảng Ninh",
  "Tỉnh Quảng Trị",
  "Tỉnh Sóc Trăng",
  "Tỉnh Sơn La",
  "Tỉnh Tây Ninh",
  "Tỉnh Thái Bình",
  "Tỉnh Thái Nguyên",
  "Tỉnh Thanh Hóa",
  "Tỉnh Thừa Thiên Huế",
  "Tỉnh Tiền Giang",
  "Tỉnh Trà Vinh",
  "Tỉnh Tuyên Quang",
  "Tỉnh Vĩnh Long",
  "Tỉnh Vĩnh Phúc",
  "Tỉnh Yên Bái",
];

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // state cho các field
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState(""); // yyyy-mm-dd
  const [nationality, setNationality] = useState("Việt Nam");
  const [hometown, setHometown] = useState("");
  const [className, setClassName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idDate, setIdDate] = useState(""); // yyyy-mm-dd
  const [idPlace, setIdPlace] = useState("");

  // Load dữ liệu từ localStorage khi mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as {
          fullName?: string;
          birthDate?: string;
          nationality?: string;
          hometown?: string;
          className?: string;
          studentCode?: string;
          address?: string;
          phone?: string;
          email?: string;
          idNumber?: string;
          idDate?: string;
          idPlace?: string;
        };

        if (data.fullName) setFullName(data.fullName);
        if (data.birthDate) setBirthDate(data.birthDate);
        if (data.nationality) setNationality(data.nationality);
        if (data.hometown) setHometown(data.hometown);
        if (data.className) setClassName(data.className);
        if (data.studentCode) setStudentCode(data.studentCode);
        if (data.address) setAddress(data.address);
        if (data.phone) setPhone(data.phone);
        if (data.email) setEmail(data.email);
        if (data.idNumber) setIdNumber(data.idNumber);
        if (data.idDate) setIdDate(data.idDate);
        if (data.idPlace) setIdPlace(data.idPlace);
      }
    } catch (err) {
      console.error("Không đọc được localStorage:", err);
    } finally {
      setHasLoadedFromStorage(true);
    }
  }, []);

  // Tự động lưu form vào localStorage mỗi khi thay đổi (sau khi đã load xong lần đầu)
  useEffect(() => {
    if (!hasLoadedFromStorage) return;
    if (typeof window === "undefined") return;

    const payload = {
      fullName,
      birthDate,
      nationality,
      hometown,
      className,
      studentCode,
      address,
      phone,
      email,
      idNumber,
      idDate,
      idPlace,
    };

    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Không lưu được localStorage:", err);
    }
  }, [
    hasLoadedFromStorage,
    fullName,
    birthDate,
    nationality,
    hometown,
    className,
    studentCode,
    address,
    phone,
    email,
    idNumber,
    idDate,
    idPlace,
  ]);

  // Hàm validate – bây giờ TẤT CẢ các field đều bắt buộc
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const trimFullName = fullName.trim();
    const trimNationality = nationality.trim();
    const trimHometown = hometown.trim();
    const trimClassName = className.trim();
    const trimStudentCode = studentCode.trim();
    const trimAddress = address.trim();
    const trimPhone = phone.trim();
    const trimEmail = email.trim();
    const trimIdNumber = idNumber.trim();
    const trimIdPlace = idPlace.trim();

    // Họ tên
    if (!trimFullName) {
      newErrors.fullName = "Vui lòng nhập họ tên.";
    } else if (trimFullName.length < 3) {
      newErrors.fullName = "Họ tên phải có ít nhất 3 ký tự.";
    }

    // Ngày sinh (bắt buộc - input type="date" nên chỉ cần check có giá trị)
    if (!birthDate) {
      newErrors.birthDate = "Vui lòng chọn ngày sinh.";
    }

    // Quốc tịch
    if (!trimNationality) {
      newErrors.nationality = "Vui lòng nhập quốc tịch.";
    }

    // Quê quán
    if (!trimHometown) {
      newErrors.hometown = "Vui lòng nhập quê quán.";
    }

    // Lớp
    if (!trimClassName) {
      newErrors.className = "Vui lòng nhập tên lớp.";
    }

    // Mã số học viên
    if (!trimStudentCode) {
      newErrors.studentCode = "Vui lòng nhập mã số học viên.";
    }

    // Địa chỉ thường trú
    if (!trimAddress) {
      newErrors.address = "Vui lòng nhập địa chỉ thường trú.";
    }

    // Số điện thoại
    if (!trimPhone) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^[0-9]+$/.test(trimPhone)) {
      newErrors.phone = "Số điện thoại chỉ được chứa số (0–9).";
    } else if (trimPhone.length < 9 || trimPhone.length > 11) {
      newErrors.phone =
        "Số điện thoại không hợp lệ. Vui lòng nhập từ 9 đến 11 chữ số.";
    }

    // Email
    if (!trimEmail) {
      newErrors.email = "Vui lòng nhập email.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimEmail)) {
        newErrors.email = "Email không hợp lệ. Vui lòng kiểm tra lại.";
      }
    }

    // Số CMND/CCCD (bắt buộc)
    if (!trimIdNumber) {
      newErrors.idNumber = "Vui lòng nhập số CMND/CCCD.";
    } else if (!/^[0-9]+$/.test(trimIdNumber)) {
      newErrors.idNumber = "Số CMND/CCCD chỉ được chứa số.";
    } else if (trimIdNumber.length < 9 || trimIdNumber.length > 12) {
      newErrors.idNumber =
        "Số CMND/CCCD không hợp lệ. Thông thường từ 9 đến 12 chữ số.";
    }

    // Ngày cấp (bắt buộc - input type="date")
    if (!idDate) {
      newErrors.idDate = "Vui lòng chọn ngày cấp CMND/CCCD.";
    }

    // Nơi cấp (bắt buộc - dropdown)
    if (!trimIdPlace) {
      newErrors.idPlace = "Vui lòng chọn tỉnh/thành phố nơi cấp.";
    }

    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setResult(null);

    // Validate trước khi submit
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
      return;
    }

    // Nếu không có lỗi thì clear error và submit
    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          birthDate, // yyyy-mm-dd
          nationality: nationality.trim(),
          hometown: hometown.trim(),
          className: className.trim(),
          studentCode: studentCode.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          idNumber: idNumber.trim(),
          idDate, // yyyy-mm-dd
          idPlace: idPlace.trim(),
        }),
      });

      const data = (await res.json()) as SubmitResponse;

      if (!res.ok || !data.success) {
        const errMsg =
          !data.success && "error" in data
            ? data.error
            : "Có lỗi xảy ra khi gửi bài.";
        setMessage(errMsg);
        setResult(data);
      } else {
        setMessage("Đã nộp thành công, DOCX đã được gửi lên Google Drive!");
        setResult(data);

        // Sau khi nộp thành công => xóa form + localStorage (tránh submit trùng)
        setFullName("");
        setBirthDate("");
        setNationality("Việt Nam");
        setHometown("");
        setClassName("");
        setStudentCode("");
        setAddress("");
        setPhone("");
        setEmail("");
        setIdNumber("");
        setIdDate("");
        setIdPlace("");
        try {
          if (typeof window !== "undefined") {
            localStorage.removeItem(FORM_STORAGE_KEY);
          }
        } catch (err) {
          console.error("Không xóa được localStorage:", err);
        }
      }
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối tới server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const baseInputClass =
    "w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">
          CAM KẾT HỖ TRỢ GIỚI THIỆU CƠ HỘI VIỆC LÀM
        </h1>
        <p className="mb-6 text-sm text-gray-700">
          Tất cả các trường bên dưới đều là bắt buộc. Vui lòng điền đầy đủ và
          chính xác bằng tiếng Việt có dấu. Các trường có viền đỏ là chưa hợp
          lệ.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded bg-white p-4 shadow"
          noValidate>
          {/* Họ tên */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Họ tên <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`${baseInputClass} ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
            )}
          </div>

          {/* Ngày sinh + Quốc tịch */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Sinh ngày <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={`${baseInputClass} ${
                  errors.birthDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.birthDate && (
                <p className="mt-1 text-xs text-red-600">{errors.birthDate}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Quốc tịch <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className={`${baseInputClass} ${
                  errors.nationality ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nationality && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.nationality}
                </p>
              )}
            </div>
          </div>

          {/* Quê quán */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Quê quán <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
              className={`${baseInputClass} ${
                errors.hometown ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.hometown && (
              <p className="mt-1 text-xs text-red-600">{errors.hometown}</p>
            )}
          </div>

          {/* Lớp + Mã số HV */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Lớp <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className={`${baseInputClass} ${
                  errors.className ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.className && (
                <p className="mt-1 text-xs text-red-600">{errors.className}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Mã số học viên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className={`${baseInputClass} ${
                  errors.studentCode ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.studentCode && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.studentCode}
                </p>
              )}
            </div>
          </div>

          {/* Địa chỉ thường trú */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Địa chỉ thường trú <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={`${baseInputClass} ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address}</p>
            )}
          </div>

          {/* Phone + Email */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Số điện thoại <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${baseInputClass} ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${baseInputClass} ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Số CMND/CCCD */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Số CMND/CCCD <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              className={`${baseInputClass} ${
                errors.idNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.idNumber && (
              <p className="mt-1 text-xs text-red-600">{errors.idNumber}</p>
            )}
          </div>

          {/* Ngày cấp + Nơi cấp */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Cấp ngày <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                value={idDate}
                onChange={(e) => setIdDate(e.target.value)}
                className={`${baseInputClass} ${
                  errors.idDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.idDate && (
                <p className="mt-1 text-xs text-red-600">{errors.idDate}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Nơi cấp <span className="text-red-600">*</span>
              </label>
              <select
                value={idPlace}
                onChange={(e) => setIdPlace(e.target.value)}
                className={`${baseInputClass} ${
                  errors.idPlace ? "border-red-500" : "border-gray-300"
                }`}>
                <option value="">-- Chọn tỉnh/thành phố cấp --</option>
                {VIETNAM_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.idPlace && (
                <p className="mt-1 text-xs text-red-600">{errors.idPlace}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {isSubmitting ? "Đang gửi..." : "Tạo DOCX & Gửi lên Google Drive"}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm">
            <p>{message}</p>
            {result && result.success && (
              <div className="mt-2 text-xs text-gray-700">
                <div>
                  <strong>Tên file:</strong> {result.fileName}
                </div>
                {/* <div>
                  <strong>File ID:</strong> {result.fileId}
                </div> */}
                {/* {result.webViewLink && (
                  <div>
                    <strong>Link:</strong>{" "}
                    <a
                      href={result.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline">
                      Mở trên Google Drive
                    </a>
                  </div>
                )} */}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
