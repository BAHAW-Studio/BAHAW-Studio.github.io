/* ================================
   BAHAW STUDIO — Cart System
   localStorage-based cart
   ================================ */

var CART_KEY = 'bahaw_cart';
var SHIPPING_FLAT = 150;
var FREE_SHIPPING_MIN = 3000;

// --- GET CART ---
function getCart() {
    try {
        var data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        return [];
    }
}

// --- UPDATE CART BADGE ---
function updateCartBadge() {
    var badge = document.querySelector('.cart-badge');
    if (!badge) return;
    var count = getCartCount();
    badge.textContent = count > 0 ? count : '';
    badge.style.display = count > 0 ? '' : 'none';
}

// --- SAVE CART ---
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

// --- ADD TO CART ---
function addToCart(id, color, size, qty) {
    var cart = getCart();
    qty = qty || 1;

    // Check if item with same id/color/size already in cart
    var existing = -1;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === id && cart[i].color === color && cart[i].size === size) {
            existing = i;
            break;
        }
    }

    if (existing >= 0) {
        cart[existing].qty += qty;
    } else {
        // Find product from data
        var product = null;
        if (typeof PRODUCTS_DATA !== 'undefined') {
            for (var j = 0; j < PRODUCTS_DATA.length; j++) {
                if (PRODUCTS_DATA[j].id === id) {
                    product = PRODUCTS_DATA[j];
                    break;
                }
            }
        }
        if (!product) return;

        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            color: color,
            size: size,
            qty: qty,
            photo_url: product.photo_url
        });
    }

    saveCart(cart);
    showCartToast('Added to cart!');
}

// --- REMOVE FROM CART ---
function removeFromCart(index) {
    var cart = getCart();
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart(cart);
    }
}

// --- UPDATE CART QUANTITY ---
function updateCartQuantity(index, qty) {
    var cart = getCart();
    if (index >= 0 && index < cart.length) {
        if (qty <= 0) {
            cart.splice(index, 1);
        } else {
            cart[index].qty = qty;
        }
        saveCart(cart);
    }
}

// --- GET CART COUNT ---
function getCartCount() {
    var cart = getCart();
    var count = 0;
    for (var i = 0; i < cart.length; i++) {
        count += cart[i].qty;
    }
    return count;
}

// --- GET SUBTOTAL ---
function getCartSubtotal() {
    var cart = getCart();
    var total = 0;
    for (var i = 0; i < cart.length; i++) {
        total += cart[i].price * cart[i].qty;
    }
    return total;
}

// --- GET SHIPPING ---
function getShipping() {
    var subtotal = getCartSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FLAT;
}

// --- GET CART TOTAL ---
function getCartTotal() {
    return getCartSubtotal() + getShipping();
}

// --- CLEAR CART ---
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
}

// showCartToast() moved to app.js (available on all pages)
