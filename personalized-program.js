/* ================================================
   HARISTHENICS - PERSONALIZED WORKOUT PROGRAM
   personalized-program.js — Modal, Payment, Email, Sheet
   ================================================ */

(function () {
    'use strict';

    const PROGRAM_CONFIG = {
        razorpayKey: 'rzp_live_SwjC4BfDWgdJ2o',
        amount: 1500000,
        currency: 'INR',
        businessName: 'Haristhenics',
        description: 'Personalized Workout Program',
        SHEET_URL: 'https://script.google.com/macros/s/AKfycbxvPsHy1S3Mav7cKkJ6k1Ep8oS8dxELeyXLlZZuhXp2HN1wCRGQJx7uzNJcBjPhvzyT6A/exec'
    };

    const PERSONALIZED_SLOTS_OPEN = false;       // online personalized program
    const HARISH_TRAINING_SLOTS_OPEN = false;    // offline Train with Haristhenics

    /* ── Personalized Program (online) ── */
    function openPersonalizedModal() {
        if (!PERSONALIZED_SLOTS_OPEN) { openPersonalizedFullyBookedModal(); return; }
        const modal = document.getElementById('personalizedModal');
        if (modal) {
            document.getElementById('pStepManifesto').style.display = 'block';
            document.getElementById('pStepForm').style.display = 'none';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closePersonalizedModal() {
        const modal = document.getElementById('personalizedModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            const form = document.getElementById('personalizedForm');
            if (form) { form.reset(); form.style.display = ''; }
            const successDiv = document.getElementById('personalizedSuccess');
            if (successDiv) successDiv.style.display = 'none';
            const manifesto = document.getElementById('pStepManifesto');
            const formStep = document.getElementById('pStepForm');
            if (manifesto) manifesto.style.display = 'block';
            if (formStep) formStep.style.display = 'none';
        }
    }

    function openPersonalizedFullyBookedModal() {
        const modal = document.getElementById('personalized-fullybooked-modal');
        if (modal) modal.classList.add('active');
    }

    function closePersonalizedFullyBookedModal() {
        const modal = document.getElementById('personalized-fullybooked-modal');
        if (modal) modal.classList.remove('active');
    }

    /* ── Train with Haristhenics (offline) ── */
    function openHarishTrainingModal() {
        if (!HARISH_TRAINING_SLOTS_OPEN) { openHarishTrainingFullyBookedModal(); return; }
        const modal = document.getElementById('harishTrainingModal');
        if (modal) {
            // Always start at manifesto step
            document.getElementById('htStepManifesto').style.display = 'block';
            document.getElementById('htStepForm').style.display = 'none';
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeHarishTrainingModal() {
        const modal = document.getElementById('harishTrainingModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            const form = document.getElementById('harishTrainingForm');
            if (form) { form.reset(); form.style.display = ''; }
            const successDiv = document.getElementById('harishTrainingSuccess');
            if (successDiv) successDiv.style.display = 'none';
            // Reset to manifesto step
            const manifesto = document.getElementById('htStepManifesto');
            const formStep = document.getElementById('htStepForm');
            if (manifesto) manifesto.style.display = 'block';
            if (formStep) formStep.style.display = 'none';
        }
    }

    function openHarishTrainingFullyBookedModal() {
        const modal = document.getElementById('personalized-fullybooked-modal');
        if (modal) modal.classList.add('active');
    }

    function closeHarishTrainingFullyBookedModal() {
        closePersonalizedFullyBookedModal();
    }

    /* ── Personalized Program — in-card video ── */
    let ppVideoMuted = false;
    let ppVideoPlaying = false;

    function ppVideoSrc(muted, controls) {
        return 'https://www.youtube.com/embed/2kdahBUWNpU?autoplay=1&mute=' + (muted ? 1 : 0) + '&loop=1&playlist=2kdahBUWNpU&controls=' + (controls ? 1 : 0) + '&rel=0&modestbranding=1';
    }

    window.togglePpVideoMute = function () {
        const iframe = document.getElementById('pp-training-video');
        if (!iframe || !ppVideoPlaying) return;
        ppVideoMuted = !ppVideoMuted;
        iframe.src = ppVideoSrc(ppVideoMuted, false);
        document.getElementById('pp-icon-muted').style.display   = ppVideoMuted ? 'block' : 'none';
        document.getElementById('pp-icon-unmuted').style.display = ppVideoMuted ? 'none'  : 'block';
    };

    window.togglePpFullscreen = function () {
        const iframe = document.getElementById('pp-training-video');
        if (!iframe || !ppVideoPlaying) return;
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            if (document.exitFullscreen) document.exitFullscreen();
            else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
            return;
        }
        iframe.src = ppVideoSrc(ppVideoMuted, true);
        const req = iframe.requestFullscreen || iframe.webkitRequestFullscreen || iframe.mozRequestFullScreen;
        if (req) req.call(iframe);
    };

    document.addEventListener('fullscreenchange', function () {
        if (!document.fullscreenElement) {
            const iframe = document.getElementById('pp-training-video');
            if (iframe && ppVideoPlaying) iframe.src = ppVideoSrc(ppVideoMuted, false);
        }
    });
    document.addEventListener('webkitfullscreenchange', function () {
        if (!document.webkitFullscreenElement) {
            const iframe = document.getElementById('pp-training-video');
            if (iframe && ppVideoPlaying) iframe.src = ppVideoSrc(ppVideoMuted, false);
        }
    });

    /* ── Harish Training — in-card video ── */
    let hsVideoMuted = false; // starts unmuted when card opens
    window.toggleHsVideoMute = function () {
        const iframe = document.getElementById('hs-training-video');
        const iconMuted   = document.getElementById('hs-icon-muted');
        const iconUnmuted = document.getElementById('hs-icon-unmuted');
        if (!iframe) return;
        hsVideoMuted = !hsVideoMuted;
        const muteParam = hsVideoMuted ? '1' : '0';
        iframe.src = `https://www.youtube.com/embed/P0P2WBWl2CI?autoplay=1&mute=${muteParam}&loop=1&playlist=P0P2WBWl2CI&controls=0&rel=0&modestbranding=1&enablejsapi=0`;
        if (iconMuted)   iconMuted.style.display   = hsVideoMuted ? 'block' : 'none';
        if (iconUnmuted) iconUnmuted.style.display = hsVideoMuted ? 'none'  : 'block';
    };

    document.addEventListener('DOMContentLoaded', function () {

        /* ── Personalized modal listeners ── */
        const overlay = document.getElementById('personalizedModalOverlay');
        if (overlay) overlay.addEventListener('click', closePersonalizedModal);
        const closeBtn = document.getElementById('personalizedModalClose');
        if (closeBtn) closeBtn.addEventListener('click', closePersonalizedModal);
        const fbOverlay = document.getElementById('personalized-fullybooked-overlay');
        if (fbOverlay) fbOverlay.addEventListener('click', closePersonalizedFullyBookedModal);

        /* ── Harish Training modal listeners ── */
        const htOverlay = document.getElementById('harishTrainingModalOverlay');
        if (htOverlay) htOverlay.addEventListener('click', closeHarishTrainingModal);
        const htCloseBtn = document.getElementById('harishTrainingModalClose');
        if (htCloseBtn) htCloseBtn.addEventListener('click', closeHarishTrainingModal);

        // Manifesto → Form step
        const htReadyBtn = document.getElementById('htReadyBtn');
        if (htReadyBtn) {
            htReadyBtn.addEventListener('click', function () {
                document.getElementById('htStepManifesto').style.display = 'none';
                document.getElementById('htStepForm').style.display = 'block';
            });
        }

        // Manifesto → Form step (personalized)
        const pReadyBtn = document.getElementById('pReadyBtn');
        if (pReadyBtn) {
            pReadyBtn.addEventListener('click', function () {
                document.getElementById('pStepManifesto').style.display = 'none';
                document.getElementById('pStepForm').style.display = 'block';
            });
        }

        // Video auto-play when option cards expand
        const origToggle = window.toggleOption;
        window.toggleOption = function (optionId) {
            origToggle(optionId);

            // option7: Personalized Program video
            if (optionId === 'option7') {
                const isNowActive = document.getElementById('option7').classList.contains('active');
                const iframe    = document.getElementById('pp-training-video');
                const thumbnail = document.getElementById('pp-video-thumbnail');
                const ctrlBar   = document.getElementById('pp-ctrl-bar');
                if (iframe) {
                    if (isNowActive) {
                        ppVideoMuted = false;
                        ppVideoPlaying = true;
                        iframe.style.display = 'block';
                        if (ctrlBar) ctrlBar.style.display = 'flex';
                        document.getElementById('pp-icon-muted').style.display   = 'none';
                        document.getElementById('pp-icon-unmuted').style.display = 'block';
                        // hide thumbnail only after iframe has loaded
                        iframe.addEventListener('load', function hideThumbnail() {
                            if (thumbnail) thumbnail.style.display = 'none';
                            iframe.removeEventListener('load', hideThumbnail);
                        });
                        iframe.src = ppVideoSrc(false, false);
                    } else {
                        iframe.src = 'about:blank';
                        iframe.style.display = 'none';
                        ppVideoPlaying = false;
                        ppVideoMuted   = false;
                        if (thumbnail) thumbnail.style.display = 'block';
                        if (ctrlBar)   ctrlBar.style.display   = 'none';
                    }
                }
            }

            // option3: Harish Training video
            if (optionId === 'option3') {
                const isNowActive = document.getElementById('option3').classList.contains('active');
                const iframe = document.getElementById('hs-training-video');
                const iconMuted   = document.getElementById('hs-icon-muted');
                const iconUnmuted = document.getElementById('hs-icon-unmuted');
                if (iframe) {
                    if (isNowActive) {
                        hsVideoMuted = false;
                        iframe.src = 'https://www.youtube.com/embed/P0P2WBWl2CI?autoplay=1&mute=0&loop=1&playlist=P0P2WBWl2CI&controls=0&rel=0&modestbranding=1&enablejsapi=0';
                        if (iconMuted)   iconMuted.style.display   = 'none';
                        if (iconUnmuted) iconUnmuted.style.display = 'block';
                    } else {
                        iframe.src = '';
                        hsVideoMuted = true;
                        if (iconMuted)   iconMuted.style.display   = 'block';
                        if (iconUnmuted) iconUnmuted.style.display = 'none';
                    }
                }
            }
        };

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closePersonalizedModal();
                closePersonalizedFullyBookedModal();
                closeHarishTrainingModal();
            }
        });

        // Auto-expand card from direct link (#option7 or #option3)
        ['option7', 'option3'].forEach(function (id) {
            if (window.location.hash === '#' + id) {
                const el = document.getElementById(id);
                if (el && !el.classList.contains('active')) {
                    window.toggleOption(id);
                    setTimeout(function () { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);
                }
            }
        });

        /* ── Personalized Program form ── */
        const form = document.getElementById('personalizedForm');
        if (form) {
            form.addEventListener('submit', async function (e) {
                e.preventDefault();
                const submitBtn = document.getElementById('personalizedSubmitBtn');
                const name  = document.getElementById('personalizedName').value.trim();
                const email = document.getElementById('personalizedEmail').value.trim();
                const phone = document.getElementById('personalizedPhone').value.trim();

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!name || name.length < 2) { showError('personalizedError', 'Please enter a valid name'); return; }
                if (!email || !emailRegex.test(email)) { showError('personalizedError', 'Please enter a valid email'); return; }
                if (phone.replace(/\D/g, '').length < 10) { showError('personalizedError', 'Please enter a valid phone number'); return; }

                if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.disabled = true; }

                try {
                    if (typeof Razorpay === 'undefined') throw new Error('Payment system not loaded. Please refresh.');
                    const options = {
                        key: PROGRAM_CONFIG.razorpayKey,
                        amount: PROGRAM_CONFIG.amount,
                        currency: PROGRAM_CONFIG.currency,
                        name: PROGRAM_CONFIG.businessName,
                        description: 'Personalized Workout Program',
                        prefill: { name, email, contact: phone },
                        theme: { color: '#000000' },
                        handler: async function (response) {
                            const f = document.getElementById('personalizedForm');
                            const s = document.getElementById('personalizedSuccess');
                            if (f) f.style.display = 'none';
                            if (s) s.style.display = 'block';
                            if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                        },
                        modal: { ondismiss: function () { if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; } } }
                    };
                    const rzp = new Razorpay(options);
                    rzp.on('payment.failed', function (r) { showError('personalizedError', 'Payment failed: ' + r.error.description); if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; } });
                    rzp.open();
                } catch (error) {
                    showError('personalizedError', error.message || 'Payment failed. Please try again.');
                    if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                }
            });
        }

        /* ── Train with Haristhenics form ── */
        const htForm = document.getElementById('harishTrainingForm');
        if (htForm) {
            htForm.addEventListener('submit', async function (e) {
                e.preventDefault();
                const submitBtn = document.getElementById('harishTrainingSubmitBtn');
                const name  = document.getElementById('harishTrainingName').value.trim();
                const email = document.getElementById('harishTrainingEmail').value.trim();
                const phone = document.getElementById('harishTrainingPhone').value.trim();

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!name || name.length < 2) { showError('harishTrainingError', 'Please enter a valid name'); return; }
                if (!email || !emailRegex.test(email)) { showError('harishTrainingError', 'Please enter a valid email'); return; }
                if (phone.replace(/\D/g, '').length < 10) { showError('harishTrainingError', 'Please enter a valid phone number'); return; }

                if (submitBtn) { submitBtn.classList.add('loading'); submitBtn.disabled = true; }

                try {
                    if (typeof Razorpay === 'undefined') throw new Error('Payment system not loaded. Please refresh.');
                    const options = {
                        key: PROGRAM_CONFIG.razorpayKey,
                        amount: PROGRAM_CONFIG.amount,
                        currency: PROGRAM_CONFIG.currency,
                        name: PROGRAM_CONFIG.businessName,
                        description: 'Personally Train with Me at Grip&Grab',
                        prefill: { name, email, contact: phone },
                        theme: { color: '#000000' },
                        handler: async function (response) {
                            const f = document.getElementById('harishTrainingForm');
                            const s = document.getElementById('harishTrainingSuccess');
                            if (f) f.style.display = 'none';
                            if (s) s.style.display = 'block';
                            if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                        },
                        modal: { ondismiss: function () { if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; } } }
                    };
                    const rzp = new Razorpay(options);
                    rzp.on('payment.failed', function (r) { showError('harishTrainingError', 'Payment failed: ' + r.error.description); if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; } });
                    rzp.open();
                } catch (error) {
                    showError('harishTrainingError', error.message || 'Payment failed. Please try again.');
                    if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                }
            });
        }
    });

    function showError(id, msg) {
        const errDiv = document.getElementById(id);
        if (errDiv) { errDiv.textContent = msg; errDiv.classList.add('show'); }
    }

    window.openPersonalizedModal = openPersonalizedModal;
    window.closePersonalizedModal = closePersonalizedModal;
    window.openPersonalizedFullyBookedModal = openPersonalizedFullyBookedModal;
    window.closePersonalizedFullyBookedModal = closePersonalizedFullyBookedModal;
    window.openHarishTrainingModal = openHarishTrainingModal;
    window.closeHarishTrainingModal = closeHarishTrainingModal;

    console.log('✅ Programs loaded | Personalized:', PERSONALIZED_SLOTS_OPEN, '| Harish Training:', HARISH_TRAINING_SLOTS_OPEN);

})();