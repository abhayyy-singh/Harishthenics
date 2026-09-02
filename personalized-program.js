/* ================================================
   HARISTHENICS - PERSONALIZED WORKOUT PROGRAM
   personalized-program.js — Modal, Payment, Email, Sheet
   ================================================ */

(function () {
    'use strict';

    const PROGRAM_CONFIG = {
        razorpayKey: 'rzp_live_SwjC4BfDWgdJ2o',
        currency: 'INR',
        businessName: 'Haristhenics',
    };

    // Backend — server-verified pricing + live admin-panel availability
    const BACKEND_URL = 'https://haristhenics-backend.vercel.app';

    // Fails safe to "closed" if the live fetch doesn't come back in time
    const LIVE_SERVICES = {
        personalizedProgram: { price: 15000, isActive: false, isFullyBooked: true, fullyBookedMessage: '' },
        harishTraining:       { price: 15000, isActive: false, isFullyBooked: true, fullyBookedMessage: '' },
    };
    // Exposed globally so other scripts (e.g. main.js's deep-link handler) can
    // wait for the real isActive/isFullyBooked values instead of racing the
    // fixed "closed" defaults above with a guessed setTimeout.
    window.__liveServicesReady = fetch(`${BACKEND_URL}/api/site-config`)
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) {
            if (data && data.services) {
                data.services.forEach(function (svc) {
                    if (LIVE_SERVICES[svc.id]) LIVE_SERVICES[svc.id] = svc;
                });
            }
        })
        .catch(function (err) { console.warn('Live services fetch failed, using defaults:', err.message); });

    /* ── Personalized Program (online) ── */
    function openPersonalizedModal() {
        const svc = LIVE_SERVICES.personalizedProgram;
        if (!svc.isActive || svc.isFullyBooked) { openServiceFullyBookedModal(svc, 'personalizedProgram'); return; }
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

    // Shared across every service on the site — consultation (main.js), knee/back pain (workout-program.js),
    // personalized program + harish training (below). One popup, same look, everywhere.
    function openServiceFullyBookedModal(svc, serviceId) {
        const modal = document.getElementById('service-fullybooked-modal');
        const msgEl = document.getElementById('service-fullybooked-message');
        if (msgEl) {
            msgEl.textContent = (svc && svc.fullyBookedMessage) || 'All slots are Fully Booked.';
        }
        // Set serviceId for the Notify Me form
        var serviceIdInput = document.getElementById('notify-service-id');
        if (serviceIdInput) serviceIdInput.value = serviceId || '';
        // Reset form state
        var fields  = document.getElementById('notify-form-fields');
        var success = document.getElementById('notify-success');
        var errEl   = document.getElementById('notify-error');
        var btn     = document.getElementById('notify-submit-btn');
        var name    = document.getElementById('notify-name');
        var email   = document.getElementById('notify-email');
        var phone   = document.getElementById('notify-phone');
        if (fields)  { fields.style.display = 'flex'; }
        if (success) { success.style.display = 'none'; }
        if (errEl)   { errEl.style.display = 'none'; errEl.textContent = ''; }
        if (btn)     { btn.textContent = 'Notify Me When Slots Open'; btn.disabled = false; }
        if (name)    { name.value = ''; }
        if (email)   { email.value = ''; }
        if (phone)   { phone.value = ''; }
        if (modal) modal.classList.add('active');
    }

    function closeServiceFullyBookedModal() {
        const modal = document.getElementById('service-fullybooked-modal');
        if (modal) modal.classList.remove('active');
    }

    window.submitNotifyMe = function () {
        var name      = (document.getElementById('notify-name')?.value || '').trim();
        var email     = (document.getElementById('notify-email')?.value || '').trim();
        var phone     = (document.getElementById('notify-phone')?.value || '').trim();
        var serviceId = document.getElementById('notify-service-id')?.value || '';
        var hp        = document.getElementById('notify-hp')?.value || '';
        var errEl     = document.getElementById('notify-error');
        var btn       = document.getElementById('notify-submit-btn');

        if (!name || !email || !phone) {
            if (errEl) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; }
            return;
        }

        if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
        if (errEl) { errEl.style.display = 'none'; }

        fetch(BACKEND_URL + '/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'subscribe', serviceId: serviceId, name: name, email: email, phone: phone || null, _hp: hp || undefined }),
        })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.success) {
                var fields  = document.getElementById('notify-form-fields');
                var success = document.getElementById('notify-success');
                if (fields)  fields.style.display = 'none';
                if (success) success.style.display = 'block';
            } else {
                if (errEl) { errEl.textContent = 'Something went wrong. Please try again.'; errEl.style.display = 'block'; }
                if (btn)   { btn.textContent = 'Notify Me When Slots Open'; btn.disabled = false; }
            }
        })
        .catch(function () {
            if (errEl) { errEl.textContent = 'Connection error. Please try again.'; errEl.style.display = 'block'; }
            if (btn)   { btn.textContent = 'Notify Me When Slots Open'; btn.disabled = false; }
        });
    };

    /* ── Train with Haristhenics (offline) ── */
    function openHarishTrainingModal() {
        const svc = LIVE_SERVICES.harishTraining;
        if (!svc.isActive || svc.isFullyBooked) { openServiceFullyBookedModal(svc, 'harishTraining'); return; }
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

    /* ── Harish Training card: thumbnail-only, deliberately never plays — see
       the option3 branch below (removed) for why. ── */

    document.addEventListener('DOMContentLoaded', function () {

        /* ── Personalized modal listeners ── */
        const overlay = document.getElementById('personalizedModalOverlay');
        if (overlay) overlay.addEventListener('click', closePersonalizedModal);
        const closeBtn = document.getElementById('personalizedModalClose');
        if (closeBtn) closeBtn.addEventListener('click', closePersonalizedModal);
        const fbOverlay = document.getElementById('service-fullybooked-overlay');
        if (fbOverlay) fbOverlay.addEventListener('click', closeServiceFullyBookedModal);

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

            // option3 (Harish Training): thumbnail-only, deliberately never
            // plays — no video-toggle logic here on purpose.
        };

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closePersonalizedModal();
                closeServiceFullyBookedModal();
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

                    // Server creates the order with the real price — browser can no longer set its own amount
                    const orderRes = await fetch(`${BACKEND_URL}/api/create-website-order`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ serviceKey: 'personalizedProgram', name, email, phone })
                    });
                    const orderData = await orderRes.json();
                    if (!orderRes.ok) throw new Error(orderData.error || 'Could not start payment. Please try again.');

                    const options = {
                        key: orderData.keyId,
                        order_id: orderData.orderId,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: PROGRAM_CONFIG.businessName,
                        description: orderData.serviceTitle,
                        prefill: { name, email, contact: phone },
                        theme: { color: '#000000' },
                        handler: async function (response) {
                            // Confirmation email + app account are handled server-side by the Razorpay webhook
                            const f = document.getElementById('personalizedForm');
                            const s = document.getElementById('personalizedSuccess');
                            if (f) f.style.display = 'none';
                            if (s) s.style.display = 'block';
                            if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                        },
                        modal: { ondismiss: function () {
                            if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                            fetch(BACKEND_URL + '/api/create-website-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'abandon', email: email, razorpayOrderId: orderData.orderId }) }).catch(function(){});
                        } }
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

                    // Server creates the order with the real price — browser can no longer set its own amount
                    const orderRes = await fetch(`${BACKEND_URL}/api/create-website-order`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ serviceKey: 'harishTraining', name, email, phone })
                    });
                    const orderData = await orderRes.json();
                    if (!orderRes.ok) throw new Error(orderData.error || 'Could not start payment. Please try again.');

                    const options = {
                        key: orderData.keyId,
                        order_id: orderData.orderId,
                        amount: orderData.amount,
                        currency: orderData.currency,
                        name: PROGRAM_CONFIG.businessName,
                        description: orderData.serviceTitle,
                        prefill: { name, email, contact: phone },
                        theme: { color: '#000000' },
                        handler: async function (response) {
                            // Confirmation email + app account are handled server-side by the Razorpay webhook
                            const f = document.getElementById('harishTrainingForm');
                            const s = document.getElementById('harishTrainingSuccess');
                            if (f) f.style.display = 'none';
                            if (s) s.style.display = 'block';
                            if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                        },
                        modal: { ondismiss: function () {
                            if (submitBtn) { submitBtn.classList.remove('loading'); submitBtn.disabled = false; }
                            fetch(BACKEND_URL + '/api/create-website-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'abandon', email: email, razorpayOrderId: orderData.orderId }) }).catch(function(){});
                        } }
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
    window.openServiceFullyBookedModal = openServiceFullyBookedModal;
    window.closeServiceFullyBookedModal = closeServiceFullyBookedModal;
    window.openHarishTrainingModal = openHarishTrainingModal;
    window.closeHarishTrainingModal = closeHarishTrainingModal;

    console.log('✅ Programs loaded');

})();