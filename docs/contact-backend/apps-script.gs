/**
 * (TUỲ CHỌN) Webhook ghi lead vào Google Sheet — chạy trên Google Apps Script.
 * Email (Brevo) và WhatsApp đã được gửi trực tiếp từ API route /api/contact trên Vercel;
 * script này CHỈ làm một việc: nhận lead từ server và append vào Sheet.
 * Cài đặt: xem SETUP.md cùng thư mục.
 */
function doPost(e) {
  try {
    const lead = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('SHEET_ID'));
    let sheet = ss.getSheetByName('Leads');
    if (!sheet) {
      sheet = ss.insertSheet('Leads');
      sheet.appendRow(['Thời gian', 'Họ tên', 'Điện thoại/Zalo', 'Email', 'Nền tảng', 'Website', 'Mô tả sự cố', 'Trang gửi']);
    }
    sheet.appendRow([new Date(), lead.name, lead.phone, lead.email, lead.platform, lead.website, lead.message, lead.page]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}
