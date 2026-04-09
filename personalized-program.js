/* ================================================
   HARISTHENICS - PERSONALIZED WORKOUT PROGRAM
   personalized-program.js — Modal, Payment, Email, Sheet
   ================================================ */

(function () {
    'use strict';

    const PROGRAM_CONFIG = {
        razorpayKey: 'rzp_live_RZDqqPc9XD0IjO',
        amount: 1500000,
        currency: 'INR',
        businessName: 'Haristhenics',
        description: 'Personalized Workout Program',
        SHEET_URL: 'https://script.google.com/macros/s/AKfycbxvPsHy1S3Mav7cKkJ6k1Ep8oS8dxELeyXLlZZuhXp2HN1wCRGQJx7uzNJcBjPhvzyT6A/exec'
    };

    const PERSONALIZED_SLOTS_OPEN = true;

    function openPersonalizedModal() {
        if (!PERSONALIZED_SLOTS_OPEN) {
            openPersonalizedFullyBookedModal();
            return;
        }
        const modal = document.getElementById('personalizedModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closePersonalizedModal() {
        const modal = document.getElementById('personalizedModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            const form = document.getElementById('personalizedForm');
            if (form) { form.reset(); form.style.display = ''; }
            const successDiv = document.getElementById('personalizedSuccess');
            if (successDiv) successDiv.style.display = 'none';
        }
    }

    function openPersonalizedFullyBookedModal() {
        const modal = document.getElementById('personalized-fullybooked-modal');
        if (modal) modal.classList.add('active');
    }

    function closePersonalizedFullyBookedModal() {
        const modal = document.getElementById('personalized-fullybooked-modal');
        if (modal) modal.classList.remove('active');
    }

    document.addEventListener('DOMContentLoaded', function () {

        const overlay = document.getElementById('personalizedModalOverlay');
        if (overlay) overlay.addEventListener('click', closePersonalizedModal);

        const closeBtn = document.getElementById('personalizedModalClose');
        if (closeBtn) closeBtn.addEventListener('click', closePersonalizedModal);

        const fbOverlay = document.getElementById('personalized-fullybooked-overlay');
        if (fbOverlay) fbOverlay.addEventListener('click', closePersonalizedFullyBookedModal);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closePersonalizedModal();
                closePersonalizedFullyBookedModal();
            }
        });

        const form = document.getElementById('personalizedForm');
        if (!form) return;

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const submitBtn = document.getElementById('personalizedSubmitBtn');
            const name = document.getElementById('personalizedName').value.trim();
            const email = document.getElementById('personalizedEmail').value.trim();
            const phone = document.getElementById('personalizedPhone').value.trim();

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!name || name.length < 2) { showError('Please enter a valid name'); return; }
            if (!email || !emailRegex.test(email)) { showError('Please enter a valid email'); return; }
            if (phone.replace(/\D/g, '').length < 10) { showError('Please enter a valid phone number'); return; }

            if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.disabled = true; }

            try {
                if (typeof Razorpay === 'undefined') throw new Error('Payment system not loaded. Please refresh.');

                const options = {
                    key: PROGRAM_CONFIG.razorpayKey,
                    amount: PROGRAM_CONFIG.amount,
                    currency: PROGRAM_CONFIG.currency,
                    name: PROGRAM_CONFIG.businessName,
                    description: PROGRAM_CONFIG.description,
                    prefill: { name, email, contact: phone },
                    theme: { color: '#000000' },
                    handler: async function (response) {
                        console.log('✅ Payment successful:', response.razorpay_payment_id);

                        const paymentDate = new Date().toLocaleDateString('en-IN', {
                            day: '2-digit', month: '2-digit', year: '2-digit'
                        });

                        // 1. Sheet mein row add karo
                        fetch(PROGRAM_CONFIG.SHEET_URL, {
                            method: 'POST',
                            body: JSON.stringify({
                                service_type: 'personalizedProgram',
                                user_name: name,
                                user_email: email,
                                user_phone: phone,
                                amount: '15000',
                                payment_id: response.razorpay_payment_id,
                                email_status: 'Pending'
                            })
                        }).catch(e => console.warn('Sheet error:', e));

                        // 2. User ko email
                        fetch('/api/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                service_type: 'personalizedProgram',
                                user_name: name,
                                user_email: email,
                                user_phone: phone,
                                amount: '15000',
                                payment_id: response.razorpay_payment_id,
                                payment_date: paymentDate
                            })
                        }).catch(e => console.warn('Email error:', e));

                        // 3. Admin ko email
                        fetch('/api/send-email', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                service_type: 'personalizedProgram',
                                user_name: 'Admin — ' + name,
                                user_email: 'haristhenics06@gmail.com',
                                user_phone: phone,
                                amount: '15000',
                                payment_id: response.razorpay_payment_id,
                                payment_date: paymentDate
                            })
                        }).catch(e => console.warn('Admin email error:', e));

                        // 4. Success show
                        const form = document.getElementById('personalizedForm');
                        const successDiv = document.getElementById('personalizedSuccess');
                        if (form) form.style.display = 'none';
                        if (successDiv) successDiv.style.display = 'block';
                        if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                    },
                    modal: {
                        ondismiss: function () {
                            if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                        }
                    }
                };

                const rzp = new Razorpay(options);
                rzp.on('payment.failed', function (r) {
                    showError('Payment failed: ' + r.error.description);
                    if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                });
                rzp.open();

            } catch (error) {
                showError(error.message || 'Payment failed. Please try again.');
                if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
            }
        });
    });

    function showError(msg) {
        const errDiv = document.getElementById('personalizedError');
        if (errDiv) { errDiv.textContent = msg; errDiv.classList.add('show'); }
    }

    window.openPersonalizedModal = openPersonalizedModal;
    window.closePersonalizedModal = closePersonalizedModal;
    window.openPersonalizedFullyBookedModal = openPersonalizedFullyBookedModal;
    window.closePersonalizedFullyBookedModal = closePersonalizedFullyBookedModal;

    console.log('✅ Personalized Program loaded | Slots open:', PERSONALIZED_SLOTS_OPEN);

})();