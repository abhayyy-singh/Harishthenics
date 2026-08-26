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
            name: 'Appointment',
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
// APPOINTMENT AVAILABILITY STATE
// Whole week (however many days admin has opened) shown in one scrollable
// list — tap any open slot directly, no need to click into a date first.
// ==========================================
let consultAvailableDates = {}; // { 'YYYY-MM-DD': [{id,label,startTime,isFull}] }
let selectedConsultMode = null; // 'offline' | 'online'
let selectedConsultDate = null;
let selectedConsultSlotId = null;
let selectedConsultSlotLabel = null;
let pendingConsultHoldId = null;

const CONSULT_MODE_LABELS = {
    offline: { subtitle: "Choose when you'd like to visit Grip&Grab" },
    online: { subtitle: "Choose when you'd like to connect online" },
};

async function fetchConsultDatesForMode(mode) {
    const res = await fetch(BACKEND_URL + '/api/app-config?withSlots=1&mode=' + mode);
    const data = await res.json();
    const dates = {};
    (data.consultationDates || []).forEach(function (d) {
        dates[d.date] = d.slots || [];
    });
    return dates;
}

// True if there's nothing left to book — no open dates at all, or every slot
// on every open date is already SOLD OUT.
function isModeExhausted(dates) {
    const keys = Object.keys(dates);
    if (keys.length === 0) return true;
    return keys.every(function (k) {
        const slots = dates[k] || [];
        return slots.length === 0 || slots.every(function (s) { return s.isFull; });
    });
}

async function loadConsultAvailability() {
    // The master "Availability" toggle in admin (checked in handleConsultationClick
    // before this modal even opens) is the top-level Notify Me trigger. Below that,
    // a mode can independently run out — no dates opened for it yet, or every slot
    // on every open date already booked — in which case we fall back to the same
    // Notify Me modal rather than showing an empty/all-sold-out calendar.
    const listEl = document.getElementById('consultWeekList');
    const errorBox = document.getElementById('calendarError');
    if (errorBox) errorBox.classList.remove('show');
    // Set fresh every time, not just reference an existing node — renderConsultWeekList()
    // wipes this container's innerHTML on the first successful render, so the original
    // #calHint element is gone for good afterwards. Reusing that stale reference is why
    // switching modes a second time showed no loading state at all, just the previous
    // mode's slots sitting there until new data silently replaced them.
    if (listEl) listEl.innerHTML = '<p class="consult-week__hint">Loading available times...</p>';
    try {
        consultAvailableDates = await fetchConsultDatesForMode(selectedConsultMode || 'offline');

        if (isModeExhausted(consultAvailableDates)) {
            handleConsultModeExhausted();
            return;
        }

        renderConsultWeekList();
    } catch (err) {
        console.error('Failed to load appointment availability:', err);
        if (errorBox) errorBox.classList.add('show');
        if (listEl) listEl.innerHTML = '';
    }
}

// Shows Notify Me immediately with a single-mode message — no waiting on a
// second fetch first. The other mode is checked in the background right
// after; if it's ALSO exhausted, the already-open modal's message is
// upgraded in place to the combined wording. Someone who tries Online then
// Offline — both empty — still ends up seeing one combined message, but
// nobody waits through two sequential loads to get there.
function handleConsultModeExhausted() {
    // Must read selectedConsultMode BEFORE closeBookingModal() — it calls
    // resetConsultCalendarState() internally, which nulls selectedConsultMode.
    // Reading it after meant "the other mode" was miscomputed as the SAME
    // mode we already knew was exhausted, never the real other one — so the
    // background check always re-confirmed the mode we already showed, and
    // always escalated to the (wrong) "both are full" message.
    const modeLabel = selectedConsultMode === 'online' ? 'online' : 'in-person';
    const otherMode = selectedConsultMode === 'online' ? 'offline' : 'online';

    closeBookingModal();
    if (typeof window.openServiceFullyBookedModal === 'function') {
        window.openServiceFullyBookedModal(
            { fullyBookedMessage: 'All ' + modeLabel + ' slots are fully booked right now. You can try the other mode, or get notified when new slots open.' },
            'consultation'
        );
    }

    fetchConsultDatesForMode(otherMode).then(function (otherDates) {
        if (isModeExhausted(otherDates)) {
            const msgEl = document.getElementById('service-fullybooked-message');
            if (msgEl) msgEl.textContent = 'All appointment slots — online and in-person — are fully booked right now.';
        }
    }).catch(function (err) {
        console.error('Failed to check other mode availability:', err);
    });
}

