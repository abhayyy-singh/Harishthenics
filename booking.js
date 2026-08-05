/* ================================================
   HARISTHENICS - BOOKING SYSTEM
   booking.js - Modal, Payment, Email
   ================================================ */

// Backend — server-verified pricing + live admin-panel config
const BACKEND_URL = 'https://haristhenics-backend.vercel.app';

// ==========================================
// CONFIGURATION
// ==========================================
const BOOKING_CONFIG = {
    razorpayKey: 'rzp_live_SwjC4BfDWgdJ2o',
    razorpayName: 'Haristhenics',
    
    // EmailJS Account (for Consultation)
    emailjsPublicKey: 'wwGXMDT6ekGDIkKNg',
    emailjsServiceId: 'harish@teamgng',
    emailjsTemplates: {
        consultation: 'template_axjwehu'
    },

    adminEmail: 'haristhenics06@gmail.com',

    bookingTypes: {
        consultation: {
            name: 'Consultation / Workout Program',
            amount: 200000,
            displayAmount: '₹2,000'
        },
    }
};

// Initialize EmailJS
if (typeof emailjs !== 'undefined') {
    emailjs.init(BOOKING_CONFIG.emailjsPublicKey);
    console.log('✅ EmailJS initialized');
}

// ==========================================
// MODAL STATE
// ==========================================
let currentBookingType = null;

// ==========================================
// OPEN BOOKING MODAL
// ==========================================
function openBookingModal(bookingType) {
    // Weekend Class / Virtual Class checkouts are disabled — they predate
    // server-side price verification (client sets the Razorpay amount directly,
    // no order created, no webhook mapping to grant access). Not linked from any
    // live button; this guard closes the only remaining way to reach them
    // (calling the globally-exposed function directly from devtools).
    if (bookingType !== 'consultation') {
        console.error('This booking type is not available.');
        return;
    }
    currentBookingType = bookingType;
    
    const modal = document.getElementById('bookingModal');
    const title = document.getElementById('bookingModalTitle');
    const subtitle = document.getElementById('modalSubtitle');
    const planTypeInput = document.getElementById('planType');
    
    if (!modal) return;
    
    const booking = BOOKING_CONFIG.bookingTypes[bookingType];
    
    if (!booking) {
        console.error('Invalid booking type:', bookingType);
        return;
    }

    // Consultation price/availability comes from the live admin-panel config, not the hardcoded default
    if (bookingType === 'consultation' && window.LIVE_APP_CONFIG) {
        booking.amount = Math.round((window.LIVE_APP_CONFIG.consultationPrice || 0) * 100);
        booking.displayAmount = '₹' + (window.LIVE_APP_CONFIG.consultationPrice || 0).toLocaleString('en-IN');
    }

    // Set modal content
    if (title) title.textContent = 'Book ' + booking.name;
    if (subtitle) subtitle.textContent = 'Complete your booking for ' + booking.displayAmount;
    if (planTypeInput) planTypeInput.value = bookingType;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(function() {
        const firstInput = modal.querySelector('input:not([type="hidden"])');
        if (firstInput) firstInput.focus();
    }, 300);
}

// ==========================================
// CLOSE BOOKING MODAL
// ==========================================
function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    const form = document.getElementById('bookingForm');
    if (form) form.reset();
    
    hideMessages();
    
    const submitBtn = document.querySelector('.booking-form__submit');
    if (submitBtn) {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
    
    currentBookingType = null;
}

// ==========================================
// SHOW/HIDE MESSAGES
// ==========================================
function showSuccess() {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.classList.add('show');
        setTimeout(function() {
            hideMessages();
            closeBookingModal();
        }, 3000);
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        const errorText = errorDiv.querySelector('span');
        if (errorText && message) {
            errorText.textContent = message;
        }
        errorDiv.classList.add('show');
    }
}

