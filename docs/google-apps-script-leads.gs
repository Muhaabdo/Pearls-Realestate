// Google Apps Script Web App for Pearls leads
// 1) Create Google Sheet and copy its ID
// 2) Replace SHEET_ID and SHEET_NAME
// 3) Deploy as Web App (Execute as: Me, Access: Anyone)

const SHEET_ID = "1Rqt1Kk-QvY2jvwjT14YXnj0sTGWxggebkBtlLlkVBmg";
const SHEET_NAME = "Leads";
const BASE_HEADERS = [
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
    const headers = ensureHeaders(sheet, data);
    const row = buildRow(headers, data);

    sheet.appendRow(row);
    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
}

function ensureHeaders(sheet, data) {
  const hasHeader = sheet.getLastRow() > 0;
  let headers = hasHeader
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(safe)
    : BASE_HEADERS.slice();

  if (!hasHeader) {
    sheet.appendRow(headers);
  }

  // Add new columns for any fields coming from any form type.
  Object.keys(data).forEach(function (key) {
    if (headers.indexOf(key) === -1) {
      headers.push(key);
      sheet.getRange(1, headers.length).setValue(key);
    }
  });

  return headers;
}

function buildRow(headers, data) {
  return headers.map(function (header) {
    if (header === "timestamp") return new Date();
    return safe(data[header]);
  });
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
