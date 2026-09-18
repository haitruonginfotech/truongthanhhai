type Field = HTMLInputElement | HTMLTextAreaElement;

const MESSAGES = {
  name: 'Tên cần ít nhất 2 ký tự.',
  phone: 'Số điện thoại chưa hợp lệ — cần ít nhất 8 chữ số.',
  email: 'Địa chỉ email chưa hợp lệ.',
  website: 'Địa chỉ website chưa hợp lệ.',
  message: 'Vui lòng mô tả sự cố (tối thiểu 10 ký tự).',
} as const;

const validators: Record<string, (value: string) => string> = {
  name: v => (!v.trim() || v.trim().length >= 2 ? '' : MESSAGES.name),
  phone: v => (/(\d[\s.\-]?){8,}/.test(v.trim()) ? '' : MESSAGES.phone),
  email: v => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : MESSAGES.email),
  website: v => (!v.trim() || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+\S*$/i.test(v.trim()) ? '' : MESSAGES.website),
  message: v => (v.trim().length >= 10 ? '' : MESSAGES.message),
};

export function setupContactForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  form.noValidate = true;

  const endpoint = form.dataset.endpoint || '/api/contact/';
  const successEl = document.querySelector<HTMLElement>('[data-form-success]');
  const statusEl = form.querySelector<HTMLElement>('[data-form-status]');
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-form-submit]');
  const spinner = form.querySelector<SVGElement>('[data-form-spinner]');
  const labelEl = form.querySelector<HTMLElement>('[data-form-submit-label]');

  const errorEl = (field: Field) => document.getElementById(`${field.id}-error`);
  const setError = (field: Field, message: string) => {
    field.setAttribute('aria-invalid', 'true');
    const el = errorEl(field);
    if (el) { el.textContent = message; el.classList.add('is-visible'); }
  };
  const clearError = (field: Field) => {
    field.removeAttribute('aria-invalid');
    const el = errorEl(field);
    if (el) { el.textContent = ''; el.classList.remove('is-visible'); }
  };

  const fields = ['name', 'phone', 'email', 'website', 'message']
    .map(name => form.elements.namedItem(name))
    .filter((el): el is Field => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement);

  fields.forEach(field => {
    field.addEventListener('blur', () => {
      const error = validators[field.name]?.(field.value) ?? '';
      if (error && field.value.trim()) setError(field, error);
      else if (!error) clearError(field);
    });
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') && !(validators[field.name]?.(field.value) ?? '')) clearError(field);
    });
  });

  const setLoading = (on: boolean) => {
    if (submitBtn) submitBtn.disabled = on;
    spinner?.classList.toggle('hidden', !on);
    if (labelEl) labelEl.textContent = on ? 'Đang gửi…' : 'Gửi yêu cầu';
  };
  const showStatus = (message: string, isError: boolean) => {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.style.color = isError ? 'var(--danger)' : 'var(--accent)';
  };
  const showSuccess = () => {
    form.hidden = true;
    if (successEl) { successEl.hidden = false; successEl.focus(); }
  };

  form.addEventListener('submit', async event => {
    event.preventDefault();
    let firstInvalid: Field | null = null;
    fields.forEach(field => {
      const error = validators[field.name]?.(field.value) ?? '';
      if (error) { setError(field, error); firstInvalid = firstInvalid ?? field; }
      else clearError(field);
    });
    if (firstInvalid) { (firstInvalid as Field).focus(); return; }

    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if ((data.company ?? '').trim()) { showSuccess(); return; } // honeypot: silently drop bots

    setLoading(true);
    if (statusEl) statusEl.hidden = true;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, page: location.href, sentAt: new Date().toISOString() }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const payload = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || payload?.ok === false) throw new Error(payload?.error || `HTTP ${response.status}`);
      showSuccess();
    } catch {
      showStatus('Gửi chưa thành công — vui lòng thử lại, hoặc liên hệ trực tiếp qua hotline / Zalo bên cạnh.', true);
    } finally {
      setLoading(false);
    }
  });
}
