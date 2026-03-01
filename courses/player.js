/* ================================================
   HARISTHENICS - COURSE PLAYER
   player.js — Dynamic, config-driven, scalable
   
   Adding a new course = sirf COURSES object mein 
   ek entry add karo. Koi aur code nahi.
   ================================================ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// FIREBASE INIT
// ==========================================
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

// ==========================================
// COURSES CONFIG
// Naya course add karna = sirf yahan ek entry
// ==========================================
const COURSES = {
    'knee-pain': {
        id: 'knee-pain',
        name: 'Knee Pain Recovery Program',
        thumbnail: 'https://img.youtube.com/vi/HuNyJjbmtOQ/maxresdefault.jpg',
        url: '/courses/player.html?course=knee-pain',

        chapters: [
            {
                id: 'important-videos',
                title: 'Important Videos',
                videos: [
                    { id: 'kp-v1', title: 'Introduction — Why Movement Is Important',       ytId: 'PLACEHOLDER_1' },
                    { id: 'kp-v2', title: 'My Ideology Behind Knee Pain',                    ytId: 'PLACEHOLDER_2' },
                    { id: 'kp-v3', title: 'How to Start Program | Reps-Sets Ideology',       ytId: 'PLACEHOLDER_3' },
                    { id: 'kp-v4', title: 'What Not to Do',                                  ytId: 'PLACEHOLDER_4' },
                ]
            },
            {
                id: 'level-1',
                title: 'Level 1 — Getting Started',
                videos: [
                    { id: 'kp-v5', title: 'Key Considerations Before Starting This Program', ytId: 'PLACEHOLDER_5' },
                ]
            },
            {
                id: 'release-work',
                title: 'Release Work',
                note: 'Can be performed on rest days to support recovery.',
                videos: [
                    { id: 'kp-v6', title: 'Calf Release',                                    ytId: 'PLACEHOLDER_6' },
                    { id: 'kp-v7', title: 'Hamstring Release',                               ytId: 'PLACEHOLDER_7' },
                    { id: 'kp-v8', title: 'Hip Release',                                     ytId: 'PLACEHOLDER_8' },
                    { id: 'kp-v9', title: 'Quad Release',                                    ytId: 'PLACEHOLDER_9' },
                ]
            },
            {
                id: 'main-exercise',
                title: 'Main Exercise',
                videos: [
                    { id: 'kp-v10', title: 'Why Are We Doing These Exercises',               ytId: 'PLACEHOLDER_10' },
                    { id: 'kp-v11', title: 'Standing Knee Raises (Seated/Standing)',         ytId: 'PLACEHOLDER_11' },
                    { id: 'kp-v12', title: 'Calf Raises',                                    ytId: 'PLACEHOLDER_12' },
                    { id: 'kp-v13', title: 'Tibialis Raises (Standing)',                     ytId: 'PLACEHOLDER_13' },
                    { id: 'kp-v14', title: 'Standing Leg Curl',                              ytId: 'PLACEHOLDER_14' },
                    { id: 'kp-v15', title: 'Seated Single Leg Lift Hold in Two Way',         ytId: 'PLACEHOLDER_15' },
                    { id: 'kp-v16', title: 'Quadruped Side Leg Lift',                        ytId: 'PLACEHOLDER_16' },
                    { id: 'kp-v17', title: 'Single Leg Lift in Prone Position',              ytId: 'PLACEHOLDER_17' },
                    { id: 'kp-v18', title: 'Single Leg Adduction Abduction',                 ytId: 'PLACEHOLDER_18' },
                ]
            },
            {
                id: 'advanced',
                title: 'Advanced Exercises',
                note: 'Watch the intro video before starting these exercises.',
                videos: [
                    { id: 'kp-v19', title: 'Watch Before Doing Below Exercises',             ytId: 'PLACEHOLDER_19' },
                    { id: 'kp-v20', title: 'Nordic Curls',                                   ytId: 'PLACEHOLDER_20' },
                    { id: 'kp-v21', title: 'Reverse Nordic Curl',                            ytId: 'PLACEHOLDER_21' },
                    { id: 'kp-v22', title: 'Wall Squat Hold',                                ytId: 'PLACEHOLDER_22' },
                    { id: 'kp-v23', title: 'Sumo Squat Hold',                                ytId: 'PLACEHOLDER_23' },
                ]
            }
        ]
    }

    // ==========================================
    // FUTURE COURSE — bas yahan add karo:
    // 'back-pain': {
    //     id: 'back-pain',
    //     name: 'Back Pain Recovery Program',
    //     ...
    // }
    // ==========================================
};

// ==========================================
// STATE
// ==========================================
let currentUser = null;
let currentCourse = null;
let currentVideoId = null;
let watchedVideos = new Set();
let allVideos = []; // flat list for prev/next

// ==========================================
// INIT
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const courseId = urlParams.get('course') || 'knee-pain';

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        showAccessDenied();
        return;
    }

    currentUser = user;
    updateNavUser(user);

    // Check if user has purchased this course
    const hasPurchase = await checkPurchase(user.uid, courseId);
    if (!hasPurchase) {
        showAccessDenied();
        return;
    }

    // Load course
    currentCourse = COURSES[courseId];
    if (!currentCourse) {
        showAccessDenied();
        return;
    }

    // Load watched videos
    await loadWatchedVideos(user.uid, courseId);

    // Render sidebar
    renderSidebar(currentCourse);

    // Play last watched or first video
    const lastVideoId = getLastWatched(user.uid, courseId);
    const firstVideo = currentCourse.chapters[0].videos[0];
    playVideo(lastVideoId || firstVideo.id);
});

// ==========================================
// CHECK PURCHASE
// ==========================================
async function checkPurchase(userId, courseId) {
    try {
        const userRef = doc(db, 'users', userId);
        const snap = await getDoc(userRef);
        if (!snap.exists()) return false;
        const purchases = snap.data().purchases || [];
        return purchases.some(p => p.id === courseId);
    } catch (e) {
        console.error('Purchase check error:', e);
        return false;
    }
}

// ==========================================
// LOAD WATCHED VIDEOS
// ==========================================
async function loadWatchedVideos(userId, courseId) {
    // Firebase first
    try {
        const ref = doc(db, 'progress', `${userId}_${courseId}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const data = snap.data();
            watchedVideos = new Set(data.watched || []);
            return;
        }
    } catch (e) {}

    // LocalStorage fallback
    try {
        const key = `hs_watched_${userId}_${courseId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            watchedVideos = new Set(JSON.parse(stored));
        }
    } catch (e) {}
}

// ==========================================
// SAVE WATCHED VIDEO
// ==========================================
async function markVideoWatched(videoId) {
    watchedVideos.add(videoId);

    // Update UI
    const item = document.querySelector(`[data-video-id="${videoId}"]`);
    if (item) item.classList.add('watched');
    updateMarkBtn(videoId);

    if (!currentUser) return;

    // Firebase save
    try {
        const ref = doc(db, 'progress', `${currentUser.uid}_${courseId}`);
        await setDoc(ref, {
            watched: [...watchedVideos],
            lastVideo: currentVideoId,
            updatedAt: new Date().toISOString()
        }, { merge: true });
    } catch (e) {}

    // LocalStorage backup
    try {
        const key = `hs_watched_${currentUser.uid}_${courseId}`;
        localStorage.setItem(key, JSON.stringify([...watchedVideos]));
    } catch (e) {}
}

// ==========================================
// LAST WATCHED — save & get
// ==========================================
function saveLastWatched(userId, courseId, videoId) {
    try {
        localStorage.setItem(`hs_last_${userId}_${courseId}`, videoId);
    } catch (e) {}
}

function getLastWatched(userId, courseId) {
    try {
        return localStorage.getItem(`hs_last_${userId}_${courseId}`);
    } catch (e) {
        return null;
    }
}

// ==========================================
// RENDER SIDEBAR
// ==========================================
function renderSidebar(course) {
    allVideos = [];

    // Course meta
    const totalVideos = course.chapters.reduce((sum, ch) => sum + ch.videos.length, 0);
    document.getElementById('sidebarCourseTitle').textContent = course.name;
    document.getElementById('sidebarCourseMeta').textContent = `${course.chapters.length} chapters · ${totalVideos} videos`;
    document.getElementById('navCourseTitle').textContent = course.name;

    // Build flat video list
    course.chapters.forEach(ch => {
        ch.videos.forEach(v => allVideos.push({ ...v, chapterTitle: ch.title }));
    });

    // Render chapters
    const container = document.getElementById('sidebarChapters');
    container.innerHTML = course.chapters.map((chapter, i) => `
        <div class="chapter-group ${i === 0 ? 'open' : ''}" id="chapter-${chapter.id}">
            <div class="chapter-group__header" onclick="toggleChapter('${chapter.id}')">
                <span class="chapter-group__title">${chapter.title}</span>
                <span class="chapter-group__meta">${chapter.videos.length} videos</span>
                <svg class="chapter-group__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="6 9 12 15 18 9"/>
                </svg>
            </div>
            ${chapter.note ? `<div style="padding:0 20px 8px 20px; font-size:11px; color:rgba(255,255,255,0.3); font-style:italic;">${chapter.note}</div>` : ''}
            <div class="chapter-group__videos">
                ${chapter.videos.map(video => `
                    <div class="video-item ${watchedVideos.has(video.id) ? 'watched' : ''}"
                         data-video-id="${video.id}"
                         onclick="playVideo('${video.id}')">
                        <div class="video-item__check">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        </div>
                        <svg class="video-item__play" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        <span class="video-item__title">${video.title}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ==========================================
// PLAY VIDEO
// ==========================================
window.playVideo = function(videoId) {
    const video = allVideos.find(v => v.id === videoId);
    if (!video) return;

    currentVideoId = videoId;

    // Save last watched
    if (currentUser) saveLastWatched(currentUser.uid, courseId, videoId);

    // Update iframe
    const placeholder = document.getElementById('videoPlaceholder');
    const container = document.getElementById('videoContainer');
    const iframe = document.getElementById('videoIframe');

    if (video.ytId && !video.ytId.startsWith('PLACEHOLDER')) {
        placeholder.style.display = 'none';
        container.style.display = 'block';
        iframe.src = `https://www.youtube.com/embed/${video.ytId}?rel=0&modestbranding=1&autoplay=1`;
    } else {
        // Placeholder video — show message
        placeholder.style.display = 'flex';
        container.style.display = 'none';
        document.querySelector('.placeholder-text').textContent = 'Video coming soon — check back later!';
    }

    // Update video info
    document.getElementById('playerVideoInfo').style.display = 'block';
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoChapter').textContent = video.chapterTitle;
    document.getElementById('mobileVideoTitle').textContent = video.title;

    // Update active state in sidebar
    document.querySelectorAll('.video-item').forEach(el => el.classList.remove('active'));
    const activeItem = document.querySelector(`[data-video-id="${videoId}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
        // Open its chapter
        const chapterGroup = activeItem.closest('.chapter-group');
        if (chapterGroup && !chapterGroup.classList.contains('open')) {
            chapterGroup.classList.add('open');
        }
        // Scroll into view (desktop)
        if (window.innerWidth > 768) {
            activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    // Update mark complete button
    updateMarkBtn(videoId);

    // Prev/Next buttons
    updateNavButtons();

    // Close mobile sidebar
    if (window.innerWidth <= 768) closeMobileSidebar();
};

// ==========================================
// MARK CURRENT VIDEO COMPLETE
// ==========================================
window.markCurrentWatched = function() {
    if (currentVideoId) markVideoWatched(currentVideoId);
};

function updateMarkBtn(videoId) {
    const btn = document.getElementById('markWatchedBtn');
    if (!btn) return;
    if (watchedVideos.has(videoId)) {
        btn.classList.add('completed');
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Completed`;
    } else {
        btn.classList.remove('completed');
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Mark Complete`;
    }
}

// ==========================================
// PREV / NEXT
// ==========================================
window.playNextVideo = function() {
    const idx = allVideos.findIndex(v => v.id === currentVideoId);
    if (idx < allVideos.length - 1) playVideo(allVideos[idx + 1].id);
};

window.playPrevVideo = function() {
    const idx = allVideos.findIndex(v => v.id === currentVideoId);
    if (idx > 0) playVideo(allVideos[idx - 1].id);
};

function updateNavButtons() {
    const idx = allVideos.findIndex(v => v.id === currentVideoId);
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    if (prevBtn) prevBtn.style.display = idx > 0 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = idx < allVideos.length - 1 ? 'flex' : 'none';
}

// ==========================================
// CHAPTER ACCORDION
// ==========================================
window.toggleChapter = function(chapterId) {
    const group = document.getElementById(`chapter-${chapterId}`);
    if (group) group.classList.toggle('open');
};

// ==========================================
// MOBILE SIDEBAR TOGGLE
// ==========================================
window.toggleMobileSidebar = function() {
    const sidebar = document.getElementById('playerSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
};

function closeMobileSidebar() {
    const sidebar = document.getElementById('playerSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ==========================================
// UPDATE NAVBAR USER
// ==========================================
function updateNavUser(user) {
    const navUser = document.getElementById('navUser');
    const navPhoto = document.getElementById('navUserPhoto');
    const navName = document.getElementById('navUserName');
    if (navUser) navUser.style.display = 'flex';
    if (navPhoto) navPhoto.src = user.photoURL || '';
    if (navName) navName.textContent = user.displayName?.split(' ')[0] || '';
}

// ==========================================
// ACCESS DENIED
// ==========================================
function showAccessDenied() {
    document.getElementById('accessDenied').style.display = 'flex';
}

// ==========================================
// onVideoComplete — PLACEHOLDER
// Future: notes, next video auto-play, etc.
// ==========================================
function onVideoComplete(videoId) {
    // Trigger karein baad mein
    // Abhi kuch nahi
}

console.log('✅ Course Player loaded | Course:', courseId);
