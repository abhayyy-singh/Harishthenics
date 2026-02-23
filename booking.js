/* ================================================
   HARISTHENICS - BOOKING SYSTEM
   booking.js - Modal, Payment, Email
   ================================================ */

// ==========================================
// CONFIGURATION - Original values
// ==========================================
const BOOKING_CONFIG = {
    razorpayKey: 'rzp_live_RZDqqPc9XD0IjO',
    razorpayName: 'Haristhenics',
    
    // First EmailJS Account (for Consultation & Sunday Class)
    emailjsPublicKey: 'wwGXMDT6ekGDIkKNg',
    emailjsServiceId: 'harish@teamgng',
    emailjsTemplates: {
        sundayClass: 'template_1k0fnrn',
        consultation: 'template_axjwehu'
    },
    
    // Second EmailJS Account (for Virtual Class)
    emailjsPublicKey2: 'tH2TNN9GskYvmvT62',
    emailjsServiceId2: 'HARISH_EMAIL',
    emailjsTemplateId2: 'virtual_class', // Replace with actual template ID
    
    adminEmail: 'haristhenics06@gmail.com',

    bookingTypes: {
        consultation: {
            name: 'Consultation / Workout Program',
            amount: 200000,
            displayAmount: '₹2,000'
        },
        sundayClass: {
            name: 'Exclusive Sunday Class',
            amount: 100000,
            displayAmount: '₹1,000'
        },
        virtualClass: {
            name: 'Virtual Class',
             amount: 600000,
              displayAmount: '₹6,000'
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
    
    // Set modal content
    if (title) title.textContent = 'Book ' + booking.name;
    if (subtitle) subtitle.textContent = 'Complete your booking for ' + booking.displayAmount;
    if (planTypeInput) planTypeInput.value = bookingType;

// Slot dropdown — sirf Sunday Class ke liye dikhao
const slotGroup = document.getElementById('slotGroup');
if (slotGroup) {
    slotGroup.style.display = bookingType === 'sundayClass' ? 'block' : 'none';
    
    // Disabled slots update karo
    const config = window.SUNDAY_CLASS_CONFIG_EXPORT;
    if (config) {
        document.getElementById('slot-morning').disabled = config.slots.morning.disabled;
        document.getElementById('slot-afternoon').disabled = config.slots.afternoon.disabled;
    }
}
    
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
    
    // Reset form
    const form = document.getElementById('bookingForm');
    if (form) form.reset();
    
    // Hide messages
    hideMessages();
    
    // Reset button state
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
        
        // Get form values
        const planType = document.getElementById('planType').value;
        const userName = document.getElementById('userName').value.trim();
        const userEmail = document.getElementById('userEmail').value.trim();
        const userPhone = document.getElementById('userPhone').value.trim();
    //     const userSlot = document.getElementById('userSlot') 
    // ? document.getElementById('userSlot').value 
    // : '';
        
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
        
        // Show loading
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
        hideMessages();
        
        try {
            // Check if Razorpay is available
            if (typeof Razorpay === 'undefined') {
                throw new Error('Payment system not loaded. Please refresh the page.');
            }
            
            // Initialize Razorpay
            const options = {
                key: BOOKING_CONFIG.razorpayKey,
                amount: booking.amount,
                currency: 'INR',
                name: BOOKING_CONFIG.razorpayName,
                description: booking.name,
                handler: async function(response) {
    console.log('✅ Payment successful:', response.razorpay_payment_id);
    
    // Google Sheet mein data bhejo
    fetch('https://script.google.com/macros/s/AKfycbzwpNxC2MKwl9fn5GNIDMZeeWxHcreLynXsgR5ZnYyhnOyFCFs_Pc_lvy-5iDLW0U2aZw/exec', {
        method: 'POST',
        body: JSON.stringify({
            user_name: userName,
            user_email: userEmail,
            user_phone: userPhone,
            service_type: booking.name,
            amount: booking.displayAmount,
            payment_id: response.razorpay_payment_id
        })
    });
    
    // Send confirmation emails
    await sendEmails({
    name: userName,
    email: userEmail,
    phone: userPhone,
    planType: planType,
    bookingType: booking.name,
    amount: booking.amount
}, response);
                    
                    // Show success
                    showSuccess();
                    
                    // Reset button
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
                    }
                }
            };
            
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
    if (typeof emailjs === 'undefined') {
        console.warn('EmailJS not available');
        return;
    }
    
    try {
        // Virtual Class uses SECOND EmailJS Account
        if (formData.planType === 'virtualClass') {
            // Initialize 2nd EmailJS account
            emailjs.init(BOOKING_CONFIG.emailjsPublicKey2);
            
           let templateParams = {
    user_name: formData.name,
    user_email: formData.email,
    user_phone: formData.phone,
    payment_id: paymentResponse.razorpay_payment_id,
    slot_time: formData.slotTime || ''
};
            
            await emailjs.send(
                BOOKING_CONFIG.emailjsServiceId2,
                BOOKING_CONFIG.emailjsTemplateId2,
                templateParams
            );
            
            console.log('✅ Virtual Class email sent (2nd account)');
            return;
        }
        
        // Consultation & Sunday Class use FIRST EmailJS Account
        // Re-initialize first account (in case it was changed)
        emailjs.init(BOOKING_CONFIG.emailjsPublicKey);
        
        // Select template based on booking type
        const templateId = BOOKING_CONFIG.emailjsTemplates[formData.planType];
        
        // Prepare template params
        let templateParams = {
            user_name: formData.name,
            user_email: formData.email,
            user_phone: formData.phone,
            payment_id: paymentResponse.razorpay_payment_id
        };
        
        // Add specific fields based on booking type
        if (formData.planType === 'sundayClass') {
            templateParams.class_date = getNextSundayFormatted();
        } else if (formData.planType === 'consultation') {
            templateParams.booking_date = getTodayFormatted();
        }
        
        // Send email
        await emailjs.send(
            BOOKING_CONFIG.emailjsServiceId,
            templateId,
            templateParams
        );
        
        console.log('✅ Email sent successfully (1st account)');
        
    } catch (error) {
        console.error('Email error:', error);
    }
}

// Helper: Get next Sunday formatted
function getNextSundayFormatted() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return nextSunday.toLocaleDateString('en-IN', options);
}

// Helper: Get today's date formatted
function getTodayFormatted() {
    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return today.toLocaleDateString('en-IN', options);
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