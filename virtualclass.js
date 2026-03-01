/* ================================================
   HARISTHENICS - VIRTUAL CLASS
   virtualclass.js - Modal, Payment, EmailJS
   ================================================ */

(function() {
    'use strict';

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const VIRTUALCLASS_CONFIG = {
        // Razorpay
        razorpayKeyId: 'rzp_live_RZDqqPc9XD0IjO',
        amount: 600000, // ₹6,000 in paise
        currency: 'INR',
        businessName: 'Haristhenics',
        description: 'Virtual Class - Group Sessions',
        
        // EmailJS - 2nd Account (Same as PayFee)
        emailjsPublicKey: 'tH2TNN9GskYvmvT62',
        emailjsServiceId: 'HARISH_EMAIL',
        emailjsTemplateId: 'VIRTUALCLASS_CONFIRMATION'  // Create this template in EmailJS
    };

    // ==========================================
    // OPEN MODAL
    // ==========================================
    function openVirtualClassModal() {
        const modal = document.getElementById('virtualClassModal');
        if (!modal) {
            console.error('Virtual Class Modal not found');
            return;
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus first input after animation
        setTimeout(function() {
            const firstInput = modal.querySelector('input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }, 300);
        
        console.log('✅ Virtual Class Modal opened');
    }

    // ==========================================
    // CLOSE MODAL
    // ==========================================
    function closeVirtualClassModal() {
        const modal = document.getElementById('virtualClassModal');
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        const form = document.getElementById('virtualClassForm');
        if (form) form.reset();
        
        // Hide messages
        hideVirtualClassMessages();
        
        // Reset button state
        const submitBtn = document.querySelector('#virtualClassForm .booking-form__submit');
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
        
        console.log('✅ Virtual Class Modal closed');
    }

    // ==========================================
    // FORM SUBMISSION
    // ==========================================
    const form = document.getElementById('virtualClassForm');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.booking-form__submit');
            
            // Get form values
            const userName = document.getElementById('virtualClassUserName').value.trim();
            const userEmail = document.getElementById('virtualClassUserEmail').value.trim();
            const userPhone = document.getElementById('virtualClassUserPhone').value.trim();
            const userAge = document.getElementById('virtualClassUserAge').value.trim();
            
            // Validate name
            if (!userName || userName.length < 2) {
                showVirtualClassError('Please enter a valid name');
                return;
            }
            
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!userEmail || !emailRegex.test(userEmail)) {
                showVirtualClassError('Please enter a valid email address');
                return;
            }
            
            // Validate phone
            const phoneDigits = userPhone.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                showVirtualClassError('Please enter a valid phone number (10 digits)');
                return;
            }

            // Validate age
            const age = parseInt(userAge);
            if (!age || age < 15 || age > 100) {
                showVirtualClassError('Please enter a valid age');
                return;
            }
            
            // Show loading state
            if (submitBtn) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
            }
            hideVirtualClassMessages();
            
            try {
                // Check if Razorpay is available
                if (typeof Razorpay === 'undefined') {
                    throw new Error('Payment system not loaded. Please refresh the page.');
                }
                
                // Initialize Razorpay payment
                const options = {
                    key: VIRTUALCLASS_CONFIG.razorpayKeyId,
                    amount: VIRTUALCLASS_CONFIG.amount,
                    currency: VIRTUALCLASS_CONFIG.currency,
                    name: VIRTUALCLASS_CONFIG.businessName,
                    description: VIRTUALCLASS_CONFIG.description,
                    handler: async function(response) {
                        console.log('✅ Payment successful:', response.razorpay_payment_id);
                        
                        // Send confirmation email
                        await sendVirtualClassEmail({
                            name: userName,
                            email: userEmail,
                            phone: userPhone,
                            age: userAge
                        }, response);
                        
                        // Show success message
                        showVirtualClassSuccess();
                        
                        // Reset button state
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
                    notes: {
                        age: userAge
                    },
                    theme: {
                        color: '#7C9CB5'
                    },
                    modal: {
                        ondismiss: function() {
                            console.log('Payment cancelled by user');
                            if (submitBtn) {
                                submitBtn.classList.remove('loading');
                                submitBtn.disabled = false;
                            }
                        }
                    }
                };
                
                const razorpay = new Razorpay(options);
                
                // Handle payment failure
                razorpay.on('payment.failed', function(response) {
                    console.error('❌ Payment failed:', response.error);
                    showVirtualClassError('Payment failed: ' + response.error.description);
                    if (submitBtn) {
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    }
                });
                
                // Open Razorpay checkout
                razorpay.open();
                
            } catch (error) {
                console.error('❌ Payment error:', error);
                showVirtualClassError(error.message || 'Payment failed. Please try again.');
                if (submitBtn) {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // ==========================================
    // SEND EMAIL NOTIFICATION
    // ========================================== 

    // This function sends the booking details to a Google Sheet via a Google Apps Script and also sends a confirmation email to the user using a custom email API endpoint. You can replace the fetch calls with EmailJS if you prefer, but this approach does not require the user to have EmailJS loaded on their browser.

async function sendVirtualClassEmail(formData, paymentResponse) {
    fetch('https://script.google.com/macros/s/AKfycbz7hcM9cvQft1nAxziRknYU42ZqML8KqVIi9lYPcm5kBoWJ2sPZN77BSR-2g2XYj5NmBw/exec', {
        method: 'POST',
        body: JSON.stringify({
            service_type: 'Virtual Class',
            user_name: formData.name,
            user_email: formData.email,
            user_phone: formData.phone,
            amount: '₹6,000',
            payment_id: paymentResponse.razorpay_payment_id,
            email_status: 'Pending'
        })
    }).catch(e => console.warn('Sheet error:', e));

    fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            service_type: 'virtualClass',
            user_name: formData.name,
            user_email: formData.email,
            user_phone: formData.phone,
            age: formData.age,
            payment_id: paymentResponse.razorpay_payment_id
        })
    }).catch(e => console.warn('Email API error:', e));
}



    //you can uncomment this function if you want to send email notifications using EmailJS. Make sure to set up the template in your EmailJS account with the correct variables.
    // async function sendVirtualClassEmail(formData, paymentResponse) {
    //     // Check if EmailJS is loaded
    //     if (typeof emailjs === 'undefined') {
    //         console.warn('EmailJS not loaded');
    //         return;
    //     }

    //     try {
    //         // Initialize EmailJS with 2nd account
    //         emailjs.init(VIRTUALCLASS_CONFIG.emailjsPublicKey);

    //         const templateParams = {
    //             user_name: formData.name,
    //             user_email: formData.email,
    //             user_phone: formData.phone,
    //             user_age: formData.age,
    //             amount: '6,000',
    //             payment_id: paymentResponse.razorpay_payment_id,
    //             payment_date: new Date().toLocaleDateString('en-IN', {
    //                 weekday: 'long',
    //                 day: 'numeric',
    //                 month: 'long',
    //                 year: 'numeric'
    //             })
    //         };

    //         await emailjs.send(
    //             VIRTUALCLASS_CONFIG.emailjsServiceId,
    //             VIRTUALCLASS_CONFIG.emailjsTemplateId,
    //             templateParams
    //         );

    //         console.log('✅ Virtual Class email sent successfully');

    //     } catch (error) {
    //         console.error('❌ Email error:', error);
    //         // Don't show error to user - payment was successful
    //     }
    // }



    // ==========================================
    // HELPER FUNCTIONS - MESSAGES
    // ==========================================
    function showVirtualClassSuccess() {
        const successDiv = document.getElementById('virtualClassSuccess');
        const form = document.getElementById('virtualClassForm');
        
        if (successDiv && form) {
            form.style.display = 'none';
            successDiv.classList.add('show');
            
            // Close modal after 4 seconds
            setTimeout(function() {
                closeVirtualClassModal();
                form.style.display = 'block';
                successDiv.classList.remove('show');
            }, 4000);
        }
    }

    function showVirtualClassError(message) {
        const errorDiv = document.getElementById('virtualClassError');
        if (errorDiv) {
            const errorText = errorDiv.querySelector('span');
            if (errorText && message) {
                errorText.textContent = message;
            }
            errorDiv.classList.add('show');
            
            // Hide error after 4 seconds
            setTimeout(function() {
                hideVirtualClassMessages();
            }, 4000);
        }
    }

    function hideVirtualClassMessages() {
        const successDiv = document.getElementById('virtualClassSuccess');
        const errorDiv = document.getElementById('virtualClassError');
        
        if (successDiv) successDiv.classList.remove('show');
        if (errorDiv) errorDiv.classList.remove('show');
    }

    // ==========================================
    // ESC KEY TO CLOSE MODAL
    // ==========================================
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('virtualClassModal');
            if (modal && modal.classList.contains('active')) {
                closeVirtualClassModal();
            }
        }
    });

    // ==========================================
    // MAKE FUNCTIONS GLOBAL
    // ==========================================
    window.openVirtualClassModal = openVirtualClassModal;
    window.closeVirtualClassModal = closeVirtualClassModal;

    console.log('✅ VirtualClass.js loaded successfully');

})();
