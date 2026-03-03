/* ================================
   BAHAW STUDIO — App JS (Utilities)
   ================================ */

// --- FORMAT PRICE ---
function formatPrice(amount) {
    return '$' + Number(amount).toFixed(2);
}

// --- (Cart removed — purchases via Etsy) ---

// --- MOBILE NAV ---
function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function() {
        toggle.classList.toggle('active');
        links.classList.toggle('active');
    });

    links.querySelectorAll('a').forEach(function(link) {
        link.addEventListener('click', function() {
            toggle.classList.remove('active');
            links.classList.remove('active');
        });
    });
}

// --- NAV SCROLL ---
function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

// --- SCROLL ANIMATIONS ---
function initScrollAnimations() {
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(function(el) {
        observer.observe(el);
    });
}

// --- GET URL PARAM ---
function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// --- GENERATE ORDER REF ---
function generateOrderRef() {
    return 'BHW-' + Date.now().toString(36).toUpperCase();
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', function() {
    initMobileNav();
    initNavScroll();

    // Delay scroll animations slightly to let DOM settle
    setTimeout(initScrollAnimations, 100);
});
