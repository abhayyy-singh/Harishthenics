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

        // Google Form Link for Reviews
        reviewFormLink: 'https://docs.google.com/forms/d/e/1FAIpQLSenVwnLgIzfOTRLryWYweE7LhoqAQA-wZUBDVBR8CEn6o3FTg/viewform',  // Replace with actual form link

        // ==========================================
        // ⭐ REVIEWS - Add/Edit reviews here
        // ==========================================
        reviews: [
            {
                name: 'Rahul Sharma',
                photo: '',  // Leave empty for default avatar
                rating: 5,
                text: 'This program completely changed my life! My back pain reduced by 80% in just 3 weeks. Highly recommended for anyone suffering from chronic pain.',
                location: 'Delhi'
            },
            {
                name: 'Priya Mehta',
                photo: '',
                rating: 5,
                text: 'Very detailed and easy to follow. The video demonstrations made everything clear. Worth every rupee!',
                location: 'Mumbai'
            },
            {
                name: 'Amit Kumar',
                photo: '',
                rating: 4,
                text: 'Good program with effective exercises. Started seeing results in the second week itself.',
                location: 'Bangalore'
            },
            {
                name: 'Sneha Gupta',
                photo: '',
                rating: 5,
                text: 'Finally found something that actually works! The exercises are simple but very effective. Thank you Harish!',
                location: 'Pune'
            },
            {
                name: 'Vikram Singh',
                photo: '',
                rating: 5,
                text: 'I was skeptical at first, but this program exceeded my expectations. Professional approach and great results.',
                location: 'Jaipur'
            }
        ],

        // ==========================================
        // 🏋️ PROGRAMS - Add/Edit/Remove programs here
        // ==========================================
        programs: {
            
            'back-pain': {
                id: 'back-pain',
                name: 'Back Pain Relief Program',
                shortName: 'Back Pain',
                price: 999,
                tagline: 'Say goodbye to back pain forever',
                videoId: '',  // Replace with actual YouTube video ID
                excelLink: 'https://docs.google.com/spreadsheets/d/19O1fABG9o16UcXrGhrxrlVX0fOoLl9MNDu1ucpZik0Q/edit?usp=sharing',  // Replace with actual link
                
                description: [
                    'This comprehensive program is designed specifically for people suffering from chronic or occasional back pain. Whether you sit at a desk all day, lift heavy objects, or simply wake up with stiffness - this program addresses the root causes.',
                    'Through a combination of targeted stretches, strengthening exercises, and mobility work, you\'ll learn to release tension, build core stability, and create lasting relief.',
                    'The program is structured in phases, starting gentle and progressively building strength where you need it most.'
                ]
            },

            'knee-pain': {
                id: 'knee-pain',
                name: 'Knee Pain Recovery Program',
                shortName: 'Knee Pain',
                price: 4999,
                tagline: 'Rebuild strong, pain-free knees',
                videoId: 'Eunt7MMhel4',  // Updated with actual YouTube video ID
                excelLink: 'https://docs.google.com/spreadsheets/d/19O1fABG9o16UcXrGhrxrlVX0fOoLl9MNDu1ucpZik0Q/edit?usp=sharing',  // Replace with actual link
                
                description: [
    'I built this knee pain program after years of dedicated work, hands-on experience, and careful movement selection — designed to help you achieve pain-free movement.',
    'This program has already helped many people move better and reclaim their daily life. If you commit to it, it will do the same for you.',
    // 'What makes this program different is that it is not static — it evolves over time. As we learn more, the program gets updated, so what you invest in today only gets better.',
    // 'Whether your knee pain is from injury, overuse, or age-related wear, this program will guide you step by step back to confident, pain-free movement.',
],
                reviews: [
                    { name: 'Mohan Patel', photo: '', rating: 5, text: 'Climbing stairs is no longer painful. Amazing program!', location: 'Ahmedabad' },
                    { name: 'Kavita Sharma', photo: '', rating: 5, text: 'My knee surgery was avoided because of this. Thank you!', location: 'Delhi' },
                    { name: 'Rajesh Kumar', photo: '', rating: 4, text: 'Gradual improvement, now I can walk without limping.', location: 'Chennai' },
                    { name: 'Anita Desai', photo: '', rating: 5, text: 'Best investment for my knee health. Feeling 10 years younger!', location: 'Hyderabad' },
                    { name: 'Suresh Nair', photo: '', rating: 5, text: 'Running again after 2 years of knee pain. Incredible results!', location: 'Kochi' }
                ]


            },

            'shoulder-pain': {
                id: 'shoulder-pain',
                name: 'Shoulder Pain Freedom Program',
                shortName: 'Shoulder Pain',
                price: 999,
                tagline: 'Unlock pain-free shoulder movement',
                videoId: 'dQw4w9WgXcQ',  // Replace with actual YouTube video ID
                excelLink: 'https://drive.google.com/your-shoulder-pain-program-link',  // Replace with actual link
                
                description: [
                    'Shoulder pain and stiffness can make even simple tasks like reaching overhead or sleeping on your side uncomfortable. This program addresses common shoulder issues including rotator cuff problems, frozen shoulder, and general tightness.',
                    'You\'ll learn exercises that restore range of motion, strengthen the small stabilizer muscles, and improve overall shoulder health.',
                    'The program is gentle yet effective, suitable for all fitness levels and ages.'
                ]
            },

            'ankle-pain': {
                id: 'ankle-pain',
                name: 'Ankle Stability Program',
                shortName: 'Ankle Pain',
                price: 799,
                tagline: 'Build bulletproof ankles',
                videoId: 'dQw4w9WgXcQ',  // Replace with actual YouTube video ID
                excelLink: 'https://drive.google.com/your-ankle-pain-program-link',  // Replace with actual link
                
                description: [
                    'Weak or unstable ankles can lead to frequent sprains, balance issues, and pain that radiates up the leg. This program focuses on building ankle strength, improving mobility, and developing proprioception (body awareness).',
                    'Perfect for anyone who has suffered ankle injuries, feels unsteady on their feet, or wants to prevent future ankle problems.',
                    'The exercises progress from simple balance work to more challenging stability drills.'
                ]
            },

            'neck-pain': {
                id: 'neck-pain',
                name: 'Neck Pain Relief Program',
                shortName: 'Neck Pain',
                price: 899,
                tagline: 'Release tension, restore mobility',
                videoId: 'dQw4w9WgXcQ',  // Replace with actual YouTube video ID
                excelLink: 'https://drive.google.com/your-neck-pain-program-link',  // Replace with actual link
                
                description: [
                    'In our digital age, neck pain has become incredibly common. Hours of looking at screens, poor posture, and stress all contribute to chronic neck tension and pain.',
                    'This program combines stretching, strengthening, and postural correction to address the root causes of neck pain - not just the symptoms.',
                    'You\'ll learn techniques you can do at your desk, before bed, and throughout the day to keep your neck happy.'
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
    // Generate Stars HTML
    // ==========================================
    function getStarsHTML(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars += '<span class="wp-review__star filled">★</span>';
            } else {
                stars += '<span class="wp-review__star">☆</span>';
            }
        }
        return stars;
    }

    // ==========================================
    // Get Default Avatar
    // ==========================================
    function getAvatarHTML(name, photo) {
        if (photo && photo.trim() !== '') {
            return `<img src="${photo}" alt="${name}" class="wp-review__photo">`;
        }
        // Generate initials avatar
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        return `<div class="wp-review__avatar">${initials}</div>`;
    }

    // ==========================================
    // Render Program Page
    // ==========================================
    function renderProgram(program) {
        const mainContent = document.getElementById('mainContent');
        
        // Update page title
        document.getElementById('pageTitle').textContent = `${program.name} | Haristhenics`;
        
        // Build description HTML
        const descriptionHTML = program.description.map(para => `
            <p class="wp-description__text">${para}</p>
        `).join('');

        // Build reviews HTML
        const reviewsHTML = program.reviews.map(review => `
            <div class="wp-review__card">
                <div class="wp-review__header">
                    ${getAvatarHTML(review.name, review.photo)}
                    <div class="wp-review__info">
                        <div class="wp-review__name">${review.name}</div>
                        <div class="wp-review__location">${review.location}</div>
                    </div>
                </div>
                <div class="wp-review__stars">${getStarsHTML(review.rating)}</div>
                <p class="wp-review__text">"${review.text}"</p>
            </div>
        `).join('');
        
        // Render full page (minimal spacing, no badge, no benefits, no includes)
        mainContent.innerHTML = `
            <!-- Hero Section -->
            <section class="wp-hero wp-hero--compact">
                <h1 class="wp-hero__title">${program.name}</h1>
                <p class="wp-hero__subtitle">${program.tagline}</p>
            </section>

            <!-- Content Section -->
            <section class="wp-content wp-content--compact">
                <!-- Video -->
                <div class="wp-video wp-video--compact">
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
                <div class="wp-description wp-description--compact">
                    <h2 class="wp-description__title">About This Program</h2>
                    ${descriptionHTML}
                </div>

                <!-- CTA -->
                <div class="wp-cta wp-cta--compact">
                    <p class="wp-cta__price-label">One-Time Payment</p>
                    <p class="wp-cta__price">₹${program.price.toLocaleString('en-IN')}</p>
                    <p class="wp-cta__price-note">Lifetime access</p>
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
                        Secure payment via Razorpay
                    </p>
                </div>

                <!-- Reviews Section -->
                
                    <div class="wp-reviews__dots" id="reviewsDots"></div>
                    <a href="${CONFIG.reviewFormLink}" target="_blank" class="wp-reviews__write-btn">
                        ✍️ Write a Review
                    </a>
                </div>
            </section>

            <!-- Footer -->
            <footer class="wp-footer wp-footer--compact">
                <p class="wp-footer__text">
                    © ${new Date().getFullYear()} HS FutureWorld. ALL RIGHTS RESERVED. 
                    <a href="index.html" class="wp-footer__link">Back to Home</a>
                </p>
            </footer>
        `;
        
        // Attach buy button listener
        document.getElementById('buyNowBtn').addEventListener('click', () => openModal(program));
        
        // Initialize reviews slider
        initReviewsSlider();
    }

    // ==========================================
    // Reviews Slider Animation
    // ==========================================
    function initReviewsSlider() {
        const track = document.getElementById('reviewsTrack');
        const dotsContainer = document.getElementById('reviewsDots');
        const cards = track.querySelectorAll('.wp-review__card');
        const totalCards = cards.length;
        
        let currentIndex = 0;
        let autoSlideInterval;

        // Create dots
        for (let i = 0; i < totalCards; i++) {
            const dot = document.createElement('span');
            dot.className = 'wp-reviews__dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }

        const dots = dotsContainer.querySelectorAll('.wp-reviews__dot');

        function updateSlider() {
            const cardWidth = cards[0].offsetWidth + 16; // card width + gap
            track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToSlide(index) {
            currentIndex = index;
            updateSlider();
            resetAutoSlide();
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalCards;
            updateSlider();
        }

        function resetAutoSlide() {
            clearInterval(autoSlideInterval);
            autoSlideInterval = setInterval(nextSlide, 4000);
        }

        // Start auto-slide
        autoSlideInterval = setInterval(nextSlide, 4000);

        // Pause on hover
        track.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        track.addEventListener('mouseleave', resetAutoSlide);

        // Touch/swipe support
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
            clearInterval(autoSlideInterval);
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
        });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentIndex < totalCards - 1) {
                    currentIndex++;
                } else if (diff < 0 && currentIndex > 0) {
                    currentIndex--;
                }
                updateSlider();
            }

            isDragging = false;
            resetAutoSlide();
        });
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