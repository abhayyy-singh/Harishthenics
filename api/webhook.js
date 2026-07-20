/* ================================================
   HARISTHENICS — PAYMENT WEBHOOK
   /api/webhook.js — Vercel Serverless Function

   Flow:
   1. Verify Razorpay signature
   2. Log to "All Payments" master tab
   3. Log to service-specific tab (auto-created if new service)
   4. Send customer + admin email
   5. Return 200 (non-200 = Razorpay retries for 24h)

   To add a new service: add ONE line to SERVICE_MAP below.
   The sheet tab is created automatically on first payment.
   ================================================ */

import crypto from 'crypto';

const RESEND_API_KEY          = process.env.RESEND_API_KEY;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const APPS_SCRIPT_URL         = process.env.APPS_SCRIPT_URL;
const FROM_EMAIL              = 'Haristhenics <info@haristhenics.com>';
const ADMIN_EMAIL             = 'haristhenics06@gmail.com';

// ─── Add new service here — tab auto-creates on first payment ──
const SERVICE_MAP = [
  { match: 'Personalized Workout Program',     key: 'personalizedProgram', tab: 'Personalized Program' },
  { match: 'Personally Train with Me at Grip', key: 'harishTraining',      tab: 'Train at Grip&Grab'   },
  { match: 'Knee Pain Recovery',               key: 'kneePain',            tab: 'Knee Pain Recovery'   },
  { match: 'Back Pain',                        key: 'backPain',            tab: 'Back Pain Recovery'   },
  { match: 'Consultation',                     key: 'consultation',        tab: 'Consultation'         },
  { match: 'Fee Payment',                      key: 'payFee',              tab: 'Pay Your Fee'         },
];

function detectService(description) {
  const desc = (description || '').toLowerCase();
  for (const svc of SERVICE_MAP) {
    if (desc.includes(svc.match.toLowerCase())) return svc;
  }
  // Unknown service — still log it, tab named after description
  const fallback = description || 'Other';
  return { key: 'other', tab: fallback, match: fallback };
}

// ─── Sheet logging via Apps Script (GET params, no auth needed) ─
async function logToSheets(date, service, name, email, phone, amount, paymentId) {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set('action',    'log');
  url.searchParams.set('date',      date);
  url.searchParams.set('service',   service);
  url.searchParams.set('name',      name);
  url.searchParams.set('email',     email);
  url.searchParams.set('phone',     phone || '');
  url.searchParams.set('amount',    String(amount));
  url.searchParams.set('paymentId', paymentId);
  const r = await fetch(url.toString(), { redirect: 'follow' });
  const j = await r.json();
  if (!j.success) throw new Error(j.error || 'Apps Script error');
}

// ─── Email ─────────────────────────────────────────────────────
function buildEmail(serviceKey, tabName, d, isAdmin) {
  const subject = isAdmin
    ? `[New Payment] ${tabName} — ${d.name}`
    : `${tabName} — Payment Confirmed`;

  const row = (icon, label, val) => `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-size:18px;width:28px">${icon}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #f0f0f0;color:#888;font-size:13px">${label}</td>
      <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;font-weight:600;font-size:14px;color:#222">${val}</td>
    </tr>`;

  const greetings = {
    personalizedProgram: 'Your Personalized Workout Program is now confirmed. Harish Sharma will personally call you within 5–7 days to begin your program.',
    harishTraining:      'Your personal training at Grip&Grab is now confirmed. Harish will reach out within 5–7 working days to confirm your schedule. Sessions: Mon–Sat | 5:30 PM – 8:30 PM.',
    kneePain:            'Your Knee Pain Recovery Program is confirmed. Harish Sharma will personally reach out within 5–7 days with your next steps.',
    backPain:            'Your Back Pain Recovery Program is confirmed. Harish Sharma will personally reach out within 5–7 days with your next steps.',
    shoulderPain:        'Your Shoulder Pain Freedom Program is confirmed. Harish Sharma will personally reach out within 5–7 days with your next steps.',
    consultation:        'Your consultation is confirmed. Harish will reach out within 5–7 working days to schedule your session.',
    payFee:              'Your payment has been received. Thank you for trusting Haristhenics.',
  };

  const greeting = greetings[serviceKey] || `Your payment for ${tabName} has been received.`;
  const displayName = isAdmin ? d.name : d.name;

  const html = `
<div style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f7fa;padding:40px 20px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <tr><td style="background:#111;padding:36px 30px;text-align:center;">
    <div style="font-size:22px;font-weight:700;color:#fff;letter-spacing:1px;">HARISTHENICS</div>
    <div style="font-size:13px;color:#aaa;margin-top:6px;">${tabName}</div>
  </td></tr>
  <tr><td style="padding:36px 30px;">
    <p style="font-size:16px;color:#333;margin:0 0 8px;">Hi ${displayName},</p>
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 28px;">${isAdmin ? `New payment received for <strong>${tabName}</strong>.` : greeting}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-left:3px solid #111;padding-left:16px;margin-bottom:28px;">
      ${row('👤', 'Name',       d.name)}
      ${row('📧', 'Email',      d.email)}
      ${row('📱', 'Phone',      d.phone || '—')}
      ${row('💰', 'Amount',     `₹${Number(d.amount).toLocaleString('en-IN')}`)}
      ${row('🧾', 'Payment ID', d.paymentId)}
      ${row('📅', 'Date',       d.date)}
    </table>
    ${!isAdmin ? `
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
  <tr><td style="background:#f9f9f9;padding:20px 30px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;font-size:12px;color:#999;">© Haristhenics | <a href="https://haristhenics.com" style="color:#7C9CB5;">haristhenics.com</a></p>
  </td></tr>
</table></td></tr></table></div>`;

  return { subject, html };
}

async function sendEmail(to, subject, html) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, reply_to: ADMIN_EMAIL, subject, html }),
  });
  if (!r.ok) throw new Error(await r.text());
}

// ─── Raw body (needed for Razorpay signature) ──────────────────
function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error',    reject);
  });
}

function nameFromEmail(email) {
  if (!email) return 'Customer';
  return (email.split('@')[0].replace(/[._\-0-9]/g, ' ').trim())
    .replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let rawBody, body;
  try {
    rawBody = await readRawBody(req);
    body    = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Bad body' });
  }

  // Signature check
  if (RAZORPAY_WEBHOOK_SECRET) {
    const sig      = req.headers['x-razorpay-signature'];
    const expected = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
    if (sig !== expected) return res.status(400).json({ error: 'Invalid signature' });
  }

  if (body.event !== 'payment.captured') {
    return res.status(200).json({ status: 'ignored', event: body.event });
  }

  const payment = body.payload.payment.entity;
  const svc     = detectService(payment.description);
  const amount  = payment.amount / 100;
  const name    = payment.notes?.name || payment.notes?.user_name || nameFromEmail(payment.email);
  const date    = new Date(payment.created_at * 1000)
    .toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const d = { name, email: payment.email, phone: payment.contact, amount, paymentId: payment.id, date };

  // Log to sheet only — emails are handled by /api/send-email from frontend
  let sheetOk = true;
  try {
    await logToSheets(date, svc.tab, name, payment.email, payment.contact, amount, payment.id);
  } catch (err) {
    console.error('Sheet error:', err.message);
    sheetOk = false;
  }

  return res.status(200).json({ status: 'ok', service: svc.tab, sheetOk });
}
