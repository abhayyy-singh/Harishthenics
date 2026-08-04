/* ================================================
   HARISTHENICS - PAY YOUR FEE
   payfee.js - Modal payment with 2nd EmailJS
   ================================================ */

(function() {
    'use strict';

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const PAYFEE_CONFIG = {
        businessName: 'HS FutureWorld',
    };

    // Backend — server-verified order creation
    const BACKEND_URL = 'https://haristhenics-backend.vercel.app';

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const modal = document.getElementById('payfee-modal');
    const overlay = document.getElementById('payfee-overlay');
    const closeBtn = document.getElementById('payfee-close');
    const form = document.getElementById('payFeeForm');
   const nameInput = document.getElementById('payfeeName');
    const phoneInput = document.getElementById('payfeePhone');
    const emailInput = document.getElementById('payfeeEmail');
    const amountInput = document.getElementById('payfeeAmount');
    const amountError = document.getElementById('amountError');
    const submitBtn = document.getElementById('payfeeSubmitBtn');
    const successDiv = document.getElementById('payfeeSuccess');
    const successAmount = document.getElementById('successAmount');
    const successPaymentId = document.getElementById('successPaymentId');
    const stickyBtn = document.getElementById('stickyPayFeeBtn');
//push krne k liye
    // ==========================================
    // MODAL CONTROLS
    // ==========================================
    function openModal() {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            // Reset form after close
            setTimeout(() => {
                if (form) form.reset();
                if (successDiv) successDiv.classList.remove('show');
                if (form) form.classList.remove('hidden');
                if (amountError) amountError.classList.remove('show');
                if (amountInput) amountInput.classList.remove('error');
            }, 300);
        }
    }

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Overlay click
    if (overlay) {
        overlay.addEventListener('click', closeModal);
    }

    // ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // All trigger buttons (uses data-open-payfee attribute)
    document.querySelectorAll('[data-open-payfee]').forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    // Sticky button
    if (stickyBtn) {
        stickyBtn.addEventListener('click', openModal);
    }

   // ==========================================
    // STICKY BUTTON VISIBILITY
    // Hide on: Hero, Footer, Pricing expanded
    // ==========================================
    function updateStickyButton() {
        if (!stickyBtn) return;
        
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const heroSection = document.getElementById('Home');
        const footerSection = document.getElementById('footer-section');
        const pricingSection = document.getElementById('pricing-section');
        
        // Get section positions
        const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 600;
        const footerTop = footerSection ? footerSection.offsetTop : Infinity;
        const pricingTop = pricingSection ? pricingSection.offsetTop : Infinity;
        const pricingBottom = pricingSection ? pricingTop + pricingSection.offsetHeight : Infinity;
        
        // Check if any pricing card is expanded
        const isPricingExpanded = document.querySelector('.pricing-option.active') !== null;
        
        // Check if in pricing section AND expanded
        const inPricingAndExpanded = (scrollY + windowHeight > pricingTop) && 
                                      (scrollY < pricingBottom) && 
                                      isPricingExpanded;
        
        // Hide conditions
        const inHero = scrollY < heroBottom - 100;
        const inFooter = scrollY + windowHeight > footerTop + 100;
        
        if (inHero || inFooter || inPricingAndExpanded) {
            stickyBtn.classList.remove('visible');
        } else {
            stickyBtn.classList.add('visible');
        }
    }

    window.addEventListener('scroll', updateStickyButton, { passive: true });
    
    // Re-check when pricing cards toggle
    document.querySelectorAll('.pricing-option').forEach(option => {
        option.addEventListener('click', () => {
            setTimeout(updateStickyButton, 100);
        });
    });
    // ==========================================
    // AMOUNT VALIDATION (No minimum)
    // ==========================================
    function validateAmount() {
        const amount = parseInt(amountInput.value);
        
        if (!amount || amount < 1) {
            amountInput.classList.add('error');
            amountError.textContent = 'Please enter a valid amount';
            amountError.classList.add('show');
            return false;
        } else {
            amountInput.classList.remove('error');
            amountError.classList.remove('show');
            return true;
        }
    }

    if (amountInput) {
        amountInput.addEventListener('blur', validateAmount);
    }

    // ==========================================
    // FORM SUBMISSION
    // ==========================================
    const errorEl = document.getElementById('payfeeError');

    function showPayfeeError(msg) {
        if (!errorEl) return;
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }

    function clearPayfeeError() {
        if (!errorEl) return;
        errorEl.textContent = '';
        errorEl.style.display = 'none';
    }

    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            clearPayfeeError();

            if (!validateAmount()) {
                amountInput.focus();
                return;
            }

            const name = nameInput.value.trim();
            const phone = phoneInput.value.trim();
            const email = emailInput.value.trim();
            const amount = parseInt(amountInput.value);

            if (!name || !phone || !email || !amount) {
                showPayfeeError('Please fill all fields');
                return;
            }

            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                await initiatePayment(name, phone, email, amount);
            } catch (error) {
                console.error('Payment error:', error);
                showPayfeeError(error.message || 'Payment failed. Please try again.');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // RAZORPAY PAYMENT
    // ==========================================
    async function initiatePayment(name, phone, email, amount) {
        // Server creates the order — locks in the discussed amount so it can't be tampered with in the browser
        const orderRes = await fetch(`${BACKEND_URL}/api/create-website-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ serviceKey: 'payFee', amount: amount, name: name, email: email, phone: phone })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) throw new Error(orderData.error || 'Could not start payment. Please try again.');

        const options = {
            key: orderData.keyId,
            order_id: orderData.orderId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: PAYFEE_CONFIG.businessName,
            description: orderData.serviceTitle,
            prefill: {
                name: name,
                contact: phone,
                email: email
            },
            theme: {
                color: '#7C9CB5'
            },
            handler: function(response) {
                handlePaymentSuccess(response, { name, phone, email, amount });
            },
            modal: {
                ondismiss: function() {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    // Tell backend the checkout was abandoned so status updates to 'attempted'
                    fetch(`${BACKEND_URL}/api/create-website-order`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'abandon', email: email, razorpayOrderId: orderData.orderId }),
                    }).catch(() => {});
                }
            }
        };

        const razorpay = new Razorpay(options);
        razorpay.open();
    }

    // ==========================================
    // PAYMENT SUCCESS
    // ==========================================
    async function handlePaymentSuccess(response, formData) {
        successAmount.textContent = formData.amount.toLocaleString('en-IN');
        successPaymentId.textContent = response.razorpay_payment_id;

        form.classList.add('hidden');
        successDiv.classList.add('show');

        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Confirmation email + app account are handled server-side by the Razorpay webhook

        // Sheet tracking
        await sendToSheet({
            type: 'payfee',
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            amount: formData.amount,
            paymentId: response.razorpay_payment_id
        });

        console.log('✅ Payment successful:', response.razorpay_payment_id);
    }
    console.log('✅ PayFee.js loaded successfully');

})();