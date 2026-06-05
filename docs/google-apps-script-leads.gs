// Google Apps Script Web App for Pearls leads
// 1) Create Google Sheet and copy its ID
// 2) Replace SHEET_ID and SHEET_NAME
// 3) Deploy as Web App (Execute as: Me, Access: Anyone)

const SHEET_ID = "1Rqt1Kk-QvY2jvwjT14YXnj0sTGWxggebkBtlLlkVBmg";
const SHEET_NAME = "Leads";
const HEADERS = [
  "timestamp",
  "name",
  "phone",
  "email",
  "project",
  "message",
  "formType",
  "sourcePage",
  "gclid",
  "firstTouchTime",
  "firstTouchPage",
  "sessionId",
  "submittedAt"
];

function doPost(e) {
  try {
    const body = parseBody(e);
    const data = body.data || {};

    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    const row = [
      new Date(),
      safe(data.name),
      safe(data.phone),
      safe(data.email),
      safe(data.project),
      safe(data.message),
      safe(data.formType),
      safe(data.sourcePage),
      safe(data.gclid),
      safe(data.firstTouchTime),
      safe(data.firstTouchPage),
      safe(data.sessionId),
      safe(data.submittedAt)
    ];

    sheet.appendRow(row);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: "Lead endpoint is running" }, 200);
}

function parseBody(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  const raw = e.postData.contents;

  try {
    return JSON.parse(raw);
  } catch (_) {
    // Fallback for x-www-form-urlencoded submissions containing data=...
    try {
      const parsed = JSON.parse(raw.replace(/^data=/, ""));
      return parsed;
    } catch (_) {
      return {};
    }
  }
}

function safe(value) {
  return value === null || typeof value === "undefined" ? "" : String(value);
}

function jsonResponse(payload, code) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
