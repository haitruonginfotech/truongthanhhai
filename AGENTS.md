# Hướng dẫn cho AI tiếp quản

Trao đổi và viết tài liệu **bằng tiếng Việt**. Đọc theo thứ tự rồi mới làm:

1. File này (quy tắc lâu dài).
2. `docs/HANDOFF.md` (trạng thái hiện tại, quyết định đã duyệt, việc còn mở).
3. Chỉ các file liên quan đến yêu cầu. Sơ đồ file và lệnh ở `README.md`. Không cần quét lại toàn repo, WordPress, MCP, GitHub hay lịch sử hội thoại.

## Dự án

- Landing page dịch vụ bảo trì/sửa lỗi website (WordPress, OpenCart, Shopify) của **Trương Thanh Hải / Hai Truong IT**, làm lại từ đầu bằng **Astro + Tailwind CSS** (không phải theme Astra của WordPress).
- Web đang chạy: https://truongthanhhai.com (WordPress/Elementor). Đây là nguồn **nội dung** và **phong cách thị giác** (màu, font, nút, card). Không copy code Elementor.
- Mục tiêu: nhẹ, SEO tốt, chuyển đổi ads. Chủ dự án giao việc từng phần; chỉ làm đúng phần được yêu cầu, hỏi lại khi mơ hồ.

## Stack và cấu trúc (không đổi nếu chưa được yêu cầu)

- Astro 7 static output, Tailwind v4 qua `@tailwindcss/vite` (không có `tailwind.config`), TypeScript strict.
- Hiệu ứng: **GSAP + ScrollTrigger** (`src/scripts/motion.ts`), **Three.js** chỉ cho globe hero (`src/scripts/hero-scene.ts`, lazy-load). Không thêm React/Next/UI kit/thư viện animation khác.
- Font tự host qua Fontsource: Inter Variable (chữ chính), JetBrains Mono (eyebrow, số, badge).
- Mỗi section một file trong `src/components/sections/`, dữ liệu khai báo trong frontmatter, ghép tại `src/pages/index.astro`.
- Token màu và CSS component dùng chung ở `src/styles/global.css`; metadata ở `src/config/site.ts`; menu/social ở `src/config/navigation.ts`.

## Quy ước UI bắt buộc

- **Theme:** `data-theme` trên `<html>`, localStorage `tth-theme`, lần đầu luôn **dark**, không theo OS. Chỉ dùng token (`page, panel, footer, alt, deep, ink, muted, line, accent, accent-2, on-accent, danger, glow, glass`) để chạy được cả hai theme. Không hard-code màu trong component.
- **Nhận diện lấy từ web live:** H2 dùng `.section-title .text-gradient`; eyebrow `.section-eyebrow` (mono, có gạch trước); nút `.btn .btn-primary` (gradient #00F260→#00FF95, bo 10px) hoặc `.btn .btn-secondary`; card `.glow-card` (bo 20px).
- **Nút không được di chuyển khi hover/rê chuột** (không magnetic, không trượt mũi tên, không scale). Hover chỉ đổi màu/độ sáng.
- **Không nền lưới tĩnh, không quầng sáng (orb) ở hero, không border dưới hero.** Nền lưới chỉ dùng dạng tương tác `.grid-spotlight` (xem HANDOFF).
- Card nằm trong section có `.grid-spotlight` phải có nền đặc `!bg-panel` + class `spotlight-card` để đè lưới và có quầng sáng giống bên ngoài.
- **Menu:** gạch chân `::before` cao 2px, radius 4px, bottom 9px, gradient 260deg `#1E2229`→`#00F260`; mặc định scaleX(0) origin phải, hover/active/focus scaleX(1) origin trái, 0.3s ease-in-out. Mục active do scroll-spy trong `header.ts` gán (`is-active`, `aria-current="true"`), link cần `data-nav-link`.
- **Motion an toàn:** nội dung phải hiện đủ khi không có JS hoặc bật reduced-motion. Trạng thái ẩn ban đầu chỉ áp dụng dưới `html.motion` (script inline trong `BaseLayout` bật lớp này, tự gỡ sau 2.5s nếu bundle không chạy). Gắn `data-reveal` cho khối hiện khi cuộn, `data-hero-item` cho intro hero. Canvas/animation phải dừng khi ngoài màn hình hoặc tab ẩn.
- HTML semantic, đúng 1 H1, focus rõ, vùng chạm ≥44px, không tràn ngang ở 320px.

## Nội dung và phạm vi

- Không bịa số liệu, khách hàng, giá, SLA, đánh giá, cam kết, chức danh. Chỉ dùng nội dung từ web live hoặc người dùng đưa.
- Social Facebook/LinkedIn đang `href: null`, chờ người dùng gửi URL; không dùng `#` giả.
- `archive/` (bản Elementor bị loại) và `reference/` (HTML/JSON WordPress cũ) chỉ đọc khi cần tra nội dung gốc; không import asset/CSS/script từ đó.
- Form + gửi email qua **Brevo HTTP API** là giai đoạn sau. Secret chỉ ở server, không đưa vào `PUBLIC_*`/client/git. Hosting và nơi lưu lead **chưa chốt** (Netlify chỉ là đề xuất cũ).
- Giữ `PUBLIC_INDEXABLE=false`. Không cài tracking, không push/deploy, không đụng WordPress/DNS/tài khoản khi chỉ được giao sửa local.

## Môi trường làm việc

- Máy người dùng là **Windows**, dự án ở `D:\projects\truongthanhhai`, lệnh dùng `npm.cmd`. `node_modules` là bản Windows.
- Nếu AI chạy trong sandbox Linux: **không chạy `npm install`/`npm ci` vào `node_modules` của dự án** (sẽ lẫn binary Linux). Muốn build kiểm tra thì copy source (bỏ `node_modules`, `dist`, `archive`, `reference`, `.git`) sang thư mục tạm, cài ở đó rồi `npm run verify`. Thêm dependency thì sửa `package.json`/lockfile và nhắc người dùng chạy `npm.cmd install`.
- Sau khi đổi dependency, nếu dev server báo "Cannot find module": tắt server cũ đang giữ cổng 4321, chạy `npm.cmd run dev -- --force`.
- Không để lại file khóa (`.git/index.lock`) khi chạy git trong sandbox; ưu tiên không chạy lệnh git ghi index.

## Kiểm tra và bàn giao mỗi lượt

- Chạy `npm.cmd run verify` (hoặc bản copy như trên) sau thay đổi source. Với UI, xem browser ở kích thước liên quan, cả dark và light. Ghi rõ đâu là kiểm tra kỹ thuật, đâu là thiết kế đã được người dùng duyệt.
- Cập nhật `docs/HANDOFF.md` khi xong một phần: sửa đúng mục trạng thái thay vì nối thêm log. Quy tắc lâu dài mới thì thêm vào file này.
- Chỉ ghi điều đã xác minh. Không ghi "đã deploy", "email hoạt động", "đã duyệt" khi chưa có bằng chứng.