// "18:00" -> "6:00 PM" — mirrors admin's to12h() so the site shows the same
// format the admin picks slots in, just as a single time instead of a range.
function formatTime12h(t) {
    if (!t) return '';
    const parts = t.split(':');
    let h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return h + ':' + m + ' ' + ampm;
}

function renderConsultWeekList() {
    const listEl = document.getElementById('consultWeekList');
    if (!listEl) return;

    const dateKeys = Object.keys(consultAvailableDates).sort();
    listEl.innerHTML = '';

    if (dateKeys.length === 0) {
        const hint = document.createElement('p');
        hint.className = 'consult-week__hint';
        hint.textContent = 'No dates are open for booking right now — please check back soon.';
        listEl.appendChild(hint);
        return;
    }

    dateKeys.forEach(function (dateStr) {
        const slots = consultAvailableDates[dateStr] || [];
        if (slots.length === 0) return;

        const dayBlock = document.createElement('div');
        dayBlock.className = 'consult-week__day';

        const d = new Date(dateStr + 'T00:00:00');
        const header = document.createElement('p');
        header.className = 'consult-week__day-header';
        header.innerHTML = d.toLocaleDateString('en-IN', { weekday: 'long' }) +
            ' <span>' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + '</span>';
        dayBlock.appendChild(header);

        const slotsWrap = document.createElement('div');
        slotsWrap.className = 'consult-week__slots';
        slots.forEach(function (slot) {
            const btn = document.createElement('button');
            btn.type = 'button';
            const timeText = formatTime12h(slot.startTime) || slot.label;
            btn.innerHTML = timeText + (
                !slot.isFull && typeof slot.remaining === 'number'
                    ? ' <span class="consult-slots__slot-left">· ' + slot.remaining + ' left</span>'
                    : ''
            );
            btn.className = 'consult-slots__slot' + (slot.isFull ? ' consult-slots__slot--full' : '') +
                (slot.id === selectedConsultSlotId && dateStr === selectedConsultDate ? ' consult-slots__slot--selected' : '');
            if (!slot.isFull) {
                btn.addEventListener('click', function () {
                    selectedConsultDate = dateStr;
                    selectedConsultSlotId = slot.id;
                    selectedConsultSlotLabel = slot.label;
                    renderConsultWeekList();
                    updateConsultContinueState();
                });
            } else {
                btn.disabled = true;
            }
            slotsWrap.appendChild(btn);
        });
        dayBlock.appendChild(slotsWrap);
        listEl.appendChild(dayBlock);
    });
}

function updateConsultContinueState() {
    const btn = document.getElementById('consultContinueBtn');
    if (btn) btn.disabled = !(selectedConsultDate && selectedConsultSlotId);
}

function resetConsultCalendarState() {
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
    // "Book an " is hardcoded here rather than folded into booking.name, since
    // that field is also sent as the plain "bookingType" label in emails/CRM —
    // "an Appointment" would read oddly there.
    if (title) title.textContent = 'Book an ' + booking.name;
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

    if (continueBtn) continueBtn.addEventListener('click', function () {
        if (!selectedConsultDate || !selectedConsultSlotId) return;
        const calendarStep = document.getElementById('consultStepCalendar');
        const formStep = document.getElementById('consultStepForm');
        const summary = document.getElementById('consultSelectedSummary');
        if (summary) {
            const d = new Date(selectedConsultDate + 'T00:00:00');
            const icon = selectedConsultMode === 'online'
                ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
                : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
            summary.innerHTML = icon + ' ' + d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) + ' — ' + selectedConsultSlotLabel;
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