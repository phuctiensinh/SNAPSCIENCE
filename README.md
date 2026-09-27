# 🔬 SnapScience PWA — Học Khoa Học Từ Thế Giới Qua Camera

> **Chụp một thứ. Hiểu cả một thế giới.**  
> SnapScience biến camera thành kính hiển vi khoa học: Chụp một vật thể quen thuộc quanh bạn, ứng dụng sẽ tự động phân tích các nguyên lý lý - hóa - sinh phía sau, cung cấp bài học đa cấp độ, công cụ tính toán công thức thực tế, thử nghiệm tương tác và câu hỏi trắc nghiệm củng cố kiến thức.

---

## 🌟 Ý Tưởng & Triết Lý Sản Phẩm

Hệ thống tuân thủ nghiêm ngặt chu trình học tập:
$$\text{CHỤP} \longrightarrow \text{QUAN SÁT} \longrightarrow \text{HIỂU} \longrightarrow \text{TƯƠNG TÁC} \longrightarrow \text{THỬ} \longrightarrow \text{KIỂM TRA}$$

SnapScience **không phải là một AI Image Scanner đơn thuần**. Ứng dụng biến từng bức ảnh thành một trải nghiệm học tập khép kín và có chiều sâu.

---

## 🚀 Tính Năng Nổi Bật

- **UI v0 Chính Thức:** Giữ nguyên 100% ngôn ngữ thiết kế, màu sắc, card, typography, animation của giao diện v0 (`HomeScreen`, `CameraScreen`, `PreviewScreen`, `AnalyzingScreen`, `ResultScreen`, `LessonScreen`, `ExperimentScreen`, `QuizScreen`, `CompleteScreen`, `LibraryScreen`).
- **Camera Thật Điện Thoại & Desktop:**
  - Tích hợp HTML5 `navigator.mediaDevices.getUserMedia` với camera sau mặc định (`facingMode: "environment"`).
  - Không tự động bật camera khi mở app; quản lý lifecycle MediaStream chặt chẽ (giải phóng toàn bộ camera track khi rời màn hình camera).
  - Nút đổi camera (Front / Rear), đóng camera, chụp ảnh snapshot qua Canvas element.
  - Fallback upload ảnh (JPG, PNG, WEBP) với đầy đủ bước kiểm tra MIME type, kích thước (<10MB) và file rỗng.
- **AI Architecture & Demo Mode Khép Kín:**
  - Server route `app/api/analyze/route.ts` bảo vệ `OPENAI_API_KEY`, tuyệt đối không lộ API Key ở client.
  - Abstraction Provider: `AIProvider` $\rightarrow$ `OpenAIProvider` / `MockProvider`.
  - **Demo Mode:** Nếu chưa cấu hình API Key hoặc bị offline, ứng dụng tự động chuyển sang `MockProvider` với 9 vật thể mẫu phong phú: *Bánh xe, Bóng đèn, Cây xanh, Gương, Ly nước, Bóng, Xe đạp, Cầu thang, Cầu vồng*.
- **Low Confidence Handling:** Cảnh báo khi độ tin cậy $< 70\%$ với tùy chọn [Phân tích lại] hoặc [Chọn chủ đề thủ công].
- **Bài Học 3 Mức Độ:**
  - 🎒 **Cơ bản:** Phù hợp học sinh tiểu học.
  - 📚 **Trung học:** Công thức & khái niệm cơ bản.
  - 🎓 **Nâng cao:** Bản chất vật lý / hóa học chuyên sâu.
- **Công Cụ Tính Toán & Thử Nghiệm Tương Tác:**
  - Tính toán JavaScript thuần (chu vi $C = 2\pi r$, quãng đường $S = C \cdot n$, điện năng $E = P \cdot t$, độ dốc cầu thang $\% = \frac{H}{L} \cdot 100\%$, định luật phản xạ gương $\theta_r = \theta_i$).
  - Có unit test độc lập chạy bằng `node --experimental-strip-types --test`.
- **Lịch Sử & Tiến Trình Học Tập Local:**
  - Lưu lịch sử và tiến trình học (số vật thể, chủ đề, chuỗi khám phá streak ngày) trong `localStorage`.
  - Nhận diện vật thể đã từng chụp trước đây để gợi ý bài học mở rộng.
  - Khám phá hôm nay (Daily Discovery) thay đổi theo ngày.
- **PWA Thật 100%:**
  - Web App Manifest (`public/manifest.json`) hỗ trợ Android Chrome & Desktop.
  - Service Worker (`public/sw.js`) cache app shell và hỗ trợ offline hoàn chỉnh.
  - Custom Native Install Prompt với hướng dẫn cho thiết bị chưa hỗ trợ.

---

## 🛠️ Cấu Trúc Dự Án

```text
SNAPSCIENCE/
├── app/
│   ├── api/analyze/route.ts   # Server Route bảo mật gọi OpenAI Vision
│   ├── globals.css            # TailindCSS + custom scanner animation
│   ├── layout.tsx             # Root layout, Viewport PWA, SW registration
│   └── page.tsx               # Frontend UI tích hợp toàn bộ màn hình v0
├── components/                # UI components
├── lib/
│   ├── ai/                    # AI Provider Abstraction
│   │   ├── provider.ts        # Interface AIProvider
│   │   ├── openai.ts          # OpenAI Vision Provider
│   │   ├── mock.ts            # Demo Mode Mock Provider
│   │   └── index.ts           # Provider Factory
│   ├── calculations.ts        # Hàm tính toán khoa học thuần JS
│   ├── calculations.test.ts   # Unit test cho các công thức
│   ├── camera.ts              # MediaDevice stream manager & upload helper
│   ├── storage.ts             # Storage persistence & Daily Discovery
│   └── types.ts               # TypeScript Interfaces
├── public/
│   ├── manifest.json          # PWA Web App Manifest
│   ├── sw.js                  # Service Worker hỗ trợ Offline
│   └── icon.svg, apple-icon.png
├── .env.example               # Mẫu cấu hình môi trường
├── package.json
└── tsconfig.json
```

---

## 🔧 Hướng Dẫn Cài Đặt & Chạy Local

### 1. Yêu cầu môi trường
- Node.js 18+ (khuyên dùng Node.js 20 hoặc 24)
- pnpm (hoặc npm)

### 2. Cài đặt các gói phụ thuộc
```bash
pnpm install
```

### 3. Cấu hình biến môi trường (Tùy chọn)
Tạo file `.env` ở thư mục gốc nếu muốn sử dụng OpenAI API thật:
```env
OPENAI_API_KEY=sk-proj-xxxx...
```
*Lưu ý:* Nếu không điền `OPENAI_API_KEY`, ứng dụng sẽ **tự động chạy ở Demo Mode** giúp bạn trải nghiệm đầy đủ ứng dụng mà không gặp bất kỳ lỗi nào.

### 4. Chạy chế độ Development
```bash
pnpm dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt của bạn.

### 5. Chạy Unit Test
```bash
node --experimental-strip-types --test lib/calculations.test.ts
```

### 6. Build cho Production
```bash
pnpm build
pnpm start
```

---

## 📱 Hướng Dẫn Cài Đặt PWA trên Điện Thoại (Android & iOS)

### Android (Chrome)
1. Truy cập ứng dụng qua Chrome.
2. Nhấn vào banner **"📱 Mang SnapScience theo bạn"** hoặc menu `⋮` ở góc phải trên.
3. Chọn **"Thêm vào màn hình chính" (Add to Home Screen)** $\rightarrow$ **Cài đặt**.

### iOS (Safari)
1. Mở ứng dụng trong Safari.
2. Nhấn biểu tượng **Chia sẻ (Share)** ở thanh công cụ dưới.
3. Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.

---

## 🔒 Quyền Riêng Tư & Bảo Mật Dữ Liệu

- **Chỉ mở camera khi được yêu cầu:** Ứng dụng không tự động bật camera khi mở app.
- **Giải phóng tài nguyên:** Toàn bộ stream camera được dừng ngay khi người dùng chuyển màn hình.
- **Không tự động upload:** Ảnh chỉ được gửi lên server phân tích khi người dùng chủ động bấm "Phân tích ảnh".
- **Bảo mật API Key:** Key OpenAI được gọi hoàn toàn ở phía Server (`app/api/analyze/route.ts`), không bao giờ bị lộ ra client.
- **Lưu trữ dữ liệu cá nhân:** Lịch sử khám phá và tiến trình học tập được lưu hoàn toàn trên Local Storage của thiết bị.

---

## 🚀 Roadmap Phát Triển

- [x] Tích hợp toàn bộ giao diện v0 PWA.
- [x] Camera thật + Upload ảnh fallback.
- [x] AI Provider abstraction (OpenAI + Demo Mock).
- [x] Calculator tương tác & Thử nghiệm mini.
- [x] Quiz kiểm tra kiến thức + Lịch sử học tập.
- [x] PWA offline caching & Install prompt.
- [ ] Tích hợp WebGL 3D cho bài học mô phỏng không gian.
- [ ] Xuất chứng nhận hoàn thành chủ đề bài học.

---

*SnapScience — Được phát triển với định hướng Mang Giáo Dục Trực Quan Tới Mọi Người.*
