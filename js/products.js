/* ================================
   BAHAW STUDIO — Product Rendering
   ================================ */

// --- RENDER PRODUCT CARD (with color dots) ---
function renderProductCard(product) {
    var photoUrl = product.photo_url || '';
    var etsyUrl = product.etsy_url || 'https://www.etsy.com/shop/BahawStudio';

    var image = photoUrl
        ? '<img src="' + photoUrl + '" alt="' + product.name + '" loading="lazy">'
        : '<div class="placeholder-img"><span>Photo Coming Soon</span></div>';

    // Color dots
    var colorDots = '';
    if (product.colors && product.colors.length > 0) {
        colorDots = '<div class="product-card-colors">';
        for (var c = 0; c < product.colors.length; c++) {
            var border = product.colors[c].hex.toUpperCase() === '#FFFFFF' ? 'box-shadow: inset 0 0 0 1px #ccc;' : '';
            colorDots += '<span class="color-dot" style="background:' + product.colors[c].hex + ';' + border + '" title="' + product.colors[c].name + '"></span>';
        }
        colorDots += '</div>';
    }

    return '<a href="' + etsyUrl + '" target="_blank" rel="noopener" class="product-card fade-in">' +
        '<div class="product-card-img">' + image +
        '<div class="product-quick-add"><span class="btn btn-primary btn-sm btn-full">Shop on Etsy</span></div>' +
        '</div>' +
        '<div class="product-card-info">' +
        '<div class="product-card-name">' + product.name + '</div>' +
        '<div class="product-card-price"><span class="current">' + formatPrice(product.price) + '</span></div>' +
        colorDots +
        '</div></a>';
}

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

function renderFeaturedProducts() {
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

    grid.innerHTML = filtered.map(renderProductCard).join('');

    // Re-observe new fade-in elements
    setTimeout(initScrollAnimations, 50);
}

function initFilterBar() {
    var pills = document.querySelectorAll('#filterBar .filter-pill');
    pills.forEach(function(pill) {
        pill.addEventListener('click', function() {
            pills.forEach(function(p) { p.classList.remove('active'); });
            this.classList.add('active');
            currentFilter = this.getAttribute('data-category');
            renderFeaturedProducts();
        });
    });
}

// --- RENDER SHOP PRODUCTS ---
function renderShopProducts() {
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

    grid.innerHTML = products.map(renderProductCard).join('');

    setTimeout(initScrollAnimations, 50);
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

// --- INIT ON PAGE LOAD ---
document.addEventListener('DOMContentLoaded', function() {
    initFilterBar();
    renderFeaturedProducts();
    renderShopProducts();
    initShopFilters();
});
