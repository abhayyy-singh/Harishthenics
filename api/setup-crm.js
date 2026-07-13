/* ================================================
   ONE-TIME SETUP — visit /api/setup-crm once
   - Renames sheet tab to "All Payments"
   - Adds headers
   - Loads 15 historical July 9-10 payments
   ================================================ */

import crypto from 'crypto';

const CRM_SHEET_ID = process.env.CRM_SHEET_ID;
const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT;
const SETUP_KEY = process.env.SETUP_KEY || 'haristhenics2026';

async function getGoogleToken() {
  const sa = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600,
  })).toString('base64url');
  const unsigned = `${header}.${payload}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const sig = signer.sign(sa.private_key, 'base64url');
  const jwt = `${unsigned}.${sig}`;
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const { access_token, error } = await r.json();
  if (error) throw new Error(`Token error: ${error}`);
  return access_token;
}

const HEADERS = [
  'Timestamp', 'Service', 'Name', 'Email', 'Phone',
  'Amount (₹)', 'Payment ID', 'Call Status', 'Notes'
];

// 15 historical payments (July 9-10, 2026)
const HISTORICAL = [
  ['09/07/2026 17:01', 'Personalized Workout Program', 'Priya Bhupendra',  'priyabhupendra@gmail.com',      '+919766061970', 15000, 'pay_TBO99V2rIVzE41', 'Pending', ''],
  ['09/07/2026 17:50', 'Train at Grip&Grab',           'Milan Ramani',     'milan.ramani9258@gmail.com',    '+918758757072', 15000, 'pay_TBOyjF0dIL8QCr', 'Pending', ''],
  ['09/07/2026 18:15', 'Personalized Workout Program', 'Suryansh Chauhan', 'suryanshchauhan9@gmail.com',    '+919760922333', 15000, 'pay_TBPP2tM6lOXQ7y', 'Pending', ''],
  ['09/07/2026 18:33', 'Personalized Workout Program', 'Gargbhawna',       'gargbhawna59@gmail.com',        '+918708067211', 15000, 'pay_TBPiGCUdbZ6fQR', 'Pending', ''],
  ['09/07/2026 18:34', 'Personalized Workout Program', 'Ritika Aggarwal',  'ritikaaggarwal2050@gmail.com',  '+919654472077', 15000, 'pay_TBPisEOWajShl7', 'Pending', ''],
  ['09/07/2026 18:54', 'Personalized Workout Program', 'Rohini Jan',       'rohini22jan@gmail.com',         '+919569565222', 15000, 'pay_TBQ4qpqJUJtJWi', 'Pending', ''],
  ['09/07/2026 19:32', 'Personalized Workout Program', 'Ajay Dwsl',        'ajaydwsl01@gmail.com',          '+919896141636', 15000, 'pay_TBQj2R9Ane8M88', 'Pending', ''],
  ['09/07/2026 21:18', 'Personalized Workout Program', 'Gunu Singh',       'gunusingh5556@gmail.com',       '+16047811458',  15000, 'pay_TBSWvChbsXYLLE', 'Pending', ''],
  ['09/07/2026 22:14', 'Personalized Workout Program', 'Reshu Bansal',     'reshubansal2109@gmail.con',     '+919818161000', 15000, 'pay_TBTTI4AWPr9ay2', 'Pending', 'Email typo: .con'],
  ['09/07/2026 22:19', 'Personalized Workout Program', 'Dwivedi Pooja',    'dwivedipooja0808@gmail.com',    '+918109513343', 15000, 'pay_TBTYyba2uxcL9I', 'Pending', ''],
  ['09/07/2026 22:22', 'Personalized Workout Program', 'Narenderk Sorout', 'narenderksorout@gmail.com',     '+919310198899', 15000, 'pay_TBTc5OluSDpvlH', 'Pending', ''],
  ['09/07/2026 22:41', 'Personalized Workout Program', 'Dhruva Pad',       'dhruvapad1@gmail.com',          '+13062098492',  15000, 'pay_TBTwCVQXVN8XQJ', 'Pending', ''],
  ['09/07/2026 23:05', 'Personalized Workout Program', 'Shaikh',           'shaikhgenx@gmail.com',          '+13467774215',  15000, 'pay_TBULU3pNLkEirC', 'Pending', ''],
  ['10/07/2026 00:55', 'Personalized Workout Program', 'Faraz Ali',        'farazali1995@gmail.com',        '+918937899512', 15000, 'pay_TBWDoqrBBHpGSz', 'Pending', ''],
  ['10/07/2026 01:42', 'Personalized Workout Program', 'Vivek Roy',        'vivekroy83@gmail.com',          '+447858177388', 15000, 'pay_TBX1TQJM2Lvz0Z', 'Pending', ''],
];

export default async function handler(req, res) {
  // Simple key check so random people can't call this
  const key = req.query.key;
  if (key !== SETUP_KEY) {
    return res.status(401).json({ error: 'Add ?key=haristhenics2026 to the URL' });
  }

  try {
    const token = await getGoogleToken();
    const base  = `https://sheets.googleapis.com/v4/spreadsheets/${CRM_SHEET_ID}`;
    const auth  = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 1. Get spreadsheet info — find tab by gid 215352154 or first available
    const infoRes = await fetch(base, { headers: auth });
    const info    = await infoRes.json();
    if (!info.sheets?.length) throw new Error('No sheets found');

    // Try to find the specific tab the user shared (gid=215352154)
    let targetSheet = info.sheets.find(s => s.properties.sheetId === 215352154);
    // Fallback: first untitled/Sheet1 tab
    if (!targetSheet) targetSheet = info.sheets.find(s => ['Untitled', 'Sheet1', ''].includes(s.properties.title));
    // Last fallback: first sheet
    if (!targetSheet) targetSheet = info.sheets[0];

    const sheetId   = targetSheet.properties.sheetId;
    const sheetName = targetSheet.properties.title;

    // 2. Rename that tab to "All Payments" (if not already)
    if (sheetName !== 'All Payments') {
      const renameRes = await fetch(`${base}:batchUpdate`, {
        method: 'POST', headers: auth,
        body: JSON.stringify({
          requests: [{ updateSheetProperties: { properties: { sheetId, title: 'All Payments' }, fields: 'title' } }]
        })
      });
      const renameData = await renameRes.json();
      if (renameData.error) throw new Error(`Rename failed: ${JSON.stringify(renameData.error)}`);
    }

    // 3. Clear existing content and set headers in row 1
    await fetch(`${base}/values/All%20Payments!A1:I1?valueInputOption=USER_ENTERED`, {
      method: 'PUT', headers: auth,
      body: JSON.stringify({ values: [HEADERS] })
    });

    // 4. Append 15 historical entries
    const appendRes = await fetch(
      `${base}/values/All%20Payments!A2:I:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      { method: 'POST', headers: auth, body: JSON.stringify({ values: HISTORICAL }) }
    );
    const appendData = await appendRes.json();

    return res.status(200).json({
      status: 'done',
      sheetRenamed: sheetName !== 'All Payments' ? `"${sheetName}" → "All Payments"` : 'already correct',
      headersSet: true,
      entriesAdded: HISTORICAL.length,
      updatedRange: appendData.updates?.updatedRange
    });

  } catch (err) {
    console.error('Setup error:', err);
    return res.status(500).json({ error: err.message });
  }
}
