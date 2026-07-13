/* ================================================
   HARISTHENICS — PAYMENT WEBHOOK
   /api/webhook.js — Vercel Serverless Function

   Razorpay payment.captured event handler.
   1. Verify signature
   2. Log to Google Sheet (always first)
   3. Send customer + admin email
   4. Return 200 → Razorpay won't retry

   Dynamic: amount comes from Razorpay, no hardcoding.
   Extensible: add new service → add one entry to SERVICE_MAP.
   ================================================ */

import crypto from 'crypto';

// ─── Env vars (set in Vercel dashboard) ─────────────────────
const RESEND_API_KEY         = process.env.RESEND_API_KEY;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT; // full JSON string
const CRM_SHEET_ID           = process.env.CRM_SHEET_ID;           // spreadsheet ID
const FROM_EMAIL             = 'Haristhenics <info@haristhenics.com>';
const ADMIN_EMAIL            = 'haristhenics06@gmail.com';

// ─── Service detection ───────────────────────────────────────
// Key = substring that appears in Razorpay payment.description
// Value = internal key used to pick email template + display name
const SERVICE_MAP = [
  { match: 'Personalized Workout Program',          key: 'personalizedProgram' },
  { match: 'Personally Train with Me at Grip',      key: 'harishTraining'      },
  { match: 'Knee Pain Recovery',                    key: 'kneePain'            },
  { match: 'Back Pain',                             key: 'backPain'            },
  { match: 'Shoulder Pain',                         key: 'shoulderPain'        },
  { match: 'Consultation',                          key: 'consultation'        },
  { match: 'Fee Payment',                           key: 'payFee'              },
];

const SERVICE_DISPLAY = {
  personalizedProgram: 'Personalized Workout Program',
  harishTraining:      'Train at Grip&Grab',
  kneePain:            'Knee Pain Recovery Program',
  backPain:            'Back Pain Recovery Program',
  shoulderPain:        'Shoulder Pain Freedom Program',
  consultation:        'Consultation',
  payFee:              'Pay Your Fee',
};

function detectService(description) {
  const desc = description || '';
  for (const { match, key } of SERVICE_MAP) {
    if (desc.toLowerCase().includes(match.toLowerCase())) return key;
  }
  return 'unknown';
}

// ─── Google Sheets (service account JWT, no npm) ─────────────
async function getGoogleToken() {
  const sa = JSON.parse(GOOGLE_SERVICE_ACCOUNT);
  const now = Math.floor(Date.now() / 1000);
  const header  = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const unsigned  = `${header}.${payload}`;
  const signer    = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key, 'base64url');
  const jwt       = `${unsigned}.${signature}`;

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const { access_token, error } = await r.json();
  if (error) throw new Error(`Google token error: ${error}`);
  return access_token;
}

async function logToSheet(row) {
  const token = await getGoogleToken();
  const url   = `https://sheets.googleapis.com/v4/spreadsheets/${CRM_SHEET_ID}/values/All%20Payments!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [row] }),
  });
  if (!r.ok) {
    const err = await r.json();
    throw new Error(JSON.stringify(err));
  }
}

// ─── Email sending ───────────────────────────────────────────
async function sendEmail(to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, reply_to: ADMIN_EMAIL, subject, html }),
  });
  if (!r.ok) throw new Error(await r.text());
}

// ─── Email templates ─────────────────────────────────────────
function buildEmail(serviceKey, d, isAdmin) {
  const service = SERVICE_DISPLAY[serviceKey] || serviceKey;
  const name    = isAdmin ? `Admin — ${d.name}` : d.name;
  const subject = isAdmin
    ? `[New Payment] ${service} — ${d.name}`
    : `${service} — Payment Confirmed`;

  const iconRow = (icon, label, value) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;width:28px;vertical-align:middle;">
        <span style="font-size:18px;">${icon}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px;vertical-align:middle;">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px;color:#222;vertical-align:middle;">${value}</td>
    </tr>`;

  // Service-specific greeting
  const greetings = {
    personalizedProgram: `Your Personalized Workout Program is now confirmed. Please be patient — Harish Sharma will personally call you and reach out within 5–7 days to begin your program.`,
    harishTraining:      `Your personal training at Grip&Grab is now confirmed. All sessions are conducted in-person at Grip&Grab — Harish will reach out within 5–7 working days to confirm your schedule. Sessions run Mon–Sat | 5:30 PM – 8:30 PM.`,
    kneePain:            `Your Knee Pain Recovery Program is now confirmed. Harish Sharma will personally reach out within 5–7 days to guide you through the next steps.`,
    backPain:            `Your Back Pain Recovery Program is now confirmed. Harish Sharma will personally reach out within 5–7 days to guide you through the next steps.`,
    shoulderPain:        `Your Shoulder Pain Freedom Program is now confirmed. Harish Sharma will personally reach out within 5–7 days to guide you through the next steps.`,
    consultation:        `Your consultation is now confirmed. Harish Sharma will reach out within 5–7 working days to schedule your session.`,
    payFee:              `Your payment has been received successfully. Thank you for your trust in Haristhenics.`,
  };

  const greeting = greetings[serviceKey] || `Your payment for ${service} has been received.`;

  const html = `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f7fa;padding:40px 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

  <!-- Header -->
  <tr><td style="background:#111;padding:36px 30px;text-align:center;">
    <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">HARISTHENICS</div>
    <div style="font-size:13px;color:#aaa;margin-top:6px;">${service}</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 30px;">
    <p style="font-size:16px;color:#333;margin:0 0 8px;">Hi ${isAdmin ? d.name : name},</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 28px;">${greeting}</p>

    <!-- Details table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #111;padding-left:16px;margin-bottom:28px;">
      ${iconRow('👤', 'Name',       d.name)}
      ${iconRow('📧', 'Email',      d.email)}
      ${iconRow('📱', 'Phone',      d.phone || '—')}
      ${iconRow('💰', 'Amount',     `₹${Number(d.amount).toLocaleString('en-IN')}`)}
      ${iconRow('🧾', 'Payment ID', d.paymentId)}
      ${iconRow('📅', 'Date',       d.date)}
    </table>

    ${!isAdmin ? `
    <!-- CTA buttons -->
    <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
      <tr>
        <td style="padding-right:12px;">
          <a href="tel:+919971250050" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;">📞 Call Me</a>
        </td>
        <td>
          <a href="https://wa.me/919971250050" style="display:inline-block;background:#25d366;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:8px;">💬 WhatsApp</a>
        </td>
      </tr>
    </table>` : ''}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#999;">© Haristhenics | <a href="https://haristhenics.com" style="color:#7C9CB5;">haristhenics.com</a></p>
  </td></tr>

</table>
</td></tr></table>
</div>`;

  return { subject, html };
}

// ─── Raw body helper (needed for signature verification) ──────
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error',    reject);
  });
}

// ─── Main handler ─────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Read raw body (required for Razorpay signature check)
  let rawBody, body;
  try {
    rawBody = await readRawBody(req);
    body    = JSON.parse(rawBody.toString('utf8'));
  } catch (e) {
    return res.status(400).json({ error: 'Bad request body' });
  }

  // 2. Verify Razorpay webhook signature
  if (RAZORPAY_WEBHOOK_SECRET) {
    const signature = req.headers['x-razorpay-signature'];
    const expected  = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody).digest('hex');
    if (signature !== expected) {
      console.error('Webhook: invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }
  }

  // 3. Only process payment.captured
  if (body.event !== 'payment.captured') {
    return res.status(200).json({ status: 'ignored', event: body.event });
  }

  const payment = body.payload.payment.entity;
  const serviceKey     = detectService(payment.description);
  const serviceDisplay = SERVICE_DISPLAY[serviceKey] || payment.description || 'Unknown';
  const amount  = payment.amount / 100; // paise → rupees
  const name    = payment.notes?.name || payment.notes?.user_name || nameFromEmail(payment.email);
  const date    = new Date(payment.created_at * 1000)
    .toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const data = { name, email: payment.email, phone: payment.contact, amount, paymentId: payment.id, date };

  // 4. Log to sheet FIRST — even if email fails, lead is saved
  let sheetOk = true;
  try {
    await logToSheet([date, serviceDisplay, name, payment.email, payment.contact, amount, payment.id, 'Pending', 'Sending', serviceDisplay]);
  } catch (err) {
    console.error('Sheet log error:', err.message);
    sheetOk = false;
    // Don't return — still try to send email
  }

  // 5. Send customer email
  let emailOk = true;
  try {
    const { subject, html } = buildEmail(serviceKey, data, false);
    await sendEmail(payment.email, subject, html);
  } catch (err) {
    console.error('Customer email error:', err.message);
    emailOk = false;
  }

  // 6. Send admin email
  try {
    const { subject, html } = buildEmail(serviceKey, data, true);
    await sendEmail(ADMIN_EMAIL, subject, html);
  } catch (err) {
    console.error('Admin email error:', err.message);
  }

  // 7. Always return 200 — non-200 makes Razorpay retry
  return res.status(200).json({ status: 'ok', sheetOk, emailOk, service: serviceDisplay });
}

function nameFromEmail(email) {
  if (!email) return 'Customer';
  const local = email.split('@')[0].replace(/[._\-0-9]/g, ' ').trim();
  return local.replace(/\b\w/g, c => c.toUpperCase());
}
