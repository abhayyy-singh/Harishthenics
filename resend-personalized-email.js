/* ================================================
   MANUAL RESEND — Personalized Program Email
   Jin logo ko email nahi gaya unhe manually bhejne ke liye

   Run karne ka tarika:
   1. Niche RECIPIENTS array mein details bharo
   2. Terminal mein: RESEND_API_KEY=tumhari_resend_key node resend-personalized-email.js
   ================================================ */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Haristhenics <info@haristhenics.com>';
const REPLY_TO = 'haristhenics06@gmail.com';

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxmTrjgKZ2PpEkr8C_KGft2xB2MGkKkUAI9DK3NZOEdxu-E7GvF3CiF1KMetxZdHALfQw/exec';

// 👇 In dono ke details bhar di hai
const RECIPIENTS = [
    {
        user_name: 'Jayanth Anish',
        user_email: 'jayanthanish89@gmail.com',
        user_phone: '+14123909295',
        payment_id: 'pay_Syn68quKU6ZdbQ',
        payment_date: '07/06/26'   // Sun Jun 7, 08:58pm
    },
    {
        user_name: 'Yash Abichandani',
        user_email: 'yashabichandani8@gmail.com',
        user_phone: '+16159552781',
        payment_id: 'pay_SyndHEs6Zk4GJ9',
        payment_date: '07/06/26'   // Sun Jun 7, 09:30pm
    }
];

async function updateSheetEmailStatus(paymentId, status) {
    const params = new URLSearchParams({ action: 'updateEmailStatus', payment_id: paymentId, email_status: status, email_error: '' });
    const res = await fetch(`${SHEET_URL}?${params.toString()}`, { method: 'GET', redirect: 'follow' });
    console.log('   ↳ Sheet update:', await res.text());
}

function buildEmail(d) {
    return {
        subject: `Personalized Program Registration Confirmed — ${d.user_name}`,
        html: `<div style="font-family:'Segoe UI',sans-serif;background:#f4f7fa;padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <tr><td style="background:#000;padding:40px 30px;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:28px;">Haristhenics</h1>
                <p style="color:#aaa;margin:8px 0 0;">Personalized Workout Program</p>
            </td></tr>
            <tr><td style="padding:40px 40px 20px;">
                <h2 style="color:#1a1a1a;margin:0;">Hi ${d.user_name},</h2>
                <p style="color:#666;margin:15px 0 0;line-height:1.6;">Your payment has been received. I (Harish Sharma) will personally call you within <strong>48-72 hours</strong> to schedule your movement assessment over a video call.</p>
            </td></tr>
            <tr><td style="padding:0 40px 30px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc;border-radius:12px;border-left:4px solid #000;">
                    <tr><td style="padding:20px 25px;color:#6b7280;font-size:14px;font-weight:600;">👤 Name</td><td style="padding:20px 25px;color:#1f2937;">${d.user_name}</td></tr>
                    <tr><td style="padding:20px 25px;color:#6b7280;font-size:14px;font-weight:600;border-top:1px solid #e5e7eb;">📧 Email</td><td style="padding:20px 25px;color:#1f2937;border-top:1px solid #e5e7eb;">${d.user_email}</td></tr>
                    <tr><td style="padding:20px 25px;color:#6b7280;font-size:14px;font-weight:600;border-top:1px solid #e5e7eb;">📱 Phone</td><td style="padding:20px 25px;color:#1f2937;border-top:1px solid #e5e7eb;">${d.user_phone}</td></tr>
                    <tr><td style="padding:20px 25px;color:#6b7280;font-size:14px;font-weight:600;border-top:1px solid #e5e7eb;">💰 Amount</td><td style="padding:20px 25px;color:#1f2937;font-weight:700;border-top:1px solid #e5e7eb;">₹15,000</td></tr>
                    <tr><td style="padding:20px 25px;color:#6b7280;font-size:14px;font-weight:600;border-top:1px solid #e5e7eb;">📋 Payment ID</td><td style="padding:20px 25px;color:#1f2937;font-family:monospace;font-size:13px;border-top:1px solid #e5e7eb;">${d.payment_id}</td></tr>
                    <tr><td style="padding:20px 25px 25px;color:#6b7280;font-size:14px;font-weight:600;border-top:1px solid #e5e7eb;">📅 Date</td><td style="padding:20px 25px 25px;color:#1f2937;border-top:1px solid #e5e7eb;">${d.payment_date}</td></tr>
                </table>
            </td></tr>
            <tr><td style="padding:20px 40px 30px;background:#f8f9fc;border-top:1px solid #e5e7eb;text-align:center;">
                <p style="margin:0;color:#6b7280;font-size:13px;">Questions? <a href="mailto:haristhenics06@gmail.com" style="color:#000;">haristhenics06@gmail.com</a></p>
            </td></tr>
        </table></td></tr></table></div>`
    };
}

async function sendViaResend(to, subject, html) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ from: FROM_EMAIL, to, reply_to: REPLY_TO, subject, html })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend API error');
    return data;
}

(async () => {
    if (!RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY nahi mili. Run karo: RESEND_API_KEY=tumhari_key node resend-personalized-email.js');
        process.exit(1);
    }

    for (const person of RECIPIENTS) {
        const email = buildEmail(person);
        try {
            const result = await sendViaResend(person.user_email, email.subject, email.html);
            console.log(`✅ Sent to ${person.user_name} <${person.user_email}> | Resend ID: ${result.id}`);
            await updateSheetEmailStatus(person.payment_id, 'Sent');
        } catch (err) {
            console.error(`❌ Failed for ${person.user_name} <${person.user_email}> | Error: ${err.message}`);
            await updateSheetEmailStatus(person.payment_id, 'Failed');
        }
    }
})();
