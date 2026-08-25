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
// CONSULTATION CALENDAR STATE
// ==========================================
let consultAvailableDates = {}; // { 'YYYY-MM-DD': [{id,label,startTime,isFull}] }
let consultCalendarMonth = new Date();
let selectedConsultMode = null; // 'offline' | 'online'
let selectedConsultDate = null;
let selectedConsultSlotId = null;
let selectedConsultSlotLabel = null;
let pendingConsultHoldId = null;

const CONSULT_MODE_LABELS = {
    offline: { subtitle: "Choose when you'd like to visit Grip&Grab" },
    online: { subtitle: "Choose when you'd like to connect online" },
};

const WEEKDAY_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function todayDateKey() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

async function loadConsultAvailability() {
    const hint = document.getElementById('calHint');
    const errorBox = document.getElementById('calendarError');
    if (hint) hint.textContent = 'Loading available dates...';
    try {
        const res = await fetch(BACKEND_URL + '/api/app-config?withSlots=1&mode=' + (selectedConsultMode || 'offline'));
        const data = await res.json();
        consultAvailableDates = {};
        (data.consultationDates || []).forEach(function (d) {
            consultAvailableDates[d.date] = d.slots || [];
        });
        if (Object.keys(consultAvailableDates).length === 0) {
            if (hint) hint.textContent = 'No dates are open for booking right now — please check back soon.';
        } else {
            if (hint) hint.textContent = 'Select a highlighted date to see available times.';
        }
        renderConsultCalendar();
    } catch (err) {
        console.error('Failed to load consultation availability:', err);
        if (errorBox) errorBox.classList.add('show');
        if (hint) hint.textContent = '';
    }
}

function renderConsultCalendar() {
    const weekdaysEl = document.getElementById('calWeekdays');
    const gridEl = document.getElementById('calGrid');
    const monthLabelEl = document.getElementById('calMonthLabel');
    const prevBtn = document.getElementById('calPrevMonth');
    if (!weekdaysEl || !gridEl || !monthLabelEl) return;

    if (weekdaysEl.children.length === 0) {
        WEEKDAY_SHORT.forEach(function (w) {
            const span = document.createElement('span');
            span.textContent = w;
            weekdaysEl.appendChild(span);
        });
    }

    const year = consultCalendarMonth.getFullYear();
    const month = consultCalendarMonth.getMonth();
    monthLabelEl.textContent = MONTH_NAMES[month] + ' ' + year;

    const now = new Date();
    const isCurrentRealMonth = year === now.getFullYear() && month === now.getMonth();
    if (prevBtn) prevBtn.disabled = isCurrentRealMonth;

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = todayDateKey();

    gridEl.innerHTML = '';
    for (let i = 0; i < firstWeekday; i++) {
        gridEl.appendChild(document.createElement('div'));
    }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = String(day);
        btn.className = 'consult-calendar__day';

        const isPast = dateStr < today;
        const hasSlots = !!consultAvailableDates[dateStr];
        if (!isPast && hasSlots) {
            btn.classList.add('consult-calendar__day--open');
            if (dateStr === selectedConsultDate) btn.classList.add('consult-calendar__day--selected');
            btn.addEventListener('click', function () { selectConsultDate(dateStr); });
        } else {
            btn.disabled = true;
        }
        gridEl.appendChild(btn);
    }
}

function selectConsultDate(dateStr) {
    selectedConsultDate = dateStr;
    selectedConsultSlotId = null;
    selectedConsultSlotLabel = null;
    renderConsultCalendar();
    renderConsultSlots();
    updateConsultContinueState();
}

function renderConsultSlots() {
    const wrap = document.getElementById('consultSlots');
    const dateLabel = document.getElementById('consultSlotsDate');
    const grid = document.getElementById('consultSlotsGrid');
    if (!wrap || !dateLabel || !grid) return;

    if (!selectedConsultDate) {
        wrap.style.display = 'none';
        return;
    }

    wrap.style.display = 'block';
    const d = new Date(selectedConsultDate + 'T00:00:00');
    dateLabel.textContent = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    grid.innerHTML = '';
    const slots = consultAvailableDates[selectedConsultDate] || [];
    slots.forEach(function (slot) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = slot.isFull ? slot.label + ' — Full' : slot.label;
        btn.className = 'consult-slots__slot' + (slot.isFull ? ' consult-slots__slot--full' : '') + (slot.id === selectedConsultSlotId ? ' consult-slots__slot--selected' : '');
        if (!slot.isFull) {
            btn.addEventListener('click', function () {
                selectedConsultSlotId = slot.id;
                selectedConsultSlotLabel = slot.label;
                renderConsultSlots();
                updateConsultContinueState();
            });
        } else {
            btn.disabled = true;
        }
        grid.appendChild(btn);
    });
}

function updateConsultContinueState() {
    const btn = document.getElementById('consultContinueBtn');
    if (btn) btn.disabled = !(selectedConsultDate && selectedConsultSlotId);
}

function resetConsultCalendarState() {
    consultCalendarMonth = new Date();
    selectedConsultMode = null;
    selectedConsultDate = null;
    selectedConsultSlotId = null;
    selectedConsultSlotLabel = null;
    pendingConsultHoldId = null;
    const modeStep = document.getElementById('consultStepMode');
    const calendarStep = document.getElementById('consultStepCalendar');
    const formStep = document.getElementById('consultStepForm');
    if (modeStep) modeStep.style.display = 'block';
    if (calendarStep) calendarStep.style.display = 'none';
    if (formStep) formStep.style.display = 'none';
    const slotsWrap = document.getElementById('consultSlots');
    if (slotsWrap) slotsWrap.style.display = 'none';
    updateConsultContinueState();
}

