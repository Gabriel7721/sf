"use client";

import { FormEvent, useEffect, useState } from "react";
// import "react-datepicker/dist/react-datepicker.css";

import dayjs, { Dayjs } from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

type SubmitResponse =
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

const OFFICES: string[] = [
  "Cục Cảnh sát quản lý hành chính về trật tự xã hội",
  "Cục Cảnh sát đăng ký, quản lý cư trú và dữ liệu quốc gia về dân cư",
];

// Demo: danh sách phường theo một số TP (anh có thể thay bằng data thật)
const WARDS_BY_CITY: Record<string, string[]> = {
  "Thành phố Hồ Chí Minh": [
    "Phường Bến Nghé",
    "Phường Bến Thành",
    "Phường Nguyễn Thái Bình",
    "Phường Phạm Ngũ Lão",
    "Phường Tân Định",
    "Phường Sài Gòn",
    "Phường Cầu Ông Lãnh",
    "Phường Bàn Cờ",
    "Phường Xuân Hòa",
    "Phường Nhieu Lộc",
    "Phường Vĩnh Hội",
    "Phường Xóm Chiếu",
    "Phường Chợ Quán",
    "Phường An Đông",
    "Phường Chợ Lớn",
    "Phường Bình Tây",
    "Phường Bình Tiên",
    "Phường Bình Phú",
    "Phường Phú Lâm",
    "Phường Tân Sơn Hòa",
    "Phường Tân Sơn Nhất",
    "Phường Tân Hòa",
    "Phường Bảy Hiền",
    "Phường Tây Thạnh",
    "Phường Tân Bình",
    "Phường Tân Sơn",
    "Phường Phú Thạnh",
    "Phường Phú Trung",
    "Phường An Lạc",
    "Phường Bình Tân",
    "Phường Bình Hưng Hòa",
    "Phường Bình Trị Đông",
    "Phường Bình Hưng Hòa B",
    "Phường Bình Hưng Hòa A",
    "Phường An Nhơn",
    "Phường Gò Vấp",
    "Phường Hạnh Thông",
    "Phường An Phú Đông",
    "Phường Thới An",
    "Phường Linh Xuân",
    "Phường Hiệp Bình",
    "Phường Long Bình",
    "Phường Thủ Đức",
    "Phường Tân Phú",
    "Phường Phú Nhuận",
    "Phường Cầu Kiệu",
    "Phường Đức Nhuận",
  ],
  "Thành phố Hà Nội": [
    "Phường Hàng Bạc",
    "Phường Hàng Đào",
    "Phường Hàng Trống",
    "Phường Tràng Tiền",
    "Phường Cửa Đông",
    "Phường Cửa Nam",
    "Phường Trúc Bạch",
    "Phường Quán Thánh",
    "Phường Nguyễn Trung Trực",
    "Phường Điện Biên",
    "Phường Kim Mã",
    "Phường Giảng Võ",
    "Phường Thành Công",
    "Phường Phúc Xá",
    "Phường Ngọc Hà",
    "Phường Ngọc Khánh",
    "Phường Láng Hạ",
    "Phường Trung Tự",
    "Phường Phương Mai",
    "Phường Khương Thượng",
    "Phường Ô Chợ Dừa",
    "Phường Quốc Tử Giám",
    "Phường Văn Miếu",
    "Phường Bách Khoa",
    "Phường Lê Đại Hành",
    "Phường Nguyễn Du",
    "Phường Phố Huế",
    "Phường Bùi Thị Xuân",
    "Phường Thanh Nhàn",
    "Phường Bạch Mai",
    "Phường Mai Động",
    "Phường Hoàng Văn Thụ",
    "Phường Hoàng Liệt",
    "Phường Định Công",
    "Phường Giáp Bát",
    "Phường Đại Kim",
    "Phường Yên Hòa",
    "Phường Dịch Vọng",
    "Phường Dịch Vọng Hậu",
    "Phường Mai Dịch",
    "Phường Nghĩa Tân",
    "Phường Nghĩa Đô",
    "Phường Trung Hòa",
    "Phường Nhân Chính",
    "Phường Khương Trung",
    "Phường Khương Đình",
    "Phường Thượng Đình",
    "Phường Thanh Xuân Bắc",
    "Phường Thanh Xuân Nam",
    "Phường Nhật Tân",
    "Phường Quảng An",
    "Phường Tứ Liên",
    "Phường Bưởi",
    "Phường Thụy Khuê",
    "Phường Gia Thụy",
    "Phường Ngọc Lâm",
    "Phường Long Biên",
    "Phường Việt Hưng",
  ],
  "Thành phố Đà Nẵng": [
    "Phường Thạch Thang",
    "Phường Hải Châu I",
    "Phường Hải Châu II",
    "Phường Phước Ninh",
    "Phường Hòa Thuận Tây",
    "Phường Hòa Thuận Đông",
    "Phường Bình Hiên",
    "Phường Bình Thuận",
    "Phường Thanh Bình",
    "Phường Thuận Phước",
    "Phường An Hải Bắc",
    "Phường An Hải Đông",
    "Phường An Hải Tây",
    "Phường Phước Mỹ",
    "Phường Mân Thái",
    "Phường Thọ Quang",
    "Phường Nại Hiên Đông",
    "Phường Khuê Mỹ",
    "Phường Hòa Hải",
    "Phường Mỹ An",
    "Phường Chính Gián",
    "Phường Thạc Gián",
    "Phường Tân Chính",
    "Phường Vĩnh Trung",
    "Phường Xuân Hà",
    "Phường Tam Thuận",
    "Phường Hòa Khê",
    "Phường Khuê Trung",
    "Phường Hòa Thọ Đông",
    "Phường Hòa Thọ Tây",
    "Phường Hòa An",
    "Phường Hòa Phát",
  ],
};

type FormStorageData = {
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
  addressCity?: string;
  addressWard?: string;
  addressStreetDetail?: string;
};

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const [step, setStep] = useState<"form" | "review" | "submitted">("form");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // state cho các field
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState<string>(""); // yyyy-mm-dd
  const [nationality, setNationality] = useState("Việt Nam");
  const [hometown, setHometown] = useState("");
  const [className, setClassName] = useState("");
  const [studentCode, setStudentCode] = useState("");

  // Địa chỉ tổng hợp (gửi về backend / docx)
  const [address, setAddress] = useState("");

  // Các phần tử cấu thành địa chỉ
  const [addressCity, setAddressCity] = useState("");
  const [addressWard, setAddressWard] = useState("");
  const [addressStreetDetail, setAddressStreetDetail] = useState("");

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idDate, setIdDate] = useState<string>(""); // yyyy-mm-dd
  const [idPlace, setIdPlace] = useState("");

  // Load dữ liệu từ localStorage khi mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as FormStorageData;

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

        if (data.addressCity) setAddressCity(data.addressCity);
        if (data.addressWard) setAddressWard(data.addressWard);
        if (data.addressStreetDetail)
          setAddressStreetDetail(data.addressStreetDetail);
      }
    } catch (err) {
      console.error("Không đọc được localStorage:", err);
    } finally {
      setHasLoadedFromStorage(true);
    }
  }, []);

  // Tự động ghép address từ 3 phần: streetDetail, ward, city
  useEffect(() => {
    if (!hasLoadedFromStorage) return;

    const trimCity = addressCity.trim();
    const trimWard = addressWard.trim();
    const trimStreet = addressStreetDetail.trim();

    // Nếu cả 3 đều rỗng thì không động tới address (giữ nguyên dữ liệu cũ nếu có)
    if (!trimCity && !trimWard && !trimStreet) return;

    const parts = [trimStreet, trimWard, trimCity].filter(Boolean);
    setAddress(parts.join(", "));
  }, [hasLoadedFromStorage, addressCity, addressWard, addressStreetDetail]);

  // Tự động lưu form vào localStorage mỗi khi thay đổi
  useEffect(() => {
    if (!hasLoadedFromStorage) return;
    if (typeof window === "undefined") return;

    const payload: FormStorageData = {
      fullName,
      birthDate: birthDate || "",
      idDate: idDate || "",
      nationality,
      hometown,
      className,
      studentCode,
      address,
      phone,
      email,
      idNumber,
      idPlace,
      addressCity,
      addressWard,
      addressStreetDetail,
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
    addressCity,
    addressWard,
    addressStreetDetail,
  ]);

  // Hàm validate
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    const trimFullName = fullName.trim();
    const trimNationality = nationality.trim();
    const trimHometown = hometown.trim();
    const trimPhone = phone.trim();
    const trimEmail = email.trim();
    const trimIdNumber = idNumber.trim();
    const trimIdPlace = idPlace.trim();
    const trimCity = addressCity.trim();
    const trimWard = addressWard.trim();
    const trimStreet = addressStreetDetail.trim();

    // Họ tên
    if (!trimFullName) {
      newErrors.fullName = "Vui lòng nhập họ tên.";
    } else if (trimFullName.length < 3) {
      newErrors.fullName = "Họ tên phải có ít nhất 3 ký tự.";
    }

    // Ngày sinh
    if (!birthDate) {
      newErrors.birthDate = "Vui lòng chọn ngày sinh.";
    }

    // Quốc tịch
    if (!trimNationality) {
      newErrors.nationality = "Vui lòng chọn quốc tịch.";
    }

    // Quê quán
    if (!trimHometown) {
      newErrors.hometown = "Vui lòng chọn quê quán.";
    }

    // Địa chỉ thường trú
    if (!trimCity) {
      newErrors.address =
        "Vui lòng chọn Tỉnh/Thành phố cho địa chỉ thường trú.";
    } else if (!trimWard) {
      newErrors.address = "Vui lòng chọn Phường cho địa chỉ thường trú.";
    } else if (!trimStreet) {
      newErrors.address =
        "Vui lòng nhập số nhà, tên đường cho địa chỉ thường trú.";
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

    // Số CMND/CCCD
    if (!trimIdNumber) {
      newErrors.idNumber = "Vui lòng nhập số CMND/CCCD.";
    } else if (!/^[0-9]+$/.test(trimIdNumber)) {
      newErrors.idNumber = "Số CMND/CCCD chỉ được chứa số.";
    } else if (trimIdNumber.length < 9 || trimIdNumber.length > 12) {
      newErrors.idNumber =
        "Số CMND/CCCD không hợp lệ. Thông thường từ 9 đến 12 chữ số.";
    }

    // Ngày cấp
    if (!idDate) {
      newErrors.idDate = "Vui lòng chọn ngày cấp CMND/CCCD.";
    }

    // Nơi cấp
    if (!trimIdPlace) {
      newErrors.idPlace = "Vui lòng chọn tỉnh/thành phố nơi cấp.";
    }

    return newErrors;
  };

  // 1) Xem trước PDF & chuyển sang bước review
  const handlePreview = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setResult(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          birthDate, // "YYYY-MM-DD"
          nationality: nationality.trim(),
          hometown: hometown.trim(),
          className: className.trim(),
          studentCode: studentCode.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          idNumber: idNumber.trim(),
          idDate, // "YYYY-MM-DD"
          idPlace: idPlace.trim(),
        }),
      });

      if (!res.ok) {
        setMessage("Lỗi khi tạo PDF xem trước.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setConfirmed(false);
      setStep("review");
    } catch (err) {
      console.error(err);
      setMessage("Lỗi kết nối tới server khi tạo PDF xem trước.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2) Gửi chính thức lên Google Drive
  const handleFinalSubmit = async () => {
    if (!confirmed) {
      setMessage(
        "Vui lòng tick xác nhận thông tin chính xác trước khi gửi chính thức."
      );
      return;
    }

    setMessage(null);
    setResult(null);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setMessage("Vui lòng kiểm tra lại các trường được đánh dấu đỏ.");
      setStep("form");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          birthDate,
          nationality: nationality.trim(),
          hometown: hometown.trim(),
          className: className.trim(),
          studentCode: studentCode.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
          idNumber: idNumber.trim(),
          idDate,
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
        setMessage("Đã gửi thành công!");
        setResult(data);
        setStep("submitted");

        // Reset form + localStorage
        setFullName("");
        setBirthDate("");
        setNationality("Việt Nam");
        setHometown("");
        setClassName("");
        setStudentCode("");
        setAddress("");
        setAddressCity("");
        setAddressWard("");
        setAddressStreetDetail("");
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

  const hasPredefinedWards = !!WARDS_BY_CITY[addressCity];
  const wardsForSelectedCity = hasPredefinedWards
    ? WARDS_BY_CITY[addressCity]
    : [];

  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-2 text-3xl font-bold">
          CAM KẾT HỖ TRỢ GIỚI THIỆU CƠ HỘI VIỆC LÀM
        </h1>
        <p className="mb-6 text-sm text-gray-700">
          Các trường có dấu <span className="text-red-600">*</span> là bắt buộc.
          Lớp và Mã số học viên có thể bỏ trống nếu chưa có. Vui lòng điền đầy
          đủ và chính xác bằng tiếng Việt có dấu. Các trường có viền đỏ là chưa
          hợp lệ.
        </p>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <form
            onSubmit={handlePreview}
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
                <DatePicker
                  format="DD/MM/YYYY"
                  value={birthDate ? dayjs(birthDate) : null}
                  onChange={(newValue: Dayjs | null) => {
                    setBirthDate(newValue ? newValue.format("YYYY-MM-DD") : "");
                  }}
                  slotProps={{
                    textField: {
                      className: `${baseInputClass} ${
                        errors.birthDate ? "border-red-500" : "border-gray-300"
                      }`,
                      size: "small",
                      error: !!errors.birthDate,
                      helperText: errors.birthDate ?? "",
                    },
                  }}
                />
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
              <select
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                className={`${baseInputClass} ${
                  errors.hometown ? "border-red-500" : "border-gray-300"
                }`}>
                <option value="">-- Chọn tỉnh/thành phố --</option>
                {VIETNAM_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.hometown && (
                <p className="mt-1 text-xs text-red-600">{errors.hometown}</p>
              )}
            </div>

            {/* Lớp + Mã số HV */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Lớp</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className={`${baseInputClass} border-gray-300`}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Mã số học viên
                </label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className={`${baseInputClass} border-gray-300`}
                />
              </div>
            </div>

            {/* Địa chỉ thường trú */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Địa chỉ thường trú <span className="text-red-600">*</span>
              </label>

              {/* Tỉnh/TP */}
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-700">
                  Tỉnh/Thành phố
                </label>
                <select
                  value={addressCity}
                  onChange={(e) => {
                    setAddressCity(e.target.value);
                    setAddressWard("");
                  }}
                  className={`${baseInputClass} ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}>
                  <option value="">-- Chọn Tỉnh/Thành phố --</option>
                  {VIETNAM_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phường/Xã */}
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-700">
                  Phường/Xã
                </label>

                {hasPredefinedWards ? (
                  <select
                    value={addressWard}
                    onChange={(e) => setAddressWard(e.target.value)}
                    className={`${baseInputClass} ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!addressCity}>
                    <option value="">
                      {addressCity
                        ? "-- Chọn Phường/Xã --"
                        : "-- Vui lòng chọn Tỉnh/Thành phố trước --"}
                    </option>
                    {wardsForSelectedCity.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={addressWard}
                    onChange={(e) => setAddressWard(e.target.value)}
                    className={`${baseInputClass} ${
                      errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={!addressCity}
                    placeholder={
                      addressCity
                        ? "Nhập phường/xã (thông tin đang được cập nhật)"
                        : "Vui lòng chọn Tỉnh/Thành phố trước"
                    }
                  />
                )}
              </div>

              {/* Số nhà, tên đường */}
              <div className="mb-2">
                <label className="mb-1 block text-xs text-gray-700">
                  Số nhà, tên đường
                </label>
                <input
                  type="text"
                  value={addressStreetDetail}
                  onChange={(e) => setAddressStreetDetail(e.target.value)}
                  className={`${baseInputClass} ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ví dụ: 122/3 Nguyễn Trãi"
                />
              </div>

              {/* Preview address */}
              <div>
                <label className="mb-1 block text-xs text-gray-700">
                  Địa chỉ tổng hợp (sẽ ghi vào phiếu)
                </label>
                <input
                  type="text"
                  value={address}
                  readOnly
                  className={`${baseInputClass} border-gray-300 bg-gray-100 text-gray-500`}
                  placeholder="Địa chỉ sẽ tự sinh từ Tỉnh/Thành phố, Phường, Số nhà và tên đường"
                />
              </div>

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
                <DatePicker
                  format="DD/MM/YYYY"
                  value={idDate ? dayjs(idDate) : null}
                  onChange={(newValue: Dayjs | null) => {
                    setIdDate(newValue ? newValue.format("YYYY-MM-DD") : "");
                  }}
                  slotProps={{
                    textField: {
                      className: `${baseInputClass} ${
                        errors.idDate ? "border-red-500" : "border-gray-300"
                      }`,
                      size: "small",
                      error: !!errors.idDate,
                      helperText: errors.idDate ?? "",
                    },
                  }}
                />
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
                  <option value="">-- Chọn nơi cấp --</option>
                  {OFFICES.map((p) => (
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

            {/* Nút xem trước PDF */}
            {step === "form" && (
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                  {isSubmitting
                    ? "Đang tạo PDF xem trước..."
                    : "Xem trước PDF & Xác nhận"}
                </button>
              </div>
            )}

            {/* Bước review + gửi chính thức */}
            {step === "review" && previewUrl && (
              <div className="mt-6 rounded border bg-white p-4 shadow">
                <h2 className="mb-2 text-lg font-semibold">
                  Xem trước phiếu PDF
                </h2>
                <p className="mb-2 text-sm text-gray-700">
                  Vui lòng kiểm tra kỹ thông tin bên dưới. Nếu có sai sót, quay
                  lại chỉnh sửa. Nếu chính xác, hãy tick xác nhận rồi bấm vào
                  nút &quot;Gửi&quot;.
                </p>

                {/* Desktop / tablet: xem trong iframe */}
                <div className="mb-3 hidden h-[600px] w-full border md:block">
                  <iframe src={previewUrl} className="h-full w-full" />
                </div>

                {/* Mobile: chỉ hiện nút mở PDF */}
                <div className="mb-3 md:hidden">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                    Mở / tải PDF trên điện thoại
                  </a>
                  <p className="mt-1 text-xs text-gray-600">
                    Trên điện thoại, PDF sẽ mở bằng ứng dụng xem PDF mặc định
                    của máy (hoặc trình duyệt sẽ cho tải về).
                  </p>
                </div>

                <div className="mb-3 flex items-center gap-2">
                  <input
                    id="confirm-info"
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                  />
                  <label
                    htmlFor="confirm-info"
                    className="text-sm text-gray-800">
                    Tôi xác nhận toàn bộ thông tin trên phiếu là chính xác và
                    đồng ý gửi.
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("form")}
                    className="flex-1 rounded border border-gray-400 px-4 py-2 text-sm">
                    Quay lại chỉnh sửa
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting || !confirmed}
                    onClick={handleFinalSubmit}
                    className="flex-1 rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60">
                    {isSubmitting ? "Đang gửi..." : "Gửi"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </LocalizationProvider>

        {message && (
          <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3 text-sm">
            <p>{message}</p>
            {result && result.success && (
              <div className="mt-2 text-xs text-gray-700">
                <div>
                  <strong>File DOCX:</strong> {result.docx.fileName}
                </div>
                <div>
                  <strong>File PDF:</strong> {result.pdf.fileName}
                </div>
                {/* {result.docx.webViewLink && (
                  <div>
                    <a
                      href={result.docx.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline">
                      Mở DOCX trên Google Drive
                    </a>
                  </div>
                )} */}
                {result.pdf.webViewLink && (
                  <div>
                    <a
                      href={result.pdf.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline">
                      Mở PDF trên Google Drive
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
