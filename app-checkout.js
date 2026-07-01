/* ================================================
   HARISTHENICS — APP CHECKOUT
   app-checkout.js
   Flow: App → Safari → Razorpay → Backend verify → Firestore
   Security: Firebase ID token (1hr TTL) verified server-side
   ================================================ */

'use strict';

const BACKEND_URL = 'https://haristhenics-backend.vercel.app';
const GST_RATE = 0.18;

// ── Coupon discounts (mirrors app config) ──
const VALID_COUPONS = {
  HARISH10: 10,
  HARISH20: 20,
};

// ── URL params ──
const params = new URLSearchParams(window.location.search);
const courseId   = params.get('courseId');
const courseTitle = decodeURIComponent(params.get('title') || '');
const basePrice  = parseInt(params.get('price') || '0', 10);
const idToken    = params.get('token');
const couponCode = (params.get('coupon') || '').toUpperCase();

// ── DOM refs ──
const checkoutView = document.getElementById('checkout-view');
const successView  = document.getElementById('success-view');
const errorView    = document.getElementById('error-view');
const payBtn       = document.getElementById('pay-btn');
const btnLoader    = document.getElementById('btn-loader');
const btnText      = document.getElementById('btn-text');

function showView(view) {
  [checkoutView, successView, errorView].forEach(v => v.classList.add('hidden'));
  view.classList.remove('hidden');
}

function showError(title, body) {
  document.getElementById('error-title').textContent = title || 'Something went wrong';
  document.getElementById('error-body').textContent = body || 'Please try again or contact support.';
  showView(errorView);
}

function setBtnLoading(loading) {
  payBtn.disabled = loading;
  if (loading) {
    btnLoader.classList.remove('hidden');
    btnText.classList.add('hidden');
  } else {
    btnLoader.classList.add('hidden');
    btnText.classList.remove('hidden');
  }
}

// ── Price calculation ──
function calcPrices(base, coupon) {
  const discountPct  = VALID_COUPONS[coupon] || 0;
  const discountAmt  = Math.round(base * discountPct / 100);
  const afterDiscount = base - discountAmt;
  const gst          = Math.round(afterDiscount * GST_RATE);
  const total        = afterDiscount + gst;
  return { discountPct, discountAmt, afterDiscount, gst, total };
}

// ── Init: validate params, render UI ──
function init() {
  if (!courseId || !idToken) {
    showError('Invalid Checkout Link', 'This link is invalid or has expired. Please go back to the app and try again.');
    return;
  }

  const prices = calcPrices(basePrice, couponCode);

  // Render order summary
  document.getElementById('order-name').textContent = courseTitle || 'Haristhenics Plan';
  document.getElementById('price-base').textContent = `₹${basePrice.toLocaleString('en-IN')}`;
  document.getElementById('price-gst').textContent = `₹${prices.gst.toLocaleString('en-IN')}`;
  document.getElementById('price-total').textContent = `₹${prices.total.toLocaleString('en-IN')}`;
  document.getElementById('btn-amount').textContent = prices.total.toLocaleString('en-IN');

  if (prices.discountAmt > 0) {
    document.getElementById('row-discount').style.display = 'flex';
    document.getElementById('discount-label').textContent = `Discount (${prices.discountPct}%)`;
    document.getElementById('price-discount').textContent = `-₹${prices.discountAmt.toLocaleString('en-IN')}`;
  }

  // Enable pay button
  setBtnLoading(false);
  payBtn.onclick = () => startPayment(prices.total);
}

// ── Step 1: Create order on backend ──
async function startPayment(totalAmount) {
  setBtnLoading(true);

  let orderData;
  try {
    const res = await fetch(`${BACKEND_URL}/api/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        courseId,
        ...(couponCode ? { couponCode } : {}),
      }),
    });
    orderData = await res.json();
    if (!res.ok) throw new Error(orderData.error || 'Order creation failed');
  } catch (err) {
    setBtnLoading(false);
    showError('Payment Failed', err.message || 'Could not create order. Please try again.');
    return;
  }

  // ── Step 2: Open Razorpay ──
  const rzp = new window.Razorpay({
    key: orderData.keyId,
    amount: orderData.amount,
    currency: orderData.currency || 'INR',
    name: 'Haristhenics',
    description: courseTitle,
    order_id: orderData.orderId,
    theme: { color: '#7AAECC' },
    modal: {
      ondismiss: () => setBtnLoading(false),
    },
    handler: (response) => verifyPayment(response),
  });

  rzp.on('payment.failed', (response) => {
    setBtnLoading(false);
    const reason = response?.error?.description || 'Payment was not completed.';
    showError('Payment Failed', reason);
  });

  rzp.open();
}

// ── Step 3: Verify payment signature on backend ──
async function verifyPayment(response) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Verification failed');
    }
    showView(successView);
  } catch (err) {
    showError(
      'Verification Failed',
      'If your amount was deducted, please contact support. Your access will be granted manually within 24 hours.'
    );
  }
}

// ── Boot ──
init();
