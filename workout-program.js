/* ================================================
   HARISTHENICS - WORKOUT PROGRAMS
   workout-program.js
   
   🔧 CONFIGURATION: Change program details below
   All changes here will reflect everywhere automatically!
   ================================================ */

(function() {
    'use strict';

    // ==========================================
    // 🔧 MASTER CONFIGURATION - EDIT HERE ONLY!
    // ==========================================
    const CONFIG = {
        
        // Razorpay Settings
        razorpay: {
            keyId: 'rzp_live_RZDqqPc9XD0IjO',
            businessName: 'HS FutureWorld',
            currency: 'INR',
            themeColor: '#7C9CB5'
        },

        // EmailJS Settings (3rd Account - use 2nd account credentials for now)
        emailjs: {
            publicKey: 'tH2TNN9GskYvmvT62',
            serviceId: 'HARISH_EMAIL',
            templateId: 'WORKOUT_PROGRAM_TEMPLATE'  // Create this template
        },

        // ==========================================
        // 🏋️ PROGRAMS - Add/Edit/Remove programs here
        // ==========================================
        programs: {
            
            'back-pain': {
                id: 'back-pain',
                name: 'Back Pain Relief Program',
                shortName: 'Back Pain',
                price: 999,
                icon: '🔙',
                tagline: 'Say goodbye to back pain forever',
                videoId: 'dQw4w9WgXcQ',  // Replace with actual YouTube video ID
                excelLink: 'https://drive.google.com/your-back-pain-program-link',  // Replace with actual link
                
                description: [
                    'This comprehensive program is designed specifically for people suffering from chronic or occasional back pain. Whether you sit at a desk all day, lift heavy objects, or simply wake up with stiffness - this program addresses the root causes.',
                    'Through a combination of targeted stretches, strengthening exercises, and mobility work, you\'ll learn to release tension, build core stability, and create lasting relief.',
                    'The program is structured in phases, starting gentle and progressively building strength where you need it most.'
                ],
                
                benefits: [
                    { icon: '✅', text: 'Reduce back pain within 2-3 weeks' },
                    { icon: '💪', text: 'Strengthen core muscles safely' },
                    { icon: '🧘', text: 'Improve spine mobility & flexibility' },
                    { icon: '🛡️', text: 'Prevent future back injuries' }
                ],
                
                includes: [
                    'Complete Exercise Guide (Excel/PDF)',
                    '4-Week Progressive Program',
                    'Video Demonstration Links',
                    'Daily Routine Checklist',
                    'Posture Correction Tips'
                ]
            },

            'knee-pain': {
                id: 'knee-pain',
                name: 'Knee Pain Recovery Program',
                shortName: 'Knee Pain',
                price: 1299,
                icon: '🦵',
                tagline: 'Rebuild strong, pain-free knees',
                videoId: 'dQw4w9WgXcQ',  // Replace with actual YouTube video ID
                excelLink: 'https://drive.google.com/your-knee-pain-program-link',  // Replace with actual link
                
                description: [
                    'Knee pain can be debilitating, affecting everything from walking to climbing stairs. This program takes a scientific approach to knee rehabilitation and strengthening.',
                    'We focus on building the muscles that support your knee joint - quadriceps, hamstrings, and calves - while improving joint mobility and reducing inflammation through movement.',
                    'Whether your knee pain is from injury, overuse, or age-related wear, this program will help you regain confidence in your movement.'
                ],
                
                benefits: [
                    { icon: '✅', text: 'Reduce knee pain significantly' },
                    { icon: '💪', text: 'Build leg strength & stability' },
                    { icon: '🚶', text: 'Walk & climb stairs pain-free' },
                    { icon: '🛡️', text: 'Protect knees from further damage' }
                ],
                
                includes: [
                    'Complete Exercise Guide (Excel/PDF)',
                    '6-Week Progressive Program',
                    'Video Demonstration Links',
                    'Knee-Friendly Modifications',
                    'Progress Tracking Sheet'
                ]
            },

            'shoulder-pain': {
                id: 'shoulder-pain',
                name: 'Shoulder Pain Freedom Program',
                shortName: 'Shoulder Pain',
                price: 999,
                icon: '💪',
                tagline: 'Unlock pain-free shoulder movement',
                videoId: 'dQw4w9WgXcQ',  // Replace with actual YouTube video ID
                excelLink: 'https://drive.google.com/your-shoulder-pain-program-link',  // Replace with actual link
                
                description: [
                    'Shoulder pain and stiffness can make even simple tasks like reaching overhead or sleeping on your side uncomfortable. This program addresses common shoulder issues including rotator cuff problems, frozen shoulder, and general tightness.',
                    'You\'ll learn exercises that restore range of motion, strengthen the small stabilizer muscles, and improve overall shoulder health.',
                    'The program is gentle yet effective, suitable for all fitness levels and ages.'
                ],
                
                benefits: [
                    { icon: '✅', text: 'Relieve shoulder pain & stiffness' },
                    { icon: '🔄', text: 'Restore full range of motion' },
                    { icon: '💪', text: 'Strengthen rotator cuff muscles' },
                    { icon: '😴', text: 'Sleep comfortably again' }
                ],
                
                includes: [
                    'Complete Exercise Guide (Excel/PDF)',
                    '4-Week Progressive Program',
                    'Video Demonstration Links',
                    'Office-Friendly Stretches',
                    'Sleep Position Guide'
                ]
            },

            'ankle-pain': {
                id: 'ankle-pain',
                name: 'Ankle Stability Program',
                shortName: 'Ankle Pain',
                price: 799,
                icon: '🦶',
                tagline: 'Build bulletproof ankles',
                videoId: 'dQw4w9WgXcQ',  // Replace with actual YouTube video ID
                excelLink: 'https://drive.google.com/your-ankle-pain-program-link',  // Replace with actual link
                
                description: [
                    'Weak or unstable ankles can lead to frequent sprains, balance issues, and pain that radiates up the leg. This program focuses on building ankle strength, improving mobility, and developing proprioception (body awareness).',
                    'Perfect for anyone who has suffered ankle injuries, feels unsteady on their feet, or wants to prevent future ankle problems.',
                    'The exercises progress from simple balance work to more challenging stability drills.'
                ],
                
                benefits: [
                    { icon: '✅', text: 'Reduce ankle pain & swelling' },
                    { icon: '⚖️', text: 'Improve balance & stability' },
                    { icon: '🏃', text: 'Run & jump with confidence' },
                    { icon: '🛡️', text: 'Prevent future ankle sprains' }
                ],
                
                includes: [
                    'Complete Exercise Guide (Excel/PDF)',
                    '4-Week Progressive Program',
                    'Video Demonstration Links',
                    'Balance Training Exercises',
                    'Return to Activity Guidelines'
                ]
            },

            'neck-pain': {
                id: 'neck-pain',
                name: 'Neck Pain Relief Program',
                shortName: 'Neck Pain',
                price: 899,
                icon: '🙆',
                tagline: 'Release tension, restore mobility',
                videoId: 'dQw4w9WgXcQ',  // Replace with actual YouTube video ID
                excelLink: 'https://drive.google.com/your-neck-pain-program-link',  // Replace with actual link
                
                description: [
                    'In our digital age, neck pain has become incredibly common. Hours of looking at screens, poor posture, and stress all contribute to chronic neck tension and pain.',
                    'This program combines stretching, strengthening, and postural correction to address the root causes of neck pain - not just the symptoms.',
                    'You\'ll learn techniques you can do at your desk, before bed, and throughout the day to keep your neck happy.'
                ],
                
                benefits: [
                    { icon: '✅', text: 'Relieve neck pain & headaches' },
                    { icon: '📱', text: 'Fix "tech neck" posture' },
                    { icon: '😌', text: 'Reduce tension & stress' },
                    { icon: '🔄', text: 'Improve neck mobility' }
                ],
                
                includes: [
                    'Complete Exercise Guide (Excel/PDF)',
                    '3-Week Progressive Program',
                    'Video Demonstration Links',
                    'Desk Stretches Guide',
                    'Ergonomic Setup Tips'
                ]
            }
        }
    };

    // ==========================================
    // Get Program Type from URL
    // ==========================================
    function getProgramType() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('type');
    }

    // ==========================================
    // Get Program Data
    // ==========================================
    function getProgram(type) {
        return CONFIG.programs[type] || null;
    }

    // ==========================================
    // Render Program Page
    // ==========================================
    function renderProgram(program) {
        const mainContent = document.getElementById('mainContent');
        
        // Update page title
        document.getElementById('pageTitle').textContent = `${program.name} | Haristhenics`;
        
        // Build benefits HTML
        const benefitsHTML = program.benefits.map(benefit => `
            <div class="wp-benefits__item">
                <span class="wp-benefits__icon">${benefit.icon}</span>
                <span class="wp-benefits__text">${benefit.text}</span>
            </div>
        `).join('');
        
        // Build includes HTML
        const includesHTML = program.includes.map(item => `
            <div class="wp-included__item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M5 13l4 4L19 7"></path>
                </svg>
                <span>${item}</span>
            </div>
        `).join('');
        
        // Build description HTML
        const descriptionHTML = program.description.map(para => `
            <p class="wp-description__text">${para}</p>
        `).join('');
        
        // Render full page
        mainContent.innerHTML = `
            <!-- Hero Section -->
            <section class="wp-hero">
                <span class="wp-hero__badge">${program.icon} Workout Program</span>
                <h1 class="wp-hero__title">${program.name}</h1>
                <p class="wp-hero__subtitle">${program.tagline}</p>
            </section>

            <!-- Content Section -->
            <section class="wp-content">
                <!-- Video -->
                <div class="wp-video">
                    <div class="wp-video__container">
                        <iframe 
                            src="https://www.youtube.com/embed/${program.videoId}" 
                            title="${program.name} Video"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>

                <!-- Description -->
                <div class="wp-description">
                    <h2 class="wp-description__title">About This Program</h2>
                    ${descriptionHTML}
                </div>

                <!-- Benefits -->
                <div class="wp-benefits">
                    <h2 class="wp-benefits__title">What You'll Achieve</h2>
                    <div class="wp-benefits__grid">
                        ${benefitsHTML}
                    </div>
                </div>

                <!-- What's Included -->
                <div class="wp-included">
                    <h3 class="wp-included__title">📦 What's Included</h3>
                    <div class="wp-included__list">
                        ${includesHTML}
                    </div>
                </div>

                <!-- CTA -->
                <div class="wp-cta">
                    <p class="wp-cta__price-label">One-Time Payment</p>
                    <p class="wp-cta__price">₹${program.price.toLocaleString('en-IN')}</p>
                    <p class="wp-cta__price-note">Lifetime access • Instant delivery</p>
                    <button class="wp-cta__button" id="buyNowBtn">
                        Get This Program
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                    </button>
                    <p class="wp-cta__secure">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0110 0v4"></path>
                        </svg>
                        Secure payment powered by Razorpay
                    </p>
                </div>
            </section>

            <!-- Footer -->
            <footer class="wp-footer">
                <p class="wp-footer__text">
                    © ${new Date().getFullYear()} Haristhenics. 
                    <a href="index.html" class="wp-footer__link">Back to Home</a>
                </p>
            </footer>
        `;
        
        // Attach buy button listener
        document.getElementById('buyNowBtn').addEventListener('click', () => openModal(program));
    }

    // ==========================================
    // Render Error Page
    // ==========================================
    function renderError() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="wp-error-page">
                <div class="wp-error-page__icon">😕</div>
                <h1 class="wp-error-page__title">Program Not Found</h1>
                <p class="wp-error-page__text">
                    The workout program you're looking for doesn't exist or has been removed.
                </p>
                <a href="index.html#pricing-section" class="wp-error-page__button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5M12 19l-7-7 7-7"></path>
                    </svg>
                    View All Programs
                </a>
            </div>
        `;
    }

    // ==========================================
    // Modal Functions
    // ==========================================
    let currentProgram = null;
    const modal = document.getElementById('wpModal');
    const modalOverlay = document.getElementById('wpModalOverlay');
    const modalClose = document.getElementById('wpModalClose');
    const form = document.getElementById('wpForm');
    const formContainer = document.getElementById('wpFormContainer');
    const successDiv = document.getElementById('wpSuccess');

    function openModal(program) {
        currentProgram = program;
        document.getElementById('modalProgramName').textContent = 
            `${program.name} - ₹${program.price.toLocaleString('en-IN')}`;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset after animation
        setTimeout(() => {
            form.reset();
            formContainer.style.display = 'block';
            successDiv.classList.remove('show');
            const submitBtn = document.getElementById('wpSubmitBtn');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 300);
    }

    // Modal close listeners
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // ==========================================
    // Form Submission & Payment
    // ==========================================
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitBtn = document.getElementById('wpSubmitBtn');
            const userName = document.getElementById('wpUserName').value.trim();
            const userEmail = document.getElementById('wpUserEmail').value.trim();
            const userPhone = document.getElementById('wpUserPhone').value.trim();
            
            // Validation
            if (!userName || userName.length < 2) {
                alert('Please enter a valid name');
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!userEmail || !emailRegex.test(userEmail)) {
                alert('Please enter a valid email');
                return;
            }
            
            const phoneDigits = userPhone.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                alert('Please enter a valid phone number');
                return;
            }
            
            // Start loading
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            try {
                if (typeof Razorpay === 'undefined') {
                    throw new Error('Payment system not loaded. Please refresh.');
                }
                
                const options = {
                    key: CONFIG.razorpay.keyId,
                    amount: currentProgram.price * 100,
                    currency: CONFIG.razorpay.currency,
                    name: CONFIG.razorpay.businessName,
                    description: currentProgram.name,
                    handler: async function(response) {
                        // Payment successful
                        await handlePaymentSuccess(response, {
                            name: userName,
                            email: userEmail,
                            phone: userPhone
                        });
                    },
                    prefill: {
                        name: userName,
                        email: userEmail,
                        contact: userPhone
                    },
                    theme: {
                        color: CONFIG.razorpay.themeColor
                    },
                    modal: {
                        ondismiss: function() {
                            submitBtn.classList.remove('loading');
                            submitBtn.disabled = false;
                        }
                    }
                };
                
                const razorpay = new Razorpay(options);
                
                razorpay.on('payment.failed', function(response) {
                    alert('Payment failed: ' + response.error.description);
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                });
                
                razorpay.open();
                
            } catch (error) {
                console.error('Payment error:', error);
                alert(error.message || 'Payment failed. Please try again.');
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }

    // ==========================================
    // Handle Payment Success
    // ==========================================
    async function handlePaymentSuccess(response, userData) {
        // Update success UI
        document.getElementById('successAmount').textContent = 
            `₹${currentProgram.price.toLocaleString('en-IN')}`;
        document.getElementById('successPaymentId').textContent = 
            response.razorpay_payment_id;
        
        // Show success
        formContainer.style.display = 'none';
        successDiv.classList.add('show');
        
        // Send email with download link
        await sendEmail(userData, response);
        
        console.log('✅ Payment successful:', response.razorpay_payment_id);
    }

    // ==========================================
    // Send Email with Download Link
    // ==========================================
    async function sendEmail(userData, paymentResponse) {
        if (typeof emailjs === 'undefined') {
            console.warn('EmailJS not loaded');
            return;
        }
        
        try {
            emailjs.init(CONFIG.emailjs.publicKey);
            
            const templateParams = {
                user_name: userData.name,
                user_email: userData.email,
                user_phone: userData.phone,
                program_name: currentProgram.name,
                amount: currentProgram.price.toLocaleString('en-IN'),
                payment_id: paymentResponse.razorpay_payment_id,
                download_link: currentProgram.excelLink,
                payment_date: new Date().toLocaleDateString('en-IN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                })
            };
            
            await emailjs.send(
                CONFIG.emailjs.serviceId,
                CONFIG.emailjs.templateId,
                templateParams
            );
            
            console.log('✅ Email sent with download link');
            
        } catch (error) {
            console.error('Email error:', error);
            // Don't show error to user - payment was successful
        }
    }

    // ==========================================
    // Initialize Page
    // ==========================================
    function init() {
        const programType = getProgramType();
        const program = getProgram(programType);
        
        if (program) {
            renderProgram(program);
        } else {
            renderError();
        }
    }

    // Run on load
    init();

    // ==========================================
    // Export for external use (optional)
    // ==========================================
    window.WORKOUT_PROGRAMS = CONFIG.programs;

    console.log('✅ Workout Program JS loaded');

})();
