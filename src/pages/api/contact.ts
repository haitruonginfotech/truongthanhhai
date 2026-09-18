import type { APIRoute } from 'astro';
import { getSecret } from 'astro:env/server';

export const prerender = false;

interface Lead {
  name: string; phone: string; email: string; platform: string;
  website: string; message: string; page: string;
}

const s = (value: unknown, max: number) => String(value ?? '').trim().slice(0, max);
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const POST: APIRoute = async ({ request }) => {
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return json({ ok: false, error: 'Payload không hợp lệ.' }, 400);
  }

  // Honeypot: bot điền field ẩn "company" thì bỏ qua nhưng vẫn trả ok
  if (s(raw.company, 20)) return json({ ok: true });

  const lead: Lead = {
    name: s(raw.name, 200),
    phone: s(raw.phone, 50),
    email: s(raw.email, 200),
    platform: s(raw.platform, 50),
    website: s(raw.website, 300),
    message: s(raw.message, 3000),
    page: s(raw.page, 300),
  };
  if (!lead.phone || lead.message.length < 10) {
    return json({ ok: false, error: 'Thiếu thông tin bắt buộc.' }, 400);
  }

  const configured: string[] = [];
  const tasks: Promise<void>[] = [];
  if (getSecret('BREVO_API_KEY')) { configured.push('brevo'); tasks.push(sendBrevoEmail(lead)); }
  if (getSecret('WHATSAPP_TOKEN') && getSecret('WHATSAPP_PHONE_NUMBER_ID') && getSecret('WHATSAPP_TO')) {
    configured.push('whatsapp'); tasks.push(sendWhatsApp(lead));
  }
  if (getSecret('SHEETS_WEBHOOK_URL')) { configured.push('sheets'); tasks.push(saveToSheet(lead)); }

  if (!configured.length) {
    return json({ ok: false, error: 'Server chưa cấu hình kênh nhận lead (xem .env.example).' }, 503);
  }

  const results = await Promise.allSettled(tasks);
  const failures = results
    .map((result, i) => (result.status === 'rejected' ? `${configured[i]}: ${result.reason}` : ''))
    .filter(Boolean);
  if (failures.length) console.error('[contact]', failures.join(' | '));

  // Chỉ coi là thất bại khi KHÔNG kênh nào gửi được
  const ok = results.some(result => result.status === 'fulfilled');
  return json(ok ? { ok: true } : { ok: false, error: 'Không gửi được qua kênh nào.' }, ok ? 200 : 502);
};

async function sendBrevoEmail(lead: Lead) {
  const row = (label: string, value: string) =>
    `<tr><td style="border:1px solid #ddd;padding:6px"><b>${label}</b></td><td style="border:1px solid #ddd;padding:6px">${escapeHtml(value)}</td></tr>`;
  const html =
    '<h2>Yêu cầu sửa lỗi mới từ website</h2><table style="border-collapse:collapse">' +
    row('Tên', lead.name || '—') + row('Điện thoại/Zalo', lead.phone) + row('Email', lead.email || '—') +
    row('Nền tảng', lead.platform) + row('Website', lead.website || '—') + row('Trang gửi', lead.page) +
    `</table><h3>Mô tả sự cố</h3><p>${escapeHtml(lead.message).replace(/\n/g, '<br>')}</p>`;
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': getSecret('BREVO_API_KEY')! },
    body: JSON.stringify({
      sender: { name: 'Website truongthanhhai.com', email: getSecret('CONTACT_FROM_EMAIL') },
      to: [{ email: getSecret('CONTACT_TO_EMAIL') }],
      replyTo: lead.email ? { email: lead.email, name: lead.name } : undefined,
      subject: `[Lead] ${lead.name || 'Khách'} — ${lead.platform} — ${lead.phone}`,
      htmlContent: html,
    }),
  });
  if (!response.ok) throw new Error(`Brevo ${response.status}: ${await response.text()}`);
}

async function sendWhatsApp(lead: Lead) {
  const body =
    `Lead mới từ truongthanhhai.com\nTên: ${lead.name || '—'}\nSĐT/Zalo: ${lead.phone}\nNền tảng: ${lead.platform}` +
    (lead.website ? `\nWebsite: ${lead.website}` : '') +
    `\n---\n${lead.message.slice(0, 500)}`;
  const response = await fetch(
    `https://graph.facebook.com/v20.0/${getSecret('WHATSAPP_PHONE_NUMBER_ID')}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getSecret('WHATSAPP_TOKEN')}` },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: getSecret('WHATSAPP_TO'),
        type: 'text',
        text: { body },
      }),
    },
  );
  if (!response.ok) throw new Error(`WhatsApp ${response.status}: ${await response.text()}`);
}

async function saveToSheet(lead: Lead) {
  const response = await fetch(getSecret('SHEETS_WEBHOOK_URL')!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lead),
  });
  if (!response.ok) throw new Error(`Sheets webhook ${response.status}`);
}
