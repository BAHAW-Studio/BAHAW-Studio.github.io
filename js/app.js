/* ================================
   BAHAW STUDIO — App JS (Utilities)
   ================================ */

// --- FORMAT PRICE ---
function formatPrice(amount) {
    return '₱' + Number(amount).toFixed(2);
}

// --- SHOW TOAST ---
function showCartToast(msg) {
    var existing = document.querySelector('.toast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(function() { toast.classList.add('show'); }, 10);

    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { toast.remove(); }, 400);
    }, 2500);
}

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
var _scrollObserver = null;
function initScrollAnimations() {
    if (_scrollObserver) _scrollObserver.disconnect();
    _scrollObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                _scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in:not(.visible)').forEach(function(el) {
        _scrollObserver.observe(el);
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

    // Update cart badge if cart system is loaded
    if (typeof updateCartBadge === 'function') updateCartBadge();

    // Delay scroll animations slightly to let DOM settle
    setTimeout(initScrollAnimations, 100);
});
