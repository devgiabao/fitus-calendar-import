# 📅 HCMUS CTDB to Google Calendar Exporter

<p align="center">
  <img src="https://img.shields.io/badge/HCMUS-Portal%20CTDB-0284c7?style=for-the-badge&logo=google-calendar&logoColor=white" alt="HCMUS Portal CTDB" />
  <img src="https://img.shields.io/badge/Chương%20Trình-Đề%20Án%20%2F%20CLC%20(11%20Tuần)-8b5cf6?style=for-the-badge" alt="11 Weeks CTDA" />
  <img src="https://img.shields.io/badge/Phòng%20Học-Tự%20Động%20Trích%20Xuất-ec4899?style=for-the-badge" alt="Auto Room Detection" />
  <img src="https://img.shields.io/badge/Format-iCalendar%20(.ics)%20RFC%205545-10b981?style=for-the-badge" alt="RFC 5545" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <b>Công cụ Bookmarklet 1-click tự động đọc kết quả Đăng ký Học phần (ĐKHP) từ Portal CTDB HCMUS và xuất thời khóa biểu sang Google Calendar, Apple Calendar và Outlook.</b>
  <br/>
  <i>Tự động trích xuất phòng học (I.41, C.33, E.307,...), chu kỳ 11 tuần CTĐA và Thực hành bắt đầu từ Tuần thứ 2!</i>
</p>

---

## 🧐 Vấn đề gặp phải

Mỗi đầu học kỳ tại **Trường Đại học Khoa học Tự nhiên ĐHQG-HCM** (đặc biệt là Chương trình Đặc biệt / Đề án tại [portal.ctdb.hcmus.edu.vn](https://portal.ctdb.hcmus.edu.vn/sinh-vien/ket-qua-dkhp)):
- Bảng kết quả ĐKHP hiển thị thời gian học và **phòng học nằm ngay dòng bên dưới** (dưới dạng `(I.41)`, `(C.33)`, `(E.307)`,...).
- Sinh viên CTĐA học theo chu kỳ **11 tuần/học kỳ**.
- **Đặc thù**: Tuần 1 chỉ học Lý thuyết, sang **Tuần thứ 2 mới bắt đầu học Thực hành**.
- Nếu nhập thủ công vào Google Calendar từng buổi, bạn sẽ phải tạo hàng trăm sự kiện lặp, tự gõ từng phòng học cho từng cơ sở – vừa mất thời gian vừa dễ nhầm phòng!

👉 **HCMUS CTDB to Google Calendar** giải quyết trọn vẹn tất cả chỉ trong **chưa đầy 30 giây**!

---

## ✨ Tính năng nổi bật

- 🏛️ **Tự động nhận diện Phòng học**:
  - Đọc chính xác mã phòng học nằm ở dòng bên dưới lịch (ví dụ: `(I.41)`, `(I.52)`, `(C.33)`, `(E.307)`, `(C.24)`, `(E.306)`).
  - Đưa phòng học trực tiếp vào tiêu đề lịch (`(P.I.41)`), vị trí sự kiện (`LOCATION`) và mô tả chi tiết, giúp bạn liếc màn hình điện thoại là biết ngay phòng học không cần mở chi tiết sự kiện.
- ⏱️ **Mặc định chuẩn 11 tuần CTĐA**: Đặt sẵn 11 tuần học (chuẩn Chương trình Đề án HCMUS), đồng thời cho phép tùy chỉnh tự nhập số tuần bất kỳ (10 tuần hè, 12 tuần, 15 tuần đại trà,...).
- 🔬 **Thông minh: Thực hành bắt đầu từ Tuần 2**:
  - Tuần 1 của học kỳ chỉ có lịch Lý thuyết.
  - Các buổi Thực hành tự động bắt đầu từ **Tuần thứ 2** (ngày giờ tự động dịch chuyển chính xác sang tuần 2).
  - Có tùy chọn nếu môn học nào bắt đầu TH ngay từ Tuần 1.
- 📅 **Chọn Ngày Bắt Đầu Kỳ Học**: Giao diện chọn ngày Thứ Hai tuần 1 trực quan (mặc định gợi ý sẵn ngày Thứ Hai gần nhất).
- 🧠 **Phân tích dữ liệu tự động**:
  - Nhận diện MSSV & Họ tên sinh viên (ví dụ: `26123456 - LIÊN GIA BẢO`).
  - Đọc Mã MH, Tên MH, Lớp HP, Tín chỉ, Giảng viên LT, Giảng viên TH và Trợ giảng (TG).
- 🔁 **Lặp lại chu kỳ chuẩn RFC 5545 (`RRULE`)**: Tạo file `.ics` có `RRULE:FREQ=WEEKLY;COUNT=...` đồng bộ chính xác đến ngày bế mạc học kỳ.
- ⏰ **Chuông báo trước giờ học**: Tích hợp sẵn nhắc nhở 15 phút, 30 phút, 1 tiếng trước giờ vào lớp (kèm thông tin phòng học trong chuông báo).
- 📱 **Đồng bộ hóa đa nền tảng**: Google Calendar, iOS Calendar (iPhone/iPad/Apple Watch), Outlook, Android.
- 🔒 **Bảo mật tuyệt đối (100% Client-Side)**: Chạy offline hoàn toàn trên trình duyệt, không gửi dữ liệu ra ngoài.

---

## 🖥️ Giao diện hoạt động (Preview)

Khi bấm vào Bookmarklet trên trang kết quả ĐKHP, một hộp thoại hiện đại sẽ xuất hiện:

```text
+---------------------------------------------------------------------------------------------------------+
| 📅 Xuất Thời Khóa Biểu HCMUS sang Google Calendar                                               [ ✕ ]   |
| Sinh viên: 26123456 - LIÊN GIA BẢO | Học kỳ: 1/26-27 | Phát hiện 4 môn học                               |
+---------------------------------------------------------------------------------------------------------+
| [📅 Thứ 2 tuần 1: 2026-09-28]  [⏳ 11 tuần (CTĐA) ▾]  [🔬 TH từ Tuần 2 ▾]  [🔔 Nhắc: 15 phút ▾]         |
+----+-----------------------------+--------+--------------------------+----------------------------------+
| [✓]| Môn học / Mã MH             | Lớp HP | Lịch Lý thuyết & Phòng   | Lịch Thực hành & Phòng           |
+----+-----------------------------+--------+--------------------------+----------------------------------+
| [✓]| Nhập môn CNTT (CSC00004)    | 26C11  | 📘 T2 07:30-11:10 📍P.I.41 | 🔬 T4 07:30-09:30 📍P.I.52 (T2) |
| [✓]| Cơ sở lập trình (CSC10012)  | 26C11  | 📘 T4 13:30-17:10 📍P.I.91 |                                  |
| [✓]| Kỹ năng mềm (CSC10121)      | 26C11  | 📘 T3 07:30-11:10 📍P.C.33 | 🔬 T3 15:30-17:30 📍P.E.307 (T2)|
| [✓]| Toán rời rạc (MTH00009)     | 26C08  | 📘 T2 13:30-17:10 📍P.C.24 | 🔬 T4 09:30-11:30 📍P.E.306 (T2)|
+----+-----------------------------+--------+--------------------------+----------------------------------+
| Đang chọn: 4/4 môn học                    [📋 Sao chép] [🌐 Mở GCal Import] [📥 Tải file .ICS]          |
+---------------------------------------------------------------------------------------------------------+
```

---

## 🚀 Hướng dẫn cài đặt

### Cách 1: Kéo & Thả (Nhanh nhất - Khuyên dùng)

1. Mở file `installer.html` trong trình duyệt.
2. Nhấn `Ctrl + Shift + B` (hoặc `Cmd + Shift + B` trên Mac) để hiển thị thanh Bookmark của trình duyệt.
3. **Nhấn giữ chuột vào nút màu xanh "📅 Xuất TKB HCMUS" và kéo thả vào thanh Bookmark**.

---

### Cách 2: Tạo Bookmark thủ công

1. Nhấn `Ctrl + D` trên trình duyệt bất kỳ để lưu một bookmark, sau đó bấm nút **Chỉnh sửa (Edit)**.
2. Đặt tên Bookmark:
   ```text
   📅 Xuất TKB HCMUS
   ```
3. Mở file [`bookmarklet.min.js`](./bookmarklet.min.js), sao chép toàn bộ nội dung (bắt đầu bằng `javascript:...`) và dán vào ô **URL / Đường dẫn**.
4. Bấm **Lưu (Save)**.

---

### Cách 3: Chạy trực tiếp qua DevTools Console

Khi đang mở trang [https://portal.ctdb.hcmus.edu.vn/sinh-vien/ket-qua-dkhp](https://portal.ctdb.hcmus.edu.vn/sinh-vien/ket-qua-dkhp):
1. Nhấn `F12` (hoặc chuột phải chọn **Kiểm tra / Inspect**), chuyển sang tab **Console**.
2. Sao chép nội dung file [`bookmarklet.js`](./bookmarklet.js), dán vào và nhấn `Enter`.

---

## 📖 Hướng dẫn sử dụng & Nhập vào Google Calendar

1. **Bước 1**: Đăng nhập vào trang kết quả ĐKHP:  
   🔗 **https://portal.ctdb.hcmus.edu.vn/sinh-vien/ket-qua-dkhp**
2. **Bước 2**: Bấm vào bookmark **"📅 Xuất TKB HCMUS"** trên thanh dấu trang.
3. **Bước 3**: 
   - Kiểm tra ngày **Thứ Hai tuần 1** (ngày bắt đầu học kỳ).
   - Số tuần học: Mặc định **11 tuần (Chuẩn CTĐA / CLC)** hoặc tự nhập số tuần theo nhu cầu.
   - Mục Thực hành: Mặc định đã chọn **Bắt đầu từ TUẦN 2 (Tuần 1 chỉ học LT)**.
   - Bấm **"📥 Tải file .ICS (Khuyên dùng)"**.
4. **Bước 4**:
   - Bấm nút **"🌐 Mở Google Calendar Import"** (hoặc vào [Google Calendar Cài đặt Nhập](https://calendar.google.com/calendar/u/0/r/settings/export)).
   - 💡 **Mẹo**: Tạo một lịch riêng tên `TKB HK1 2026-2027` trên Google Calendar rồi nhập file `.ics` vào đó để dễ bật/tắt hoặc xóa khi hết kỳ.
   - Chọn file `.ics` vừa tải về và bấm **Nhập (Import)**. Toàn bộ lịch học cả kỳ kèm phòng học đã sẵn sàng! 🎉

---

## 📂 Cấu trúc dự án

```text
hcmus-ctdb-to-gcal/
├── bookmarklet.js       # Mã nguồn JavaScript đầy đủ, rõ ràng và có chú thích
├── bookmarklet.min.js   # Mã nguồn rút gọn bắt đầu bằng javascript:... dùng cho Bookmark
├── bookmarklet_uri.txt  # Chuỗi URI-encoded để sử dụng nhanh
├── installer.html       # Trang hướng dẫn cài đặt trực quan và có chế độ Demo
├── LICENSE              # Giấy phép MIT License
└── README.md            # Tài liệu giới thiệu và hướng dẫn dự án
```

---

## 📄 Bản quyền (License)

Phát hành dưới giấy phép [MIT License](./LICENSE). Hoàn toàn miễn phí vì cộng đồng sinh viên HCMUS!