function hideMessages() {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    
    if (successDiv) successDiv.classList.remove('show');
    if (errorDiv) errorDiv.classList.remove('show');
}

// ==========================================
// FORM SUBMISSION HANDLER
// ==========================================
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('.booking-form__submit');
        
        const planType = document.getElementById('planType').value;
        const userName = document.getElementById('userName').value.trim();
        const userEmail = document.getElementById('userEmail').value.trim();
        const userPhone = document.getElementById('userPhone').value.trim();
        
        // Validate
        if (!userName || userName.length < 2) {
            showError('Please enter a valid name');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userEmail || !emailRegex.test(userEmail)) {
            showError('Please enter a valid email address');
            return;
        }
        
        const phoneDigits = userPhone.replace(/\D/g, '');
        if (phoneDigits.length < 10) {
            showError('Please enter a valid phone number');
            return;
        }
        
        const booking = BOOKING_CONFIG.bookingTypes[planType];
        if (!booking) {
            showError('Invalid booking type');
            return;
        }
        
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
        hideMessages();
        
        try {
            if (typeof Razorpay === 'undefined') {
                throw new Error('Payment system not loaded. Please refresh the page.');
            }

            // Server creates the order with the real price — browser can no longer set its own amount
            const orderRes = await fetch(`${BACKEND_URL}/api/create-website-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceKey: 'consultation', name: userName, email: userEmail, phone: userPhone })
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Could not start booking. Please try again.');

            const options = {
                key: orderData.keyId,
                order_id: orderData.orderId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: BOOKING_CONFIG.razorpayName,
                description: orderData.serviceTitle,
            };

            Object.assign(options, {
                handler: async function(response) {
                    console.log('✅ Payment successful:', response.razorpay_payment_id);
                    
                   
                    // Send confirmation emails
                    await sendEmails({
                        name: userName,
                        email: userEmail,
                        phone: userPhone,
                        planType: planType,
                        bookingType: booking.name,
                        amount: booking.amount
                    }, response);
                    
                    showSuccess();
                    
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }
                },
                prefill: {
                    name: userName,
                    email: userEmail,
                    contact: userPhone
                },
                theme: {
                    color: '#7C9CB5'
                },
                modal: {
                    ondismiss: function() {
                        if (submitBtn) {
                            submitBtn.classList.remove('loading');
                            submitBtn.disabled = false;
                        }
                        if (planType === 'consultation' && orderData && orderData.orderId) {
                            fetch(BACKEND_URL + '/api/create-website-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'abandon', email: userEmail, razorpayOrderId: orderData.orderId }) }).catch(function(){});
                        }
                    }
                }
            });

            const razorpay = new Razorpay(options);
            
            razorpay.on('payment.failed', function(response) {
                console.error('Payment failed:', response.error);
                showError('Payment failed: ' + response.error.description);
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            });
            
            razorpay.open();
            
        } catch (error) {
            console.error('Payment error:', error);
            showError(error.message || 'Payment failed. Please try again.');
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        }
    });
}

// ==========================================
// SEND CONFIRMATION EMAILS
// ==========================================
async function sendEmails(formData, paymentResponse) {
    // Consultation confirmation + app account are handled server-side by the Razorpay webhook now.
    try {
        // Sheet tracking — kept so Harish's existing tracking sheet still gets every booking
        await sendToSheet({
            type: 'booking',
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            bookingType: formData.bookingType,
            amount: Math.round(formData.amount / 100),
            paymentId: paymentResponse.razorpay_payment_id
        });
        
    } catch (error) {
        console.error('Email error:', error);
    }
}

// ==========================================
// CLOSE MODAL ON ESCAPE KEY
// ==========================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('bookingModal');
        if (modal && modal.classList.contains('active')) {
            closeBookingModal();
        }
    }
});

// ==========================================
// MAKE FUNCTIONS GLOBAL
// ==========================================
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;

console.log('✅ Booking.js loaded successfully');