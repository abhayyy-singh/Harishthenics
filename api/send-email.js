/* ================================================
   HARISTHENICS - EMAIL API
   /api/send-email.js — Vercel Serverless Function
   
   Resend se email bhejo — 100% reliable
   Browser close hone se koi farak nahi
   ================================================ */

const RESEND_API_KEY = process.env.RESEND_API_KEY; // Vercel environment variable
const FROM_EMAIL = 'Haristhenics <noreply@haristhenics.com>';
const ADMIN_EMAIL = 'haristhenics06@gmail.com';
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbz7hcM9cvQft1nAxziRknYU42ZqML8KqVIi9lYPcm5kBoWJ2sPZN77BSR-2g2XYj5NmBw/exec';

// ==========================================
// EMAIL TEMPLATES
// ==========================================
const templates = {

    consultation: (data) => ({
        subject: `Booking Confirmed — Consultation with Harish`,
        html: `
        <div style="font-family:'Poppins',Arial,sans-serif;background:#000;color:#ededed;padding:40px 20px;max-width:600px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;background:#7C9CB5;color:#fff;font-size:18px;font-weight:700;padding:8px 16px;border-radius:8px;">H.</div>
                <h1 style="color:#fff;font-size:24px;margin:16px 0 4px;">Haristhenics</h1>
            </div>
            <h2 style="color:#7C9CB5;font-size:20px;margin-bottom:8px;">Booking Confirmed ✅</h2>
            <p style="color:rgba(255,255,255,0.7);margin-bottom:24px;">Hi ${data.name}, your consultation has been booked successfully.</p>
            <div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">SERVICE</span><br><strong style="color:#fff;">Consultation / Workout Program</strong></p>
                <p style="margin:8px 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">AMOUNT</span><br><strong style="color:#fff;">₹2,000</strong></p>
                <p style="margin:8px 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">DATE</span><br><strong style="color:#fff;">${data.booking_date}</strong></p>
                <p style="margin:8px 0 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">PAYMENT ID</span><br><strong style="color:#fff;font-size:12px;">${data.payment_id}</strong></p>
            </div>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Harish will reach out to you shortly to schedule your consultation call. Please keep your phone accessible.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;">
            <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;">Questions? Email us at haristhenics06@gmail.com</p>
        </div>`
    }),

    sundayClass: (data) => ({
        subject: `Sunday Class Booked — ${data.class_date}`,
        html: `
        <div style="font-family:'Poppins',Arial,sans-serif;background:#000;color:#ededed;padding:40px 20px;max-width:600px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;background:#7C9CB5;color:#fff;font-size:18px;font-weight:700;padding:8px 16px;border-radius:8px;">H.</div>
                <h1 style="color:#fff;font-size:24px;margin:16px 0 4px;">Haristhenics</h1>
            </div>
            <h2 style="color:#7C9CB5;font-size:20px;margin-bottom:8px;">Sunday Class Confirmed ✅</h2>
            <p style="color:rgba(255,255,255,0.7);margin-bottom:24px;">Hi ${data.name}, your Sunday Class slot has been booked!</p>
            <div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">CLASS DATE</span><br><strong style="color:#7C9CB5;font-size:16px;">${data.class_date}</strong></p>
                <p style="margin:8px 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">LOCATION</span><br><strong style="color:#fff;">Lajpat Nagar, New Delhi</strong></p>
                <p style="margin:8px 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">AMOUNT</span><br><strong style="color:#fff;">₹1,000</strong></p>
                <p style="margin:8px 0 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">PAYMENT ID</span><br><strong style="color:#fff;font-size:12px;">${data.payment_id}</strong></p>
            </div>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Please arrive 10 minutes early. Harish will share further details before the class.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;">
            <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;">Questions? Email us at haristhenics06@gmail.com</p>
        </div>`
    }),

    virtualClass: (data) => ({
        subject: `Virtual Class Booking Confirmed`,
        html: `
        <div style="font-family:'Poppins',Arial,sans-serif;background:#000;color:#ededed;padding:40px 20px;max-width:600px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;background:#7C9CB5;color:#fff;font-size:18px;font-weight:700;padding:8px 16px;border-radius:8px;">H.</div>
                <h1 style="color:#fff;font-size:24px;margin:16px 0 4px;">Haristhenics</h1>
            </div>
            <h2 style="color:#7C9CB5;font-size:20px;margin-bottom:8px;">Virtual Class Confirmed ✅</h2>
            <p style="color:rgba(255,255,255,0.7);margin-bottom:24px;">Hi ${data.name}, your Virtual Class has been booked successfully.</p>
            <div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">SERVICE</span><br><strong style="color:#fff;">Virtual Class — Group Sessions</strong></p>
                <p style="margin:8px 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">AMOUNT</span><br><strong style="color:#fff;">₹6,000</strong></p>
                <p style="margin:8px 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">AGE</span><br><strong style="color:#fff;">${data.age}</strong></p>
                <p style="margin:8px 0 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">PAYMENT ID</span><br><strong style="color:#fff;font-size:12px;">${data.payment_id}</strong></p>
            </div>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Harish will contact you with the class schedule and joining details shortly.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;">
            <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;">Questions? Email us at haristhenics06@gmail.com</p>
        </div>`
    }),

    kneePain: (data) => ({
        subject: `Your Knee Pain Program is Ready 🎉`,
        html: `
        <div style="font-family:'Poppins',Arial,sans-serif;background:#000;color:#ededed;padding:40px 20px;max-width:600px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;background:#7C9CB5;color:#fff;font-size:18px;font-weight:700;padding:8px 16px;border-radius:8px;">H.</div>
                <h1 style="color:#fff;font-size:24px;margin:16px 0 4px;">Haristhenics</h1>
            </div>
            <h2 style="color:#7C9CB5;font-size:20px;margin-bottom:8px;">Payment Successful ✅</h2>
            <p style="color:rgba(255,255,255,0.7);margin-bottom:24px;">Hi ${data.name}, your ${data.program_name} is ready to access!</p>
            <div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">PROGRAM</span><br><strong style="color:#fff;">${data.program_name}</strong></p>
                <p style="margin:8px 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">AMOUNT</span><br><strong style="color:#fff;">₹${data.amount}</strong></p>
                <p style="margin:8px 0 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">PAYMENT ID</span><br><strong style="color:#fff;font-size:12px;">${data.payment_id}</strong></p>
            </div>
            <div style="text-align:center;margin:32px 0;">
                <a href="${data.claim_link}" style="display:inline-block;background:#7C9CB5;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px;">Access Your Program →</a>
            </div>
            <p style="color:rgba(255,255,255,0.5);font-size:13px;text-align:center;">This link is valid for 30 days. Login with Google to unlock your course.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;">
            <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;">Questions? Email us at haristhenics06@gmail.com</p>
        </div>`
    }),

    payFee: (data) => ({
        subject: `Payment Received — ₹${data.amount}`,
        html: `
        <div style="font-family:'Poppins',Arial,sans-serif;background:#000;color:#ededed;padding:40px 20px;max-width:600px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:32px;">
                <div style="display:inline-block;background:#7C9CB5;color:#fff;font-size:18px;font-weight:700;padding:8px 16px;border-radius:8px;">H.</div>
                <h1 style="color:#fff;font-size:24px;margin:16px 0 4px;">Haristhenics</h1>
            </div>
            <h2 style="color:#7C9CB5;font-size:20px;margin-bottom:8px;">Payment Received ✅</h2>
            <p style="color:rgba(255,255,255,0.7);margin-bottom:24px;">Hi ${data.name}, your payment has been received successfully.</p>
            <div style="background:#111;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:24px;margin-bottom:24px;">
                <p style="margin:0 0 8px;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">AMOUNT PAID</span><br><strong style="color:#7C9CB5;font-size:20px;">₹${Number(data.amount).toLocaleString('en-IN')}</strong></p>
                <p style="margin:8px 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">DATE</span><br><strong style="color:#fff;">${data.payment_date}</strong></p>
                <p style="margin:8px 0 0;"><span style="color:rgba(255,255,255,0.5);font-size:12px;">PAYMENT ID</span><br><strong style="color:#fff;font-size:12px;">${data.payment_id}</strong></p>
            </div>
            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Keep this email as your payment receipt.</p>
            <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;">
            <p style="color:rgba(255,255,255,0.4);font-size:12px;text-align:center;">Questions? Email us at haristhenics06@gmail.com</p>
        </div>`
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
        body: JSON.stringify({ from: FROM_EMAIL, to, subject, html })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Resend API error');
    }

    return await response.json();
}

// ==========================================
// UPDATE SHEET WITH EMAIL STATUS
// ==========================================
async function updateSheetEmailStatus(paymentId, status, error = '') {
    try {
        await fetch(SHEET_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'updateEmailStatus',
                payment_id: paymentId,
                email_status: status,
                email_error: error
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
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const data = req.body;
    const { service_type, payment_id } = data;

    if (!service_type || !payment_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        // Select template based on service
        let emailContent;
        let recipientEmail = data.user_email || data.email;

        if (service_type === 'consultation') {
            emailContent = templates.consultation(data);
        } else if (service_type === 'sundayClass') {
            emailContent = templates.sundayClass(data);
        } else if (service_type === 'virtualClass') {
            emailContent = templates.virtualClass(data);
        } else if (service_type === 'knee-pain' || service_type === 'workout') {
            emailContent = templates.kneePain(data);
        } else if (service_type === 'payFee') {
            emailContent = templates.payFee(data);
        } else {
            return res.status(400).json({ error: 'Unknown service type' });
        }

        // Send to user
        await sendViaResend(recipientEmail, emailContent.subject, emailContent.html);

        // Update Sheet — email sent ✅
        await updateSheetEmailStatus(payment_id, 'Sent');

        console.log(`✅ Email sent to ${recipientEmail} for ${service_type}`);
        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Email send error:', error);

        // Update Sheet — email failed ❌
        await updateSheetEmailStatus(payment_id, 'Failed', error.message);

        return res.status(500).json({ error: error.message });
    }
}