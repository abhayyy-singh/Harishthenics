/* ================================================
   HARISTHENICS - MAIN JAVASCRIPT
   main.js - Core functionality
   ================================================ */

(function() {
    'use strict';

    // ==========================================
    // SUNDAY CLASS CONFIGURATION
    // ==========================================
    const SUNDAY_CLASS_CONFIG = {
        isFullyBooked: false  // Change to true when slots full
    };

    // ==========================================
    // PAGE LOADER
    // ==========================================
    window.addEventListener('load', function() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.5s ease';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }
    });

    // ==========================================
    // SUNDAY FULLY BOOKED MODAL - CLOSE
    // ==========================================
    function closeSundayFullyBookedModal() {
        const modal = document.getElementById('sunday-fullybooked-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.overflowX = 'hidden';
            document.documentElement.style.overflowX = 'hidden';
        }
        
        // Also close booking modal if open
        const bookingModal = document.getElementById('booking-modal');
        if (bookingModal && bookingModal.classList.contains('active')) {
            bookingModal.classList.remove('active');
        }
    }

    // ==========================================
    // MOBILE MENU TOGGLE
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            
            // Change icon
            if (mobileMenu.classList.contains('active')) {
                this.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                `;
            } else {
                this.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                `;
            }
        });

        // Close menu when clicking on a link
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.innerHTML = `
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                `;
            });
        });
    }

    // ==========================================
    // NAVBAR HIDE ON SCROLL
    // ==========================================
    let lastScrollTop = 0;
    const navbar = document.getElementById('navbar');
    const scrollThreshold = 100;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Update scroll progress
        updateScrollProgress();
        
        // Navbar hide/show logic
        if (scrollTop > scrollThreshold) {
            if (scrollTop > lastScrollTop) {
                // Scrolling DOWN - Hide navbar
                navbar.classList.add('nav-hidden');
            } else {
                // Scrolling UP - Show navbar
                navbar.classList.remove('nav-hidden');
            }
        } else {
            // At top of page - Always show
            navbar.classList.remove('nav-hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });

    // ==========================================
    // SCROLL PROGRESS BAR
    // ==========================================
    function updateScrollProgress() {
        const scrollProgress = document.getElementById('scroll-progress');
        if (!scrollProgress) return;
        
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        
        scrollProgress.style.width = scrolled + '%';
    }

    // ==========================================
    // HERO TYPING EFFECT
    // ==========================================
    const typingText = document.getElementById('hs-typing-text');
    const typingCursor = document.querySelector('.hs-typing-cursor');
    const textToType = 'YOUR MOVEMENT COACH';
    
    if (typingText && typingCursor) {
        let charIndex = 0;
        
        function typeCharacter() {
            if (charIndex < textToType.length) {
                typingText.textContent += textToType.charAt(charIndex);
                charIndex++;
                setTimeout(typeCharacter, 100);
            } else {
                // Hide cursor after typing completes
                setTimeout(() => {
                    typingCursor.style.display = 'none';
                }, 500);
            }
        }
        
        // Start typing after page load
        setTimeout(typeCharacter, 800);
    }

    // ==========================================
    // ACHIEVEMENT COUNTER ANIMATION
    // ==========================================
    const counterObserverOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const hasPlus = element.getAttribute('data-plus') === 'true';
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
                // Add + suffix for specific counters
                const label = element.nextElementSibling;
                if (hasPlus || (label && (label.textContent.includes('Hours') || label.textContent.includes('Social') || label.textContent.includes('Clients')))) {
                    element.textContent = target + '+';
                }
            }
        };
        
        updateCounter();
    }

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                animateCounter(entry.target);
            }
        });
    }, counterObserverOptions);

    // Observe all achievement numbers
    document.querySelectorAll('.achievement-number').forEach(counter => {
        counterObserver.observe(counter);
    });

    // ==========================================
    // PRICING TOGGLE FUNCTION
    // ==========================================
    window.toggleOption = function(optionId) {
        const content = document.getElementById(optionId + '-content');
        const icon = document.getElementById(optionId + '-icon');
        const option = document.getElementById(optionId);

        if (!content || !option) return;

        // Check if currently expanded
        const isExpanded = option.classList.contains('active');

        // Close all other options first
        ['option1', 'option2', 'option3', 'option4', 'option5','option6'].forEach(id => {
            if (id !== optionId) {
                const otherContent = document.getElementById(id + '-content');
                const otherIcon = document.getElementById(id + '-icon');
                const otherOption = document.getElementById(id);
                
                if (otherOption) otherOption.classList.remove('active');
                if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
            }
        });

        // Toggle current option
        if (isExpanded) {
            option.classList.remove('active');
            if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
            option.classList.add('active');
            if (icon) icon.style.transform = 'rotate(180deg)';
        }
    };

    // ==========================================
    // SUNDAY CLASS BOOKING HANDLER
    // ==========================================
    window.handleSundayClassBooking = function(event) {
        event.preventDefault();
        event.stopPropagation();
        
        if (SUNDAY_CLASS_CONFIG.isFullyBooked) {
            // Close booking modal if open
            const bookingModal = document.getElementById('booking-modal');
            if (bookingModal && bookingModal.classList.contains('active')) {
                bookingModal.classList.remove('active');
            }
            
            // Open fully booked modal
            openSundayFullyBookedModal();
        } else {
            // Open normal booking modal
            if (typeof openBookingModal === 'function') {
                openBookingModal('sundayClass');
            }
        }
    };

    // Setup Sunday Class CTA button
    function setupSundayClassButton() {
        const sundayClassBtn = document.querySelector('#option2 .pricing-option__cta');
        if (sundayClassBtn) {
            // Remove any existing onclick attribute
            sundayClassBtn.removeAttribute('onclick');
            
            // Remove old event listeners by cloning
            const newBtn = sundayClassBtn.cloneNode(true);
            sundayClassBtn.parentNode.replaceChild(newBtn, sundayClassBtn);
            
            // Add new event listener
            newBtn.addEventListener('click', handleSundayClassBooking);
        }
    }

    // Call setup after DOM loaded
    setTimeout(setupSundayClassButton, 500);

    // ==========================================
    // SUNDAY FULLY BOOKED MODAL
    // ==========================================
    function openSundayFullyBookedModal() {
        const modal = document.getElementById('sunday-fullybooked-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.body.style.overflowX = 'hidden';
            document.documentElement.style.overflowX = 'hidden';
        }
    }

    // Make it globally accessible
    window.closeSundayFullyBookedModal = closeSundayFullyBookedModal;

    // Close button
    const sundayCloseBtn = document.getElementById('sunday-fullybooked-close');
    if (sundayCloseBtn) {
        sundayCloseBtn.addEventListener('click', closeSundayFullyBookedModal);
    }

    // Overlay click
    const sundayOverlay = document.getElementById('sunday-fullybooked-overlay');
    if (sundayOverlay) {
        sundayOverlay.addEventListener('click', closeSundayFullyBookedModal);
    }

    // ESC key for fully booked modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('sunday-fullybooked-modal');
            if (modal && modal.classList.contains('active')) {
                closeSundayFullyBookedModal();
            }
        }
    });

    // ==========================================
    // NEXT SUNDAY DATE CALCULATOR
    // ==========================================
    function setNextSundayDate() {
        const dateElement = document.getElementById('nextSundayDate');
        if (!dateElement) return;

        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
        
        const nextSunday = new Date(today);
        nextSunday.setDate(today.getDate() + daysUntilSunday);
        
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        dateElement.textContent = nextSunday.toLocaleDateString('en-IN', options);
    }

    setNextSundayDate();

    console.log('✅ Main.js loaded successfully');
    console.log('📅 Sunday Class Status:', SUNDAY_CLASS_CONFIG.isFullyBooked ? 'FULLY BOOKED' : 'SLOTS AVAILABLE');

})();
// ==========================================
// AUTO OPEN PRICING CARD FROM URL
// ==========================================
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const openCard = urlParams.get('open');
    
    if (openCard === 'sundayClass') {
        setTimeout(function() {
            const option2 = document.getElementById('option2');
            if (option2 && typeof toggleOption === 'function') {
                toggleOption('option2');
                setTimeout(function() {
                    option2.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }
        }, 300);
    }
    
    if (openCard === 'consultation') {
        setTimeout(function() {
            const option1 = document.getElementById('option1');
            if (option1 && typeof toggleOption === 'function') {
                toggleOption('option1');
                setTimeout(function() {
                    option1.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }
        }, 300);
    }
    
    if (openCard === 'virtualClass') {
        setTimeout(function() {
            const option5 = document.getElementById('option5');
            if (option5 && typeof toggleOption === 'function') {
                toggleOption('option5');
                setTimeout(function() {
                    option5.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }
        }, 300);
    }
});