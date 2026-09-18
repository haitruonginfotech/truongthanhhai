# Bàn giao dự án

Cập nhật: 16/09/2026. Tài liệu này là **trạng thái hiện tại**, không phải nhật ký. Quy tắc lâu dài ở `AGENTS.md`, lệnh & sơ đồ file ở `README.md`.

## 1. Tóm tắt 30 giây

- Trang chủ Astro + Tailwind đã dựng đủ: Header → Hero → Services → Issues → Process → Pricing → FAQs → Contact (đã có form) → Footer.
- Nội dung chép từ web WordPress đang chạy; phong cách bám web live (Inter/JetBrains Mono, xanh #00F260/#00FF95, nút gradient, card bo 20px) nhưng làm "đẹp hơn" với GSAP + Three.js.
- Người dùng đang tinh chỉnh giao diện từng chi tiết qua ảnh chụp. **Chưa có xác nhận duyệt thiết kế tổng thể.** Chưa có form, chưa deploy.

## 2. Các section và trạng thái

| Section | File | Điểm chính |
| --- | --- | --- |
| Header | `Header.astro`, `header.ts` | Logo SVG trái; menu 7 mục; switch dark/light dạng track + knob trượt; header sticky mờ nền, co từ 96px → 72px, logo 52 → 42px khi cuộn; scroll-spy highlight mục đang xem (desktop + mobile) |
| Hero | `sections/Hero.astro` | Eyebrow, H1 "Nhanh. An toàn. Ổn định." (dòng 2 gradient), 2 nút (Khám phá dịch vụ, Tải CV PDF), stats 10+/500+/1k+ đếm lên, ảnh chân dung nghiêng 4.3° + vòng dashed xoay + 3 chip WordPress/OpenCart/Shopify trôi, globe Three.js phía sau. Đã **bỏ** nền lưới, orb sáng góc trái, border dưới |
| Services `#services` | `sections/Services.astro` | 3 card nền đặc; grid spotlight; icon brand WordPress/OpenCart/Shopify; hiệu ứng **border beam** (`beam-card`, conic-gradient + `@property --beam-angle`, mask exclude, lệch pha 3 card); nút "Liên hệ tư vấn" dùng `btn-primary` |
| Issues `#issues` | `sections/Issues.astro` | 6 card sự cố, mỗi card icon Lucide riêng (triangle-alert/bug/gauge/shield-alert/credit-card/monitor-x) hiển thị trần 40px màu danger (đã bỏ icon-tile và nhãn ERR_0x) + CTA liên hệ; nền `page` |
| Process `#process` | `sections/Process.astro` | 4 bước; hàng đầu card: số 01–04 mono muted (bỏ vòng tròn) + icon tile nền accent bên phải (file-text/search/wrench/package-check); line nối vẽ theo cuộn; card nền đặc; grid spotlight |
| Pricing `#pricing` | `sections/Pricing.astro` | 3 gói; gói Pro nổi bật (viền gradient, badge "Khuyên dùng"); còn 1 orb mờ ở giữa |
| FAQs `#faqs` | `sections/Faqs.astro` | Header căn giữa + accordion 1 cột max-w-3xl, hàng phân cách border-b, icon +/− (path dọc ẩn khi mở); câu 1 mở sẵn; dòng "Vẫn còn thắc mắc?" căn giữa cuối section |
| Contact `#contact` | `sections/Contact.astro` | Panel tối 2 cột: trái = heading + 3 cam kết + 3 kênh Hotline/Email/Zalo; phải = form (tên*, ĐT/Zalo*, email, nền tảng, website, mô tả*) với validate blur, honeypot, trạng thái loading/success/error (`contact-form.ts`). Form POST về API route `src/pages/api/contact.ts` (`prerender=false`, adapter `@astrojs/vercel`) — server gửi email Brevo + WhatsApp Cloud API + webhook Apps Script ghi Google Sheet; secret trong `.env`/Vercel env vars, xem `docs/contact-backend/SETUP.md`. **Người dùng đã chốt deploy Vercel**; chưa gửi thử với key thật |
| Footer | `Footer.astro` | 4 cột theo WordPress, copyright © 2024 Hai Truong IT; grid spotlight |

## 3. Hệ thống hiệu ứng (cách dùng lại)

- **Reveal/intro (GSAP, `motion.ts`):** gắn `data-reveal` (hiện khi cuộn, batch stagger) hoặc `data-hero-item` (intro hero). Chỉ ẩn khi `<html class="motion">`; reduced-motion hoặc lỗi bundle thì nội dung vẫn hiện. `clearProps: 'transform'` sau animation để hover CSS không bị inline transform đè.
- **Glow card:** `.glow-card` có quầng sáng theo chuột (`--mx/--my` do `motion.ts` gán theo từng card) + viền sáng và nhấc nhẹ 4px khi hover (card được nhấc, **nút thì không**).
- **Grid spotlight** (tham khảo section WHO TEACHES của demowebsg2.com/rdaschool): thêm `class="grid-spotlight relative overflow-hidden"` + `data-grid-spotlight` vào section. `::before` = lưới đường kẻ 24px mờ; `::after` = lưới đậm + quầng sáng lộ qua radial mask 240px quanh con trỏ, bật bằng `.is-cursor-active`. `grid-spotlight.ts` chỉ cập nhật `--mx/--my` bằng rAF; tắt trên thiết bị không hover. Card bên trong: thêm `spotlight-card` và `!bg-panel` để đè lưới và có quầng sáng khớp bên ngoài (cùng bán kính/màu/mask). Đang áp dụng: `#services`, `#process`, footer.
- **Globe Three.js (`hero-scene.ts`):** Fibonacci sphere 620 điểm (mobile 260) + đường nối gần; group tilt (theo chuột, damping theo thời gian) tách group spin (0.07 rad/s); DPR 2 trên desktop chống răng cưa; Fog theo màu `--page` làm mờ bán cầu sau; màu theo `--accent-2`, additive ở dark; lazy-load khi idle, bỏ qua khi reduced-motion/Save-Data, dừng khi ngoài màn hình/tab ẩn. Desktop đặt bên phải sau ảnh, mobile đặt thấp phía sau ảnh và mờ hơn.
- **Đã gỡ theo yêu cầu, không thêm lại:** nút magnetic, mũi tên trượt, scale khi nhấn; nền lưới tĩnh; orb hero; border dưới hero; dot grid canvas (bản làm nhầm).

## 4. Nhận diện & asset

- Token màu dark/light trong `global.css` (`--page, --panel, --glass, --footer, --alt, --deep, --ink, --muted, --line, --accent, --accent-2, --on-accent, --danger, --glow, --logo-start, --logo-end`).
- Logo: SVG người dùng gửi (`public/brand/logo.svg`), inline trong `BrandLogo.astro`; dark gradient #00F260→#00FF95, light #007A30→#0A9459. `public/brand/logo.png` cũ không dùng (có thể xoá khi người dùng đồng ý).
- Favicon: `favicon.svg` (đổi màu theo dark mode trình duyệt), `favicon.ico` 48px, `apple-touch-icon.png` 180px nền tối.
- Gợi ý palette/font của skill ui-ux-pro-max (xanh dương/Exo) **không dùng** vì lệch brand.

## 5. Việc còn mở / cần người dùng quyết định

1. Duyệt thiết kế tổng thể (desktop + mobile, dark + light). Hỏi có muốn bỏ orb còn lại ở Pricing/Contact và áp grid spotlight cho section khác không.
2. Mâu thuẫn nội dung từ web gốc, cần chốt trước khi chạy ads: bảo hành 7 ngày (gói giờ) vs 14 ngày (Quy trình/FAQ); "không giới hạn số lần" (FAQ) vs "≤ 4h/tháng" (gói Pro); báo giá 15–60 phút (Quy trình) vs 30 phút (FAQ); cam kết hoàn tiền 100%; số liệu 10+/500+/1k+.
3. URL Facebook/LinkedIn (điền `socialLinks` trong `navigation.ts`). Footer còn các mục chữ không link như nguồn (các dịch vụ, Khách hàng, Kiểm tra website miễn phí).
4. Form liên hệ: hoàn chỉnh UI + API route `/api/contact` (Brevo + WhatsApp + Sheet webhook), đã chốt hosting **Vercel** (`@astrojs/vercel` trong dependencies — người dùng cần `npm.cmd install`). Còn lại: người dùng điền `.env` theo `.env.example`, test local, rồi khai báo env vars trên Vercel khi deploy. Chưa test với key thật.
5. **Git:** repo trong thư mục có `origin` = `github.com/haitruonginfotech/truongthanhhai` nhưng lịch sử là của PHPMailer (687 commit, chỉ theo dõi `README.md`). Cần quyết định tạo repo mới hoặc nhánh orphan trước khi commit/push. `.gitignore`, `.gitattributes`, `.nvmrc` đã chuẩn bị cho việc đó.
6. Đo Lighthouse/Core Web Vitals trên máy thật (JS chính ~118KB GSAP; chunk Three ~530KB chưa gzip, tải sau idle).

## 6. Xác minh gần nhất

- `astro check` 0 errors/warnings/hints và build thành công sau mọi thay đổi (chạy trên bản copy Linux trong sandbox; người dùng đã `npm.cmd install` và chạy dev trên Windows).
- Headless Chromium: 1 H1; không tràn ngang 320/390/768/1440px; không lỗi console; dark/light; scroll-spy đúng cả 7 mục; switch theme; FAQ; nút không đổi vị trí khi rê chuột; grid spotlight hiện đúng ở Services/Process/Footer; card đè lưới; globe render dark/light/mobile; reduced-motion không ẩn nội dung và không tải Three.
- Chưa kiểm chứng: độ mượt globe trên GPU thật (headless dùng GPU phần mềm), Lighthouse, trình duyệt Safari/Firefox.

## 7. Bước tiếp theo đề xuất

Chờ phản hồi của người dùng. Khi nhận yêu cầu mới: đọc `AGENTS.md`, sửa đúng file ở bảng mục 2–3, kiểm tra dark + light + mobile, rồi cập nhật lại đúng mục liên quan trong file này (không nối log).
