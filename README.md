# Trương Thanh Hải — Astro landing page

Landing page dịch vụ bảo trì & sửa lỗi website (WordPress, OpenCart, Shopify), dựng lại từ web WordPress đang chạy (https://truongthanhhai.com) bằng Astro + Tailwind. Trang chủ đã đủ Header, Hero, Dịch vụ, Sự cố, Quy trình, Bảng giá, FAQ, Liên hệ (chưa có form), Footer; có dark/light và hiệu ứng GSAP/Three.js.

**AI tiếp quản:** đọc [AGENTS.md](AGENTS.md) rồi [docs/HANDOFF.md](docs/HANDOFF.md). Không cần đọc lại hội thoại hay quét toàn repo.

## Stack

- Astro 7 (static output), Tailwind CSS 4 qua `@tailwindcss/vite`, TypeScript strict.
- GSAP + ScrollTrigger (motion), Three.js (globe hero, lazy-load).
- Font tự host: `@fontsource-variable/inter`, `@fontsource/jetbrains-mono`.
- Chưa có form backend, analytics, cấu hình deploy.

## Chạy local (Windows / PowerShell)

Yêu cầu Node.js **22.12+** (`.nvmrc` = 22; máy chủ dự án dùng Node 24).

```powershell
cd D:\projects\truongthanhhai
npm.cmd ci            # lần đầu hoặc sau khi package-lock.json thay đổi
npm.cmd run dev       # http://127.0.0.1:4321
npm.cmd run verify    # astro check + build
npm.cmd run preview   # xem bản build trong dist/
```

- Báo "Cannot find module" sau khi thêm package: tắt dev server cũ đang giữ cổng 4321 rồi `npm.cmd run dev -- --force`.
- Sandbox chặn Astro telemetry: `$env:ASTRO_TELEMETRY_DISABLED='1'`.

## Build / deploy (khi đã chốt hosting)

| Thiết lập | Giá trị |
| --- | --- |
| Install | `npm ci` |
| Build | `npm run build` |
| Output | `dist/` |
| Node | 22 (đọc từ `.nvmrc`; hoặc đặt biến `NODE_VERSION=22`) |
| Env | `SITE_URL` (canonical), `PUBLIC_INDEXABLE=true` **chỉ** trên domain production |

Site hoàn toàn tĩnh nên chạy được trên Netlify, Vercel, Cloudflare Pages hoặc hosting thường (upload `dist/`). `package-lock.json` đã chứa binary cho cả Windows và Linux nên build trên CI Linux không cần sửa. Chưa deploy; hosting chưa chốt.

## Git

- Được commit: `src/`, `public/`, `docs/`, cấu hình (`package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc`, `.gitattributes`, `.gitignore`, `.env.example`), `AGENTS.md`, `README.md`.
- Bị ignore: `node_modules/`, `dist/`, `.astro/`, file `.env*` thật, log, file OS/editor, thư mục state của hosting, `archive/`, `reference/`.
- `.gitattributes` chuẩn hoá LF để build Windows/Linux giống nhau.
- **Lưu ý:** repo git hiện có trong thư mục đang trỏ `origin` = `haitruonginfotech/truongthanhhai` nhưng lịch sử/nhánh là của dự án khác (PHPMailer, ~687 commit, chỉ theo dõi `README.md`). Cần chủ dự án quyết định (tạo repo mới / nhánh orphan) trước khi commit hay push.

## Sơ đồ file

| File | Vai trò |
| --- | --- |
| `src/pages/index.astro` | Ghép các section |
| `src/layouts/BaseLayout.astro` | HTML/SEO/favicon, font import, khởi tạo theme + lớp `motion` trước paint, gọi `setupMotion` & `setupGridSpotlights` |
| `src/components/Header.astro` | Logo, menu desktop/mobile, switch dark/light |
| `src/components/Footer.astro` | Footer 4 cột theo WordPress, có grid spotlight |
| `src/components/sections/*.astro` | Hero, Services, Issues, Process, Pricing, Faqs, Contact |
| `src/components/ui/BrandLogo.astro` | Logo SVG inline, gradient theo theme, co lại khi header sticky |
| `src/components/ui/Icon.astro` | Bộ icon SVG nội bộ |
| `src/config/navigation.ts` | Menu (ID section), danh sách footer, social URLs (đang null) |
| `src/config/site.ts` | Tên site, title, description |
| `src/scripts/header.ts` | Đổi theme + lưu, scroll-spy menu, đóng menu mobile |
| `src/scripts/motion.ts` | GSAP: intro hero, đếm số, reveal khi cuộn, line quy trình, FAQ, header scrolled, glow card theo chuột, lazy-load globe |
| `src/scripts/hero-scene.ts` | Globe Three.js sau hero |
| `src/scripts/grid-spotlight.ts` | Cập nhật `--mx/--my` cho hiệu ứng lưới sáng theo chuột |
| `src/styles/global.css` | Tailwind, token dark/light, toàn bộ CSS component |
| `public/brand/logo.svg` | Logo gốc (SVG). `logo.png` cũ không còn dùng |
| `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Favicon |
| `public/images/truong-thanh-hai.webp` | Ảnh chân dung hero |
| `src/pages/404.astro`, `src/pages/robots.txt.ts` | 404 và robots (noindex khi `PUBLIC_INDEXABLE` ≠ `true`) |
| `.env.example` | Mẫu biến môi trường, không chứa secret |