function chooseConsultMode(mode) {
    selectedConsultMode = mode;
    const labels = CONSULT_MODE_LABELS[mode] || CONSULT_MODE_LABELS.offline;
    const subtitleEl = document.getElementById('consultCalendarSubtitle');
    if (subtitleEl) subtitleEl.textContent = labels.subtitle;

    const modeStep = document.getElementById('consultStepMode');
    const calendarStep = document.getElementById('consultStepCalendar');
    if (modeStep) modeStep.style.display = 'none';
    if (calendarStep) calendarStep.style.display = 'block';

    consultCalendarMonth = new Date();
    selectedConsultDate = null;
    selectedConsultSlotId = null;
    selectedConsultSlotLabel = null;
    loadConsultAvailability();
}

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

    // Consultation always starts on the calendar step — a date + time slot
    // must be picked before the details/payment form is even shown.
    resetConsultCalendarState();
    loadConsultAvailability();

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
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

    document.querySelectorAll('.booking-form__submit').forEach(function (btn) {
        btn.classList.remove('loading');
        if (btn.id !== 'consultContinueBtn') btn.disabled = false;
    });

    resetConsultCalendarState();
    currentBookingType = null;
}

// ==========================================
// CALENDAR STEP NAVIGATION
// ==========================================
document.addEventListener('DOMContentLoaded', function () {
    const prevBtn = document.getElementById('calPrevMonth');
    const nextBtn = document.getElementById('calNextMonth');
    const continueBtn = document.getElementById('consultContinueBtn');
    const changeBtn = document.getElementById('consultChangeSlot');
    const modeOfflineBtn = document.getElementById('consultModeOffline');
    const modeOnlineBtn = document.getElementById('consultModeOnline');
    const backToModeBtn = document.getElementById('consultBackToMode');

    if (modeOfflineBtn) modeOfflineBtn.addEventListener('click', function () { chooseConsultMode('offline'); });
    if (modeOnlineBtn) modeOnlineBtn.addEventListener('click', function () { chooseConsultMode('online'); });

    if (backToModeBtn) backToModeBtn.addEventListener('click', function () {
        const modeStep = document.getElementById('consultStepMode');
        const calendarStep = document.getElementById('consultStepCalendar');
        if (calendarStep) calendarStep.style.display = 'none';
        if (modeStep) modeStep.style.display = 'block';
    });

    if (changeBtn) changeBtn.addEventListener('click', function () {
        const calendarStep = document.getElementById('consultStepCalendar');
        const formStep = document.getElementById('consultStepForm');
        if (formStep) formStep.style.display = 'none';
        if (calendarStep) calendarStep.style.display = 'block';
    });

    if (prevBtn) prevBtn.addEventListener('click', function () {
        consultCalendarMonth = new Date(consultCalendarMonth.getFullYear(), consultCalendarMonth.getMonth() - 1, 1);
        renderConsultCalendar();
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
        consultCalendarMonth = new Date(consultCalendarMonth.getFullYear(), consultCalendarMonth.getMonth() + 1, 1);
        renderConsultCalendar();
    });
    if (continueBtn) continueBtn.addEventListener('click', function () {
        if (!selectedConsultDate || !selectedConsultSlotId) return;
        const calendarStep = document.getElementById('consultStepCalendar');
        const formStep = document.getElementById('consultStepForm');
        const summary = document.getElementById('consultSelectedSummary');
        if (summary) {
            const d = new Date(selectedConsultDate + 'T00:00:00');
            const icon = selectedConsultMode === 'online' ? '💻' : '📍';
            summary.textContent = icon + ' ' + d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) + ' — ' + selectedConsultSlotLabel;
        }
        if (calendarStep) calendarStep.style.display = 'none';
        if (formStep) formStep.style.display = 'block';
        setTimeout(function () {
            const modal = document.getElementById('bookingModal');
            const firstInput = modal && modal.querySelector('#consultStepForm input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }, 100);
    });
});

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

            // Server creates the order with the real price — browser can no longer set its own amount.
            // The picked date/slot is reserved server-side too (create-website-order.js), so it can't
            // be double-booked by someone else while this checkout is in progress.
            const orderRes = await fetch(`${BACKEND_URL}/api/create-website-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceKey: 'consultation', name: userName, email: userEmail, phone: userPhone,
                    consultDate: selectedConsultDate, consultSlotId: selectedConsultSlotId, consultMode: selectedConsultMode || 'offline',
                })
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok) throw new Error(orderData.error || 'Could not start booking. Please try again.');
            pendingConsultHoldId = orderData.consultHoldId || null;

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
                            fetch(BACKEND_URL + '/api/create-website-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    action: 'abandon', email: userEmail, razorpayOrderId: orderData.orderId,
                                    consultDate: selectedConsultDate, consultSlotId: selectedConsultSlotId,
                                    consultMode: selectedConsultMode || 'offline', consultHoldId: pendingConsultHoldId,
                                }),
                            }).catch(function(){});
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