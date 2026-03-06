/* ================================
   BAHAW STUDIO — Product Rendering
   ================================ */

// --- RENDER PRODUCT CARD (with color dots + design toggle) ---
function renderProductCard(product) {
    var photoUrl = product.photo_url || '';
    var etsyUrl = product.etsy_url || 'https://www.etsy.com/shop/BahawStudio';
    var hasDesignB = product.design_b && product.design_b.photo_url;

    var image = photoUrl
        ? '<img src="' + photoUrl + '" alt="' + product.name + '" loading="lazy" width="400" height="400" decoding="async">'
        : '<div class="placeholder-img"><span>Photo Coming Soon</span></div>';

    // Color dots — limit to 6 visible, show +N indicator for rest
    var colorDots = '';
    if (product.colors && product.colors.length > 0) {
        colorDots = '<div class="product-card-colors">';
        var maxDots = 6;
        var showCount = Math.min(product.colors.length, maxDots);
        for (var c = 0; c < showCount; c++) {
            var border = product.colors[c].hex.toUpperCase() === '#FFFFFF' ? 'box-shadow: inset 0 0 0 1px #ccc;' : '';
            colorDots += '<span class="color-dot" style="background:' + product.colors[c].hex + ';' + border + '" title="' + product.colors[c].name + '"></span>';
        }
        if (product.colors.length > maxDots) {
            colorDots += '<span class="color-dot-more">+' + (product.colors.length - maxDots) + '</span>';
        }
        colorDots += '</div>';
    }

    // Design A/B toggle
    var designToggle = '';
    if (hasDesignB) {
        var bPhoto = product.design_b.photo_url;
        var bEtsy = product.design_b.etsy_url || etsyUrl;
        designToggle = '<div class="design-toggle" data-a-photo="' + photoUrl + '" data-a-etsy="' + etsyUrl +
            '" data-b-photo="' + bPhoto + '" data-b-etsy="' + bEtsy + '">' +
            '<button type="button" class="design-btn active" data-design="a">Design A</button>' +
            '<button type="button" class="design-btn" data-design="b">Design B</button>' +
            '</div>';
    }

    var cardId = 'product-card-' + product.id;
    return '<div class="product-card fade-in" id="' + cardId + '">' +
        '<a href="' + etsyUrl + '" target="_blank" rel="noopener" class="product-card-link">' +
        '<div class="product-card-img">' + image +
        '<div class="product-quick-add"><span class="btn btn-primary btn-sm btn-full">Shop on Etsy</span></div>' +
        '</div>' +
        '</a>' +
        '<div class="product-card-info">' +
        designToggle +
        '<div class="product-card-name">' + product.name + '</div>' +
        '<div class="product-card-price"><span class="current">' + formatPrice(product.price) + '</span></div>' +
        colorDots +
        '</div></div>';
}

// --- DESIGN A/B TOGGLE (event delegation) ---
document.addEventListener('click', function(e) {
    var btn = e.target.closest('.design-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    var design = btn.getAttribute('data-design');
    var toggle = btn.parentElement;
    var card = toggle.closest('.product-card');
    if (!card) return;

    var link = card.querySelector('.product-card-link');
    var img = card.querySelector('.product-card-img img');

    // Update active button
    toggle.querySelectorAll('.design-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');

    // Switch photo and Etsy link
    var photo = design === 'b' ? toggle.getAttribute('data-b-photo') : toggle.getAttribute('data-a-photo');
    var etsy = design === 'b' ? toggle.getAttribute('data-b-etsy') : toggle.getAttribute('data-a-etsy');

    if (img) img.src = photo;
    if (link) link.href = etsy;
});

// --- GET PRODUCT BY ID ---
function getProductById(id) {
    if (typeof PRODUCTS_DATA === 'undefined') return null;
    for (var i = 0; i < PRODUCTS_DATA.length; i++) {
        if (PRODUCTS_DATA[i].id === id) return PRODUCTS_DATA[i];
    }
    return null;
}

// --- RENDER FEATURED PRODUCTS (homepage with filter) ---
var currentFilter = 'all';
var PRODUCTS_PER_PAGE = 12;
var productsShown = PRODUCTS_PER_PAGE;
var _renderRAF = null;

function renderFeaturedProducts(showAll) {
    // Debounce with requestAnimationFrame to prevent multiple rapid renders
    if (_renderRAF) cancelAnimationFrame(_renderRAF);
    _renderRAF = requestAnimationFrame(function() {
        _renderFeaturedProductsNow(showAll);
    });
}

function _renderFeaturedProductsNow(showAll) {
    var grid = document.getElementById('featuredGrid');
    if (!grid || typeof PRODUCTS_DATA === 'undefined') return;

    var active = PRODUCTS_DATA.filter(function(p) {
        return p.status === 'active';
    });

    // Update category counts (count total color variants)
    var counts = { all: 0, caps: 0, snapbacks: 0, beanies: 0, visors: 0, tshirts: 0, oversized: 0, kids: 0, youth: 0 };
    active.forEach(function(p) {
        var colorCount = (p.colors && p.colors.length) ? p.colors.length : 1;
        counts.all += colorCount;
        if (counts[p.category] !== undefined) counts[p.category] += colorCount;
    });
    Object.keys(counts).forEach(function(key) {
        var el = document.getElementById('count' + key.charAt(0).toUpperCase() + key.slice(1));
        if (el) el.textContent = counts[key];
    });

    // Filter
    var filtered = currentFilter === 'all' ? active : active.filter(function(p) {
        return p.category === currentFilter;
    });

    // Sort: group by category order
    var catOrder = { caps: 1, snapbacks: 2, beanies: 3, visors: 4, tshirts: 5, oversized: 6, kids: 7, youth: 8 };
    filtered.sort(function(a, b) {
        return (catOrder[a.category] || 99) - (catOrder[b.category] || 99);
    });

    // Limit initial render for performance
    var limit = showAll ? filtered.length : productsShown;
    var visible = filtered.slice(0, limit);

    // Build HTML in a document fragment to minimize reflows
    var html = visible.map(renderProductCard).join('');
    grid.style.willChange = 'contents';
    grid.innerHTML = html;

    // Clean up will-change after paint
    requestAnimationFrame(function() {
        grid.style.willChange = '';
    });

    // Show/hide "Show More" button
    var loadMoreWrap = document.getElementById('loadMoreWrap');
    if (!loadMoreWrap) {
        loadMoreWrap = document.createElement('div');
        loadMoreWrap.id = 'loadMoreWrap';
        loadMoreWrap.className = 'text-center';
        loadMoreWrap.style.marginTop = '24px';
        grid.parentNode.insertBefore(loadMoreWrap, grid.nextSibling);
    }
    if (filtered.length > limit) {
        loadMoreWrap.innerHTML = '<button class="btn btn-secondary" id="loadMoreBtn">Show More (' + (filtered.length - limit) + ' remaining)</button>';
        document.getElementById('loadMoreBtn').addEventListener('click', function() {
            productsShown += PRODUCTS_PER_PAGE;
            renderFeaturedProducts();
        });
    } else {
        loadMoreWrap.innerHTML = '';
    }

    // Re-observe ONLY new fade-in elements inside the grid
    observeNewFadeIns(grid);
}

function initFilterBar() {
    var pills = document.querySelectorAll('#filterBar .filter-pill');
    pills.forEach(function(pill) {
        pill.addEventListener('click', function() {
            pills.forEach(function(p) { p.classList.remove('active'); });
            this.classList.add('active');
            currentFilter = this.getAttribute('data-category');
            productsShown = PRODUCTS_PER_PAGE;
            renderFeaturedProducts();
        });
    });
}

// --- RENDER SHOP PRODUCTS ---
var _shopRenderRAF = null;

function renderShopProducts() {
    // Debounce with requestAnimationFrame
    if (_shopRenderRAF) cancelAnimationFrame(_shopRenderRAF);
    _shopRenderRAF = requestAnimationFrame(_renderShopProductsNow);
}

function _renderShopProductsNow() {
    var grid = document.getElementById('shopGrid');
    if (!grid || typeof PRODUCTS_DATA === 'undefined') return;

    var category = getParam('category') || 'all';
    var sortBy = document.getElementById('shopSort') ? document.getElementById('shopSort').value : 'default';

    // Set active filter pill
    var pills = document.querySelectorAll('.filter-pill');
    pills.forEach(function(pill) {
        pill.classList.toggle('active', pill.getAttribute('data-category') === category);
    });

    // Filter
    var products = PRODUCTS_DATA.filter(function(p) {
        if (p.status !== 'active') return false;
        if (category === 'all') return true;
        return p.category === category;
    });

    // Sort
    if (sortBy === 'price-low') {
        products.sort(function(a, b) { return a.price - b.price; });
    } else if (sortBy === 'price-high') {
        products.sort(function(a, b) { return b.price - a.price; });
    } else if (sortBy === 'newest') {
        products.sort(function(a, b) { return Number(b.id) - Number(a.id); });
    }

    // Update results count
    var resultsEl = document.getElementById('shopResults');
    if (resultsEl) {
        resultsEl.textContent = products.length + ' product' + (products.length !== 1 ? 's' : '');
    }

    if (products.length === 0) {
        grid.innerHTML = '<div class="no-products">No products found in this category.</div>';
        return;
    }

    grid.style.willChange = 'contents';
    grid.innerHTML = products.map(renderProductCard).join('');
    requestAnimationFrame(function() {
        grid.style.willChange = '';
    });

    // Observe only new fade-in elements in the grid
    observeNewFadeIns(grid);
}

// --- INIT SHOP FILTERS ---
function initShopFilters() {
    var pills = document.querySelectorAll('.filter-pill');
    pills.forEach(function(pill) {
        pill.addEventListener('click', function() {
            var cat = this.getAttribute('data-category');
            var url = new URL(window.location);
            if (cat === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', cat);
            }
            history.pushState({}, '', url);
            renderShopProducts();
        });
    });

    var sortSelect = document.getElementById('shopSort');
    if (sortSelect) {
        sortSelect.addEventListener('change', renderShopProducts);
    }
}

// --- PRODUCT DETAIL HELPERS ---
function selectSize(btn) {
    document.querySelectorAll('.size-btn').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
}

function selectColor(swatch) {
    document.querySelectorAll('.color-swatch').forEach(function(s) { s.classList.remove('active'); });
    swatch.classList.add('active');
    var name = swatch.getAttribute('data-color');
    var label = document.getElementById('selectedColorName');
    if (label) label.textContent = name;
}

function changeQty(delta) {
    var input = document.getElementById('qtyInput');
    if (!input) return;
    var val = parseInt(input.value) + delta;
    if (val < 1) val = 1;
    if (val > 10) val = 10;
    input.value = val;
}

function switchImage(thumb, src) {
    var mainImg = document.getElementById('mainImage');
    if (mainImg) {
        mainImg.innerHTML = '<img src="' + src + '" alt="Product photo">';
    }
    document.querySelectorAll('.product-thumb').forEach(function(t) { t.classList.remove('active'); });
    thumb.classList.add('active');
}

function toggleAccordion(header) {
    var item = header.parentElement;
    item.classList.toggle('open');
}

// --- OBSERVE FADE-INS WITHIN A CONTAINER (scoped, no global disconnect) ---
function observeNewFadeIns(container) {
    if (!container) return;
    // Use the global observer from app.js if available; otherwise init it
    if (typeof initScrollAnimations === 'function') {
        // Only observe new elements inside this container
        var els = container.querySelectorAll('.fade-in:not(.visible)');
        if (_scrollObserver) {
            els.forEach(function(el) { _scrollObserver.observe(el); });
        } else {
            // Fallback: init global observer then observe
            initScrollAnimations();
        }
    }
}

// --- INIT ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', function() {
    initFilterBar();

    // Render featured grid (homepage) — use requestIdleCallback if available for non-blocking render
    if (document.getElementById('featuredGrid')) {
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(function() { _renderFeaturedProductsNow(); });
        } else {
            _renderFeaturedProductsNow();
        }
    }

    // Render shop grid (shop page)
    if (document.getElementById('shopGrid')) {
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(function() { _renderShopProductsNow(); });
        } else {
            _renderShopProductsNow();
        }
    }

    initShopFilters();
});
