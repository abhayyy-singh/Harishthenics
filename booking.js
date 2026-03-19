/* ================================================
   HARISTHENICS - BOOKING SYSTEM
   booking.js - Modal, Payment, Email
   ================================================ */

// ==========================================
// CONFIGURATION
// ==========================================
const BOOKING_CONFIG = {
    razorpayKey: 'rzp_live_RZDqqPc9XD0IjO',
    razorpayName: 'Haristhenics',
    
    // First EmailJS Account (for Consultation & Weekend Class)
    emailjsPublicKey: 'wwGXMDT6ekGDIkKNg',
    emailjsServiceId: 'harish@teamgng',
    emailjsTemplates: {
        weekendClass: 'template_1k0fnrn',
        consultation: 'template_axjwehu'
    },
    
    // Second EmailJS Account (for Virtual Class)
    emailjsPublicKey2: 'tH2TNN9GskYvmvT62',
    emailjsServiceId2: 'HARISH_EMAIL',
    emailjsTemplateId2: 'virtual_class',
    
    adminEmail: 'haristhenics06@gmail.com',

    bookingTypes: {
        consultation: {
            name: 'Consultation / Workout Program',
            amount: 200000,
            displayAmount: '₹2,000'
        },
        weekendClass_saturday: {
            name: 'Weekend Class — Saturday',
            amount: 400000,
            displayAmount: '₹4,000'
        },
        weekendClass_sunday: {
            name: 'Weekend Class — Sunday',
            amount: 400000,
            displayAmount: '₹4,000'
        },
        weekendClass_both: {
            name: 'Weekend Class — Sat + Sun',
            amount: 600000,
            displayAmount: '₹6,000'
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

    // Slot dropdown — weekend class ke liye
    const slotGroup = document.getElementById('slotGroup');
    if (slotGroup) {
        slotGroup.style.display = bookingType.startsWith('weekendClass') ? 'block' : 'none';
        
        const config = window.SUNDAY_CLASS_CONFIG_EXPORT;
        if (config) {
            const morningSlot = document.getElementById('slot-morning');
            const afternoonSlot = document.getElementById('slot-afternoon');
            if (morningSlot) morningSlot.disabled = config.slots.morning.disabled;
            if (afternoonSlot) afternoonSlot.disabled = config.slots.afternoon.disabled;
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
            
            const options = {
                key: BOOKING_CONFIG.razorpayKey,
                amount: booking.amount,
                currency: 'INR',
                name: BOOKING_CONFIG.razorpayName,
                description: booking.name,
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
        // Virtual Class — 2nd EmailJS Account
        if (formData.planType === 'virtualClass') {
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
        
        // Consultation & Weekend Class — 1st EmailJS Account
        emailjs.init(BOOKING_CONFIG.emailjsPublicKey);
        
        // Template select karo
        const templateId = formData.planType.startsWith('weekendClass')
            ? BOOKING_CONFIG.emailjsTemplates.weekendClass
            : BOOKING_CONFIG.emailjsTemplates[formData.planType];
        
        let templateParams = {
            user_name: formData.name,
            user_email: formData.email,
            user_phone: formData.phone,
            payment_id: paymentResponse.razorpay_payment_id
        };
        
        // Weekend class — date + plan type add karo
        if (formData.planType.startsWith('weekendClass')) {
            if (formData.planType === 'weekendClass_saturday') {
                templateParams.class_date = getNextSaturdayFormatted();
            } else if (formData.planType === 'weekendClass_sunday') {
                templateParams.class_date = getNextSundayFormatted();
            } else if (formData.planType === 'weekendClass_both') {
                templateParams.class_date = getNextSaturdayFormatted() + ' & ' + getNextSundayFormatted();
            }
            templateParams.plan_type = BOOKING_CONFIG.bookingTypes[formData.planType].name;
        }
        
        // Consultation — booking date add karo
        if (formData.planType === 'consultation') {
            templateParams.booking_date = getTodayFormatted();
        }
        
        await emailjs.send(
            BOOKING_CONFIG.emailjsServiceId,
            templateId,
            templateParams
        );
        
        console.log('✅ Email sent successfully (1st account)');

        // Sheet tracking
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
// DATE HELPERS
// ==========================================
function getNextSaturdayFormatted() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return nextSaturday.toLocaleDateString('en-IN', options);
}

function getNextSundayFormatted() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysUntilSunday);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return nextSunday.toLocaleDateString('en-IN', options);
}

function getTodayFormatted() {
    const today = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return today.toLocaleDateString('en-IN', options);
}

// ==========================================
// WEEKEND CLASS — DAY SELECTOR LOGIC
// ==========================================
let selectedWeekendPlan = '1class';
let selectedWeekendDay = 'saturday';

function selectWeekendPlan(plan) {
    selectedWeekendPlan = plan;

    document.getElementById('plan-1class').classList.toggle('active', plan === '1class');
    document.getElementById('plan-2class').classList.toggle('active', plan === '2class');

    const dayPicker = document.getElementById('dayPicker');
    if (dayPicker) dayPicker.style.display = plan === '1class' ? 'flex' : 'none';

    const btn = document.getElementById('weekendBookBtn');
    if (btn) btn.textContent = plan === '2class' ? 'Book Now — ₹6,000' : 'Book Now — ₹4,000';
}

function selectWeekendDay(day) {
    selectedWeekendDay = day;
    const satBtn = document.getElementById('dayBtn-saturday');
    const sunBtn = document.getElementById('dayBtn-sunday');
    if (satBtn) satBtn.classList.toggle('active', day === 'saturday');
    if (sunBtn) sunBtn.classList.toggle('active', day === 'sunday');
}

function openWeekendClassBooking() {
    const typeMap = {
        '1class-saturday': 'weekendClass_saturday',
        '1class-sunday':   'weekendClass_sunday',
        '2class':          'weekendClass_both'
    };
    const key = selectedWeekendPlan === '2class' ? '2class' : '1class-' + selectedWeekendDay;
    openBookingModal(typeMap[key]);
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
window.selectWeekendPlan = selectWeekendPlan;
window.selectWeekendDay = selectWeekendDay;
window.openWeekendClassBooking = openWeekendClassBooking;

console.log('✅ Booking.js loaded successfully');