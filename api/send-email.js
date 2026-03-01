/* ================================================
   HARISTHENICS - EMAIL API
   /api/send-email.js — Vercel Serverless Function
   
   Resend se email bhejo — 100% reliable
   Browser close hone se koi farak nahi
   ================================================ */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'Haristhenics <noreply@haristhenics.com>';
const REPLY_TO = 'haristhenics06@gmail.com';
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyCNEnHecoFJpKvnLRZE_Y9EWIPsCGxN9zlf6tA1ijT0VFGnNY_-JRFbNYB1zFumRqsXg/exec';

// ==========================================
// EMAIL TEMPLATES — Exact same as EmailJS
// ==========================================
const templates = {

    // ------------------------------------------
    // CONSULTATION
    // ------------------------------------------
    consultation: (d) => ({
        subject: `Consultation Booking Confirmed - ${d.user_name}`,
        html: `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background-color:#f4f7fa; padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#7C9CB5 0%,#5a7a91 100%); padding:40px 30px; text-align:center;">
                <div style="font-size:32px; margin-bottom:16px;">✅</div>
                <h1 style="color:#fff; margin:0; font-size:26px; font-weight:600;">Consultation Booking Confirmed!</h1>
            </td></tr>
            <tr><td style="padding:40px 40px 20px 40px;">
                <p style="margin:0; font-size:16px; color:#1a1a1a;">Hi ${d.user_name},</p>
                <p style="margin:12px 0 0 0; font-size:15px; color:#666; line-height:1.6;">Your consultation booking is confirmed! ✅</p>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc; border-radius:12px; border-left:4px solid #7C9CB5;">
                    <tr><td style="padding:20px 25px; border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280; font-size:13px;">📋 Service</span><br>
                        <strong style="color:#1f2937;">Assessment &amp; Consultation</strong>
                    </td></tr>
                    <tr><td style="padding:20px 25px; border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280; font-size:13px;">💰 Amount Paid</span><br>
                        <strong style="color:#7C9CB5; font-size:22px;">₹2,000</strong>
                    </td></tr>
                    <tr><td style="padding:20px 25px; border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280; font-size:13px;">🧾 Payment ID</span><br>
                        <span style="color:#1f2937; font-family:monospace;">${d.payment_id}</span>
                    </td></tr>
                    <tr><td style="padding:20px 25px;">
                        <span style="color:#6b7280; font-size:13px;">📅 Booking Date</span><br>
                        <strong style="color:#1f2937;">${d.booking_date}</strong>
                    </td></tr>
                </table>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px;">
                <div style="background:#e0f2fe; border-left:4px solid #0284c7; padding:20px; border-radius:8px;">
                    <p style="margin:0; color:#075985; font-size:14px; line-height:1.6;">
                        📞 I (Harish Sharma) will call you within a few hours to schedule your consultation.
                    </p>
                </div>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px; text-align:center; background:#f8f9fc; border-top:1px solid #e5e7eb;">
                <p style="margin:16px 0 4px; color:#374151; font-weight:600;">Haristhenics</p>
                <p style="margin:0; color:#6b7280; font-size:13px;">
                    <a href="https://www.instagram.com/haristhenics/" style="color:#7C9CB5;">Instagram</a> &nbsp;|&nbsp;
                    <a href="https://www.youtube.com/@haristhenics06" style="color:#7C9CB5;">YouTube</a> &nbsp;|&nbsp;
                    <a href="https://www.facebook.com/share/1AKMo1YcmU/" style="color:#7C9CB5;">Facebook</a>
                </p>
                <p style="margin:8px 0 0; color:#9ca3af; font-size:11px;">© HS FutureWorld. All rights reserved.</p>
            </td></tr>
        </table>
        </td></tr></table></div>`
    }),

    // ------------------------------------------
    // SUNDAY CLASS
    // ------------------------------------------
    sundayClass: (d) => ({
        subject: `Sunday Class Booking Confirmed - ${d.user_name}`,
        html: `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background-color:#f4f7fa; padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#7C9CB5 0%,#5a7a91 100%); padding:40px 30px; text-align:center;">
                <div style="font-size:32px; margin-bottom:16px;">🎯</div>
                <h1 style="color:#fff; margin:0; font-size:26px; font-weight:600;">Sunday Class Booking Confirmed!</h1>
            </td></tr>
            <tr><td style="padding:40px 40px 20px 40px;">
                <p style="margin:0; font-size:16px; color:#1a1a1a;">Hi ${d.user_name},</p>
                <p style="margin:12px 0 0 0; font-size:15px; color:#666; line-height:1.6;">Your Sunday Class booking is confirmed! 🎯</p>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc; border-radius:12px; border-left:4px solid #7C9CB5;">
                    <tr><td style="padding:20px 25px; border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280; font-size:13px;">📅 Date</span><br>
                        <strong style="color:#7C9CB5; font-size:18px;">${d.class_date}</strong>
                    </td></tr>
                    <tr><td style="padding:20px 25px; border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280; font-size:13px;">⏰ Time</span><br>
                        <strong style="color:#1f2937;">9:00 AM - 11:00 AM</strong>
                    </td></tr>
                    <tr><td style="padding:20px 25px; border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280; font-size:13px;">📍 Location</span><br>
                        <strong style="color:#1f2937;">B-32, 3rd Floor, Lajpat Nagar, New Delhi</strong><br>
                        <a href="https://maps.app.goo.gl/qLY9BBGNsWx9MEoU7" style="color:#7C9CB5; font-size:13px;">View on Google Maps</a>
                    </td></tr>
                    <tr><td style="padding:20px 25px; border-bottom:1px solid #e5e7eb;">
                        <span style="color:#6b7280; font-size:13px;">💰 Amount Paid</span><br>
                        <strong style="color:#7C9CB5; font-size:22px;">₹1,000</strong>
                    </td></tr>
                    <tr><td style="padding:20px 25px;">
                        <span style="color:#6b7280; font-size:13px;">🧾 Payment ID</span><br>
                        <span style="color:#1f2937; font-family:monospace;">${d.payment_id}</span>
                    </td></tr>
                </table>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px;">
                <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:16px 20px; border-radius:8px;">
                    <p style="margin:0; color:#92400e; font-size:14px;">⏳ Please arrive 15 minutes prior to the class.</p>
                </div>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px; text-align:center; background:#f8f9fc; border-top:1px solid #e5e7eb;">
                <p style="margin:16px 0 4px; color:#374151; font-weight:600;">Haristhenics</p>
                <p style="margin:0; color:#6b7280; font-size:13px;">
                    Questions? <a href="mailto:haristhenics06@gmail.com" style="color:#7C9CB5;">haristhenics06@gmail.com</a>
                </p>
                <p style="margin:8px 0; color:#6b7280; font-size:13px;">
                    <a href="https://www.instagram.com/haristhenics/" style="color:#7C9CB5;">Instagram</a> &nbsp;|&nbsp;
                    <a href="https://www.youtube.com/@haristhenics06" style="color:#7C9CB5;">YouTube</a> &nbsp;|&nbsp;
                    <a href="https://www.facebook.com/share/1AKMo1YcmU/" style="color:#7C9CB5;">Facebook</a>
                </p>
                <p style="margin:8px 0 0; color:#9ca3af; font-size:11px;">© HS FutureWorld. All rights reserved.</p>
            </td></tr>
        </table>
        </td></tr></table></div>`
    }),

    // ------------------------------------------
    // VIRTUAL CLASS — Exact template from EmailJS
    // ------------------------------------------
    virtualClass: (d) => ({
        subject: `Virtual Class Payment CONFIRMATION - ${d.user_name}`,
        html: `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background-color:#f4f7fa; padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#7C9CB5 0%,#5a7a91 100%); padding:40px 30px; text-align:center;">
                <div style="background:rgba(255,255,255,0.2); display:inline-block; padding:12px 20px; border-radius:50px; margin-bottom:20px;">
                    <span style="font-size:32px;">🎯</span>
                </div>
                <h1 style="color:#fff; margin:0; font-size:28px; font-weight:600;">Virtual Class Booking Confirmed!</h1>
                <p style="color:rgba(255,255,255,0.9); margin:10px 0 0; font-size:16px;">Your journey to fitness excellence begins here</p>
            </td></tr>
            <tr><td style="padding:40px 40px 20px 40px;">
                <h2 style="color:#1a1a1a; margin:0; font-size:22px; font-weight:600;">Hi ${d.user_name},</h2>
                <p style="color:#666; margin:15px 0 0; font-size:16px; line-height:1.6;">Thank you for booking our Virtual Class! Your payment has been successfully processed.</p>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc; border-radius:12px; border-left:4px solid #7C9CB5;">
                    <tr><td colspan="2" style="padding:25px; text-align:center; border-bottom:1px solid #e5e7eb;">
                        <p style="margin:0; color:#6b7280; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Amount Paid</p>
                        <h2 style="margin:10px 0 0; color:#7C9CB5; font-size:36px; font-weight:700;">₹6,000</h2>
                    </td></tr>
                    <tr>
                        <td style="padding:20px 25px; width:40%; color:#6b7280; font-size:14px; font-weight:600;">📋 Payment ID</td>
                        <td style="padding:20px 25px; color:#1f2937; font-family:monospace; font-size:14px;">${d.payment_id}</td>
                    </tr>
                    <tr>
                        <td style="padding:20px 25px; color:#6b7280; font-size:14px; font-weight:600; border-top:1px solid #e5e7eb;">💻 Program</td>
                        <td style="padding:20px 25px; color:#1f2937; font-size:14px; border-top:1px solid #e5e7eb;">Virtual Class</td>
                    </tr>
                    <tr>
                        <td style="padding:20px 25px; color:#6b7280; font-size:14px; font-weight:600; border-top:1px solid #e5e7eb;">👤 Name</td>
                        <td style="padding:20px 25px; color:#1f2937; font-size:14px; border-top:1px solid #e5e7eb;">${d.user_name}</td>
                    </tr>
                    <tr>
                        <td style="padding:20px 25px 25px; color:#6b7280; font-size:14px; font-weight:600; border-top:1px solid #e5e7eb;">📱 Phone</td>
                        <td style="padding:20px 25px 25px; color:#1f2937; font-size:14px; border-top:1px solid #e5e7eb;">${d.user_phone}</td>
                    </tr>
                </table>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px;">
                <div style="background:#e0f2fe; border-left:4px solid #0284c7; padding:20px; border-radius:8px;">
                    <h3 style="margin:0 0 12px; color:#075985; font-size:16px;">🚀 What Happens Next?</h3>
                    <ul style="margin:0; padding-left:20px; color:#0c4a6e; font-size:14px; line-height:1.8;">
                        <li>Our team will contact you to confirm the class link and timings</li>
                    </ul>
                </div>
            </td></tr>
            <tr><td style="padding:0 40px 30px 40px;">
                <div style="background:#fef3c7; border-left:4px solid #f59e0b; padding:16px 20px; border-radius:8px;">
                    <p style="margin:0; color:#92400e; font-size:14px; line-height:1.6;">
                        <strong>📌 Important:</strong> Please keep this email for your records. Make sure you have a stable internet connection and a quiet space for your virtual sessions.
                    </p>
                </div>
            </td></tr>
            <tr><td style="padding:20px 40px 30px; text-align:center; background:#f8f9fc; border-top:1px solid #e5e7eb;">
                <p style="margin:0 0 4px; color:#374151; font-weight:600;">Haristhenics</p>
                <p style="margin:0; color:#6b7280; font-size:13px;">
                    Questions? <a href="mailto:haristhenics06@gmail.com" style="color:#7C9CB5;">haristhenics06@gmail.com</a>
                </p>
                <p style="margin:8px 0 0; color:#9ca3af; font-size:11px;">© HS FutureWorld. All rights reserved.</p>
            </td></tr>
        </table>
        </td></tr></table></div>`
    }),

    // ------------------------------------------
    // KNEE PAIN / WORKOUT PROGRAM
    // Exact same as EmailJS dark template
    // ------------------------------------------
    kneePain: (d) => ({
        subject: `Your ${d.program_name} is Ready!`,
        html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif; background:#000; padding:20px;">
        <table style="background-color:#000; padding:0 20px; max-width:600px; margin:0 auto;" width="100%" cellspacing="0" cellpadding="0">
            <tbody>
            <tr><td style="padding:40px 40px 20px; text-align:center;">
                <div style="font-size:48px; margin-bottom:16px;">✅</div>
                <h2 style="margin:0; font-size:24px; font-weight:600; color:#fff;">Payment Successful!</h2>
            </td></tr>
            <tr><td style="padding:0 40px 30px;">
                <p style="margin:0; font-size:16px; color:#fff; line-height:1.6;">Hi ${d.user_name},</p>
                <p style="margin:12px 0 0; font-size:15px; color:#888; line-height:1.6;">Your workout program is ready! Access it using the button below.</p>
            </td></tr>
            <tr><td style="padding:0 40px 30px;">
                <table style="background:#111; border:1px solid #1a1a1a; border-radius:8px;" width="100%" cellspacing="0" cellpadding="0">
                    <tbody>
                    <tr><td style="padding:16px 20px; border-bottom:1px solid #1a1a1a;">
                        <p style="margin:0; font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;">Program</p>
                        <p style="margin:4px 0 0; font-size:16px; color:#fff; font-weight:600;">${d.program_name}</p>
                    </td></tr>
                    <tr><td style="padding:16px 20px; border-bottom:1px solid #1a1a1a;">
                        <p style="margin:0; font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;">Amount Paid</p>
                        <p style="margin:4px 0 0; font-size:20px; color:#7C9CB5; font-weight:bold;">₹${d.amount}</p>
                    </td></tr>
                    <tr><td style="padding:16px 20px; border-bottom:1px solid #1a1a1a;">
                        <p style="margin:0; font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;">Payment ID</p>
                        <p style="margin:4px 0 0; font-size:14px; color:#fff; font-family:monospace;">${d.payment_id}</p>
                    </td></tr>
                    <tr><td style="padding:16px 20px;">
                        <p style="margin:0; font-size:12px; color:#888; text-transform:uppercase; letter-spacing:1px;">Date</p>
                        <p style="margin:4px 0 0; font-size:14px; color:#fff;">${d.payment_date}</p>
                    </td></tr>
                    </tbody>
                </table>
            </td></tr>
            <tr><td style="padding:0 40px 40px; text-align:center;">
                <p style="margin:0 0 16px; font-size:14px; color:#888;">👇 Click below to access your program</p>
                <a href="${d.claim_link}" style="display:inline-block; padding:16px 40px; background-color:#7C9CB5; color:#fff; font-size:16px; font-weight:600; text-decoration:none; border-radius:8px;">
                    Access Your Program →
                </a>
                <p style="margin:12px 0 0; font-size:12px; color:#555;">This link is valid for 30 days. Login with Google to unlock.</p>
            </td></tr>
            <tr><td style="padding:30px 40px; border-top:1px solid #1a1a1a; text-align:center;">
                <p style="margin:0; font-size:14px; color:#888;">Questions? Reply to this email.</p>
                <p style="margin:16px 0 0; font-size:13px; color:#555;">© HS FutureWorld. All rights reserved.</p>
            </td></tr>
            </tbody>
        </table></div>`
    }),

    // ------------------------------------------
    // PAY YOUR FEE — Exact template from EmailJS
    // ------------------------------------------
    payFee: (d) => ({
        subject: `Payment Received - ₹${Number(d.amount).toLocaleString('en-IN')} | Haristhenics`,
        html: `
        <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif; background:#f4f7fa; padding:40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <tr><td style="background:linear-gradient(135deg,#7C9CB5 0%,#5a7a91 100%); padding:40px 30px; text-align:center;">
                <div style="background:rgba(255,255,255,0.2); display:inline-block; padding:12px 20px; border-radius:50px; margin-bottom:20px;">
                    <span style="font-size:32px;">✅</span>
                </div>
                <h1 style="color:#fff; margin:0; font-size:28px; font-weight:600;">Payment Successful!</h1>
            </td></tr>
            <tr><td style="padding:40px 40px 20px;">
                <h2 style="color:#1a1a1a; margin:0; font-size:22px;">Hi ${d.user_name},</h2>
                <p style="color:#666; margin:15px 0 0; font-size:16px; line-height:1.6;">Thank you for making the payment. Your transaction has been successfully processed.</p>
            </td></tr>
            <tr><td style="padding:0 40px 30px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fc; border-radius:12px; border-left:4px solid #7C9CB5;">
                    <tr><td colspan="2" style="padding:25px; text-align:center; border-bottom:1px solid #e5e7eb;">
                        <p style="margin:0; color:#6b7280; font-size:14px; text-transform:uppercase; letter-spacing:1px;">Amount Paid</p>
                        <h2 style="margin:10px 0 0; color:#7C9CB5; font-size:36px; font-weight:700;">₹${Number(d.amount).toLocaleString('en-IN')}</h2>
                    </td></tr>
                    <tr>
                        <td style="padding:20px 25px; color:#6b7280; font-size:14px; font-weight:600;">📋 Payment ID</td>
                        <td style="padding:20px 25px; color:#1f2937; font-family:monospace; font-size:14px;">${d.payment_id}</td>
                    </tr>
                    <tr>
                        <td style="padding:20px 25px; color:#6b7280; font-size:14px; font-weight:600; border-top:1px solid #e5e7eb;">📅 Date</td>
                        <td style="padding:20px 25px; color:#1f2937; font-size:14px; border-top:1px solid #e5e7eb;">${d.payment_date}</td>
                    </tr>
                    <tr>
                        <td style="padding:20px 25px 25px; color:#6b7280; font-size:14px; font-weight:600; border-top:1px solid #e5e7eb;">👤 Name</td>
                        <td style="padding:20px 25px 25px; color:#1f2937; font-size:14px; border-top:1px solid #e5e7eb;">${d.user_name}</td>
                    </tr>
                </table>
            </td></tr>
            <tr><td style="padding:0 40px 30px; text-align:center;">
                <div style="background:#f3f4f6; padding:20px; border-radius:8px;">
                    <p style="margin:0 0 8px; color:#374151; font-size:14px; font-weight:600;">Need Help?</p>
                    <p style="margin:0; color:#6b7280; font-size:13px;">
                        Contact us at <a href="mailto:haristhenics06@gmail.com" style="color:#7C9CB5;">haristhenics06@gmail.com</a>
                    </p>
                </div>
            </td></tr>
            <tr><td style="padding:20px 40px 30px; background:#f8f9fc; border-top:1px solid #e5e7eb; text-align:center;">
                <p style="margin:0 0 4px; color:#1f2937; font-weight:600;">Haristhenics</p>
                <p style="margin:0; color:#6b7280; font-size:13px;">This is an automated payment confirmation.</p>
                <p style="margin:8px 0 0; color:#9ca3af; font-size:11px;">© HS FutureWorld. All rights reserved.</p>
            </td></tr>
        </table>
        </td></tr></table></div>`
    })
};

// ==========================================
// SEND EMAIL VIA RESEND
// ==========================================
async function sendViaResend(to, subject, html) {
    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: FROM_EMAIL,
            to,
            reply_to: REPLY_TO,
            subject,
            html
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Resend API error');
    }

    return await response.json();
}

// ==========================================
// UPDATE SHEET EMAIL STATUS
// Sheet mein Email Status column update karo
// ==========================================
async function updateSheetEmailStatus(paymentId, status, errorMsg = '') {
    try {
        await fetch(SHEET_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'updateEmailStatus',
                payment_id: paymentId,
                email_status: status,
                email_error: errorMsg
            })
        });
    } catch (e) {
        console.error('Sheet update error:', e);
    }
}

// ==========================================
// MAIN HANDLER
// ==========================================
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const d = req.body;
    const { service_type, payment_id } = d;

    if (!service_type || !payment_id) {
        return res.status(400).json({ error: 'Missing service_type or payment_id' });
    }

    try {
        let emailContent;
        const recipientEmail = d.user_email || d.email;

        if (service_type === 'consultation') {
            emailContent = templates.consultation(d);
        } else if (service_type === 'sundayClass') {
            emailContent = templates.sundayClass(d);
        } else if (service_type === 'virtualClass') {
            emailContent = templates.virtualClass(d);
        } else if (['knee-pain','back-pain','shoulder-pain','ankle-pain','neck-pain','workout'].includes(service_type)) {
            emailContent = templates.kneePain(d);
        } else if (service_type === 'payFee') {
            emailContent = templates.payFee(d);
        } else {
            return res.status(400).json({ error: 'Unknown service_type: ' + service_type });
        }

        // Email bhejo
        await sendViaResend(recipientEmail, emailContent.subject, emailContent.html);

        // Sheet mein Sent update karo
        await updateSheetEmailStatus(payment_id, 'Sent');

        console.log(`✅ Email sent | ${service_type} | ${recipientEmail}`);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Email error:', error.message);

        // Sheet mein Failed update karo
        await updateSheetEmailStatus(payment_id, 'Failed', error.message);

        return res.status(500).json({ error: error.message });
    }
}