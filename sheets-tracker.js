/* ================================================
   HARISTHENICS - SHEETS TRACKER
   sheets-tracker.js
   ================================================ */

const SHEETS_TRACKER_URL = 'https://script.google.com/macros/s/AKfycbxvPsHy1S3Mav7cKkJ6k1Ep8oS8dxELeyXLlZZuhXp2HN1wCRGQJx7uzNJcBjPhvzyT6A/exec';

async function sendToSheet(data) {
  try {
    await fetch(SHEETS_TRACKER_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    console.log('✅ Sheet entry logged:', data.type);
  } catch (err) {
    console.warn('⚠️ Sheet logging failed (non-blocking):', err.message);
  }
}