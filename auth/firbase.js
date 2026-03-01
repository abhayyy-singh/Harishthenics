/* ================================================
   HARISTHENICS - FIREBASE
   auth/firebase.js
   ================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBr9Lga7_vPihQ0siiJ0_c58KkGgrrYVCM",
    authDomain: "workshop-gng.firebaseapp.com",
    projectId: "workshop-gng",
    storageBucket: "workshop-gng.firebasestorage.app",
    messagingSenderId: "304234238485",
    appId: "1:304234238485:web:040417be6f6a7cb35ef41c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ==========================================
// LOGIN WITH GOOGLE
// ==========================================
async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            lastLogin: new Date().toISOString()
        }, { merge: true });

        console.log('✅ Login successful:', user.displayName);
        return user;
    } catch (error) {
        console.error('❌ Login error:', error);
    }
}

// ==========================================
// LOGOUT
// ==========================================
async function logoutUser() {
    try {
        await signOut(auth);
        console.log('✅ Logged out');
    } catch (error) {
        console.error('❌ Logout error:', error);
    }
}

// ==========================================
// GET USER PURCHASES
// ==========================================
async function getUserPurchases(userId) {
    try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) return docSnap.data().purchases || [];
        return [];
    } catch (error) {
        console.error('❌ Error fetching purchases:', error);
        return [];
    }
}

// ==========================================
// SAVE PURCHASE TO FIRESTORE
// ==========================================
async function savePurchase(userId, courseData) {
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);
        const existing = docSnap.exists() ? (docSnap.data().purchases || []) : [];

        const alreadyBought = existing.find(p => p.id === courseData.id);
        if (alreadyBought) return;

        await setDoc(userRef, {
            purchases: [...existing, {
                id: courseData.id,
                name: courseData.name,
                url: courseData.url,
                thumbnail: courseData.thumbnail,
                date: new Date().toLocaleDateString('en-IN'),
                paymentId: courseData.paymentId
            }]
        }, { merge: true });

        console.log('✅ Purchase saved!');
    } catch (e) {
        console.error('❌ Save purchase error:', e);
    }
}

// ==========================================
// GENERATE CLAIM TOKEN
// Called after payment success in workout-program.js
//
// Scalable — naya course add karna = sirf
// courseData object change karo. Koi aur code nahi.
// ==========================================
async function generateClaimToken(userEmail, courseData) {
    try {
        // Random token — 20 char
        const token = Math.random().toString(36).substring(2, 12) +
                      Math.random().toString(36).substring(2, 12);

        const claimData = {
            token,
            email: userEmail,
            courseId: courseData.id,
            courseName: courseData.name,
            courseUrl: courseData.url,
            thumbnail: courseData.thumbnail,
            paymentId: courseData.paymentId,
            claimed: false,
            claimedBy: null,
            claimedAt: null,
            createdAt: new Date().toISOString(),
            // 30 days expiry
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        // Save to Firestore — claims collection
        await setDoc(doc(db, 'claims', token), claimData);

        console.log('✅ Claim token generated:', token);
        return token;

    } catch (e) {
        console.error('❌ Generate token error:', e);
        return null;
    }
}

// ==========================================
// AUTH STATE LISTENER
// ==========================================
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.currentUser = user;
        updateNavbarUI(user);
        loadMyCourses(user);

        // Pending purchase check (bina login ke payment kiya tha)
        const pending = localStorage.getItem('pending_purchase');
        if (pending) {
            try {
                const courseData = JSON.parse(pending);
                savePurchase(user.uid, courseData).then(() => {
                    localStorage.removeItem('pending_purchase');
                    loadMyCourses(user);
                    console.log('✅ Pending purchase claimed!');
                });
            } catch (e) {}
        }
    } else {
        window.currentUser = null;
        updateNavbarUI(null);
    }
});

// ==========================================
// UPDATE NAVBAR UI
// ==========================================
function updateNavbarUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.getElementById('userProfile');
    const userName = document.getElementById('userDisplayName');
    const userPhoto = document.getElementById('userPhoto');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        if (userName) userName.textContent = user.displayName.split(' ')[0];
        if (userPhoto) userPhoto.src = user.photoURL;
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }
}

// ==========================================
// LOAD MY COURSES — index.html ke liye
// ==========================================
async function loadMyCourses(user) {
    const section = document.getElementById('myCoursesSection');
    if (!section) return;

    const purchases = await getUserPurchases(user.uid);

    if (purchases.length === 0) {
        section.style.display = 'none';
        return;
    }

    section.style.display = 'block';

    const coursesHTML = purchases.map(course => `
        <div class="my-course-card" onclick="window.location.href='${course.url}'">
            <div class="my-course-card__thumb">
                <img src="${course.thumbnail}" alt="${course.name}" 
                     onerror="this.src='https://img.youtube.com/vi/HuNyJjbmtOQ/maxresdefault.jpg'">
                <div class="my-course-card__play">▶</div>
            </div>
            <div class="my-course-card__info">
                <h3>${course.name}</h3>
                <p>Purchased on ${course.date}</p>
            </div>
        </div>
    `).join('');

    document.getElementById('myCoursesGrid').innerHTML = coursesHTML;
}

// ==========================================
// GLOBAL EXPORTS
// ==========================================
window.loginWithGoogle = loginWithGoogle;
window.logoutUser = logoutUser;
window.savePurchase = savePurchase;
window.generateClaimToken = generateClaimToken;

console.log('✅ Firebase.js loaded');