// Google Apps Script template code to paste into Google Sheet Extensions -> Apps Script
export const GOOGLE_APPS_SCRIPT_CODE = `
// Google Apps Script for Labor Handler App
function doGet(e) {
  var props = PropertiesService.getScriptProperties();
  var data = props.getProperty('LABOR_APP_DATA') || '{}';
  return ContentService.createTextOutput(data).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var props = PropertiesService.getScriptProperties();
    props.setProperty('LABOR_APP_DATA', contents);
    
    // Also write readable sheets
    var data = JSON.parse(contents);
    updateSheetTabs(data);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function updateSheetTabs(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) return;

  // Labors Tab
  if (data.labors) {
    var laborSheet = ss.getSheetByName("Labors") || ss.insertSheet("Labors");
    laborSheet.clear();
    laborSheet.appendRow(["ID", "Name", "Phone", "Daily Rate", "Created At"]);
    data.labors.forEach(function(l) {
      laborSheet.appendRow([l.id, l.name, l.phone, l.dailyRate, l.createdAt]);
    });
  }

  // Attendance Tab
  if (data.attendance) {
    var attSheet = ss.getSheetByName("Attendance") || ss.insertSheet("Attendance");
    attSheet.clear();
    attSheet.appendRow(["ID", "Labor ID", "Date", "Status", "Amount", "Notes"]);
    data.attendance.forEach(function(a) {
      attSheet.appendRow([a.id, a.laborId, a.date, a.status, a.customAmount, a.notes]);
    });
  }

  // Payments Tab
  if (data.payments) {
    var paySheet = ss.getSheetByName("Payments") || ss.insertSheet("Payments");
    paySheet.clear();
    paySheet.appendRow(["ID", "Labor ID", "Date", "Amount", "Note"]);
    data.payments.forEach(function(p) {
      paySheet.appendRow([p.id, p.laborId, p.date, p.amount, p.note]);
    });
  }
}
`;

// Sync local data to Google Sheet Web App URL
export async function pushToGoogleSheet(url, appData) {
  if (!url || !url.startsWith('http')) return false;

  try {
    const payload = JSON.stringify(appData);
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload
    });
    return true;
  } catch (err) {
    console.error('Google Sheet Push Error:', err);
    return false;
  }
}

// Fetch remote data from Google Sheet Web App URL
export async function pullFromGoogleSheet(url) {
  if (!url || !url.startsWith('http')) return null;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Google Sheet Pull Error:', err);
    return null;
  }
}
