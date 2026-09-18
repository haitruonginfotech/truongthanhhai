# Form liên hệ — kiến trúc & cài đặt (Vercel)

## Kiến trúc

```
Form (#contact) ──POST JSON──▶ /api/contact (Astro API route, chạy serverless trên Vercel)
                                   ├─▶ Brevo HTTP API  → email báo lead về hộp thư của Hải
                                   ├─▶ WhatsApp Cloud API → tin nhắn báo lead (tuỳ chọn)
                                   └─▶ Webhook Apps Script → ghi dòng vào Google Sheet (tuỳ chọn)
```

- Code endpoint: `src/pages/api/contact.ts` (`prerender = false`, cần adapter `@astrojs/vercel` — đã cấu hình trong `astro.config.mjs`).
- Secret đọc bằng `getSecret()` phía server: local lấy từ file `.env`, trên Vercel lấy từ Environment Variables. **Không secret nào lọt ra client hay git.**
- Kênh nào lỗi cũng không chặn kênh còn lại; chỉ báo thất bại cho khách khi *mọi* kênh đều lỗi. Lỗi từng kênh được `console.error` (xem trong Vercel > Logs).
- Chống spam: honeypot `company` + validate server-side (name/phone/message, cắt độ dài).

## Test local

1. Chạy `npm.cmd install` (đã thêm dependency `@astrojs/vercel`).
2. Copy `.env.example` → `.env`, điền tối thiểu 3 biến Brevo (`BREVO_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL`).
3. `npm.cmd run dev` → mở site, gửi thử form ở section Liên hệ.
4. Chưa cấu hình biến nào thì endpoint trả lỗi 503 "Server chưa cấu hình kênh nhận lead" — form hiện thông báo lỗi, đó là hành vi đúng.

## Deploy Vercel

1. Push repo lên GitHub, import vào Vercel (framework tự nhận Astro).
2. Project Settings → **Environment Variables**: khai báo đúng tên các biến trong `.env.example` (ít nhất 3 biến Brevo). File `.env` local **không** được dùng trên Vercel.
3. Deploy. Form gọi `/api/contact` cùng domain nên không có vấn đề CORS.

## Brevo (email — nên bật đầu tiên)

1. Brevo → SMTP & API → API Keys → **Generate a new API key** (loại API key, không phải SMTP key) → điền vào `BREVO_API_KEY`.
2. `CONTACT_FROM_EMAIL` phải là sender đã xác thực (Brevo → Settings → Senders). `CONTACT_TO_EMAIL` là hộp thư nhận lead.

## WhatsApp Cloud API (tuỳ chọn)

- `WHATSAPP_PHONE_NUMBER_ID`: Meta App → WhatsApp → API Setup (là ID, không phải số điện thoại).
- `WHATSAPP_TOKEN`: token tạm trên dashboard **hết hạn sau 24h** — dùng lâu dài phải tạo **System User token** (Business Settings → Users → System Users → Generate token, quyền `whatsapp_business_messaging`).
- `WHATSAPP_TO`: số nhận dạng `84938446465`.
- Lưu ý: tin text tự do chỉ gửi được trong "session 24h" kể từ khi số nhận nhắn cho số business; tin chủ động ổn định cần **message template** đã duyệt. Nếu tin không tới dù API trả 200, đây là lý do — khi đó nhờ AI chuyển `sendWhatsApp()` sang dạng template.

## Google Sheet (tuỳ chọn)

1. Tạo Google Sheet, lấy `SHEET_ID` từ URL (`/spreadsheets/d/<SHEET_ID>/edit`).
2. https://script.google.com → New project → dán nội dung `apps-script.gs`.
3. Project Settings (⚙️) → Script Properties → thêm `SHEET_ID` = ID ở bước 1.
4. Deploy → New deployment → Web app → Execute as: **Me**, Who has access: **Anyone** → copy Web app URL (`.../exec`) → điền vào `SHEETS_WEBHOOK_URL`.
5. Sửa script sau này: Deploy → Manage deployments → Edit → New version (URL giữ nguyên).

## Checklist nghiệm thu

- [ ] Gửi form hợp lệ → khách thấy panel "Đã nhận được yêu cầu"; email về hộp thư; (nếu bật) WhatsApp + dòng mới trong Sheet.
- [ ] Bỏ trống tên/điện thoại/mô tả → lỗi đỏ dưới đúng field, không gửi request.
- [ ] Tắt hết biến env → form báo lỗi lịch sự, không crash.
