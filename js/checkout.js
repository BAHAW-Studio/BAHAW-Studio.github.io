/* ================================
   BAHAW STUDIO — Checkout JS
   ================================ */

// --- RENDER ORDER SIDEBAR ---
function renderOrderSidebar() {
    var sidebar = document.getElementById('orderSidebar');
    if (!sidebar) return;

    var cart = getCart();

    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }

    var itemsHTML = '';
    for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var img = item.photo_url
            ? '<img src="' + item.photo_url + '" alt="' + item.name + '">'
            : '';
        itemsHTML +=
            '<div class="order-item">' +
                '<div class="order-item-img">' + img + '</div>' +
                '<div class="order-item-details">' +
                    '<div class="name">' + item.name + '</div>' +
                    '<div class="meta">' +
                        (item.color ? item.color : '') +
                        (item.color && item.size ? ' / ' : '') +
                        (item.size ? item.size : '') +
                        ' x ' + item.qty +
                    '</div>' +
                '</div>' +
                '<div class="order-item-price">' + formatPrice(item.price * item.qty) + '</div>' +
            '</div>';
    }

    var subtotal = getCartSubtotal();
    var shipping = getShipping();
    var total = getCartTotal();

    sidebar.innerHTML =
        '<h3>Order Summary</h3>' +
        itemsHTML +
        '<div class="cart-summary-row" style="margin-top: 16px;"><span>Subtotal</span><span>' + formatPrice(subtotal) + '</span></div>' +
        '<div class="cart-summary-row"><span>Shipping</span><span>' + (shipping === 0 ? 'FREE' : formatPrice(shipping)) + '</span></div>' +
        '<div class="cart-summary-row total"><span>Total</span><span>' + formatPrice(total) + '</span></div>';

    // Populate hidden fields
    var orderRef = generateOrderRef();
    var refField = document.getElementById('orderRefField');
    if (refField) refField.value = orderRef;

    var itemsField = document.getElementById('orderItemsField');
    if (itemsField) {
        var itemsSummary = cart.map(function(item) {
            return item.name + ' (' + (item.color || '') + ' / ' + (item.size || '') + ') x' + item.qty + ' = ' + formatPrice(item.price * item.qty);
        }).join('\n');
        itemsField.value = itemsSummary;
    }

    var totalField = document.getElementById('orderTotalField');
    if (totalField) totalField.value = formatPrice(total);
}

// --- VALIDATE FORM ---
function validateCheckoutForm() {
    var form = document.getElementById('checkoutForm');
    var required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'province', 'zip'];
    var valid = true;

    // Clear previous errors
    form.querySelectorAll('.form-group').forEach(function(g) {
        g.classList.remove('has-error');
    });
    form.querySelectorAll('input').forEach(function(inp) {
        inp.classList.remove('error');
    });

    for (var i = 0; i < required.length; i++) {
        var input = document.getElementById(required[i]);
        if (!input) continue;

        var val = input.value.trim();
        if (!val) {
            input.classList.add('error');
            input.parentElement.classList.add('has-error');
            valid = false;
        }

        // Email validation
        if (required[i] === 'email' && val) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(val)) {
                input.classList.add('error');
                input.parentElement.classList.add('has-error');
                valid = false;
            }
        }
    }

    return valid;
}

// --- SUBMIT ORDER ---
function submitOrder(e) {
    e.preventDefault();

    if (!validateCheckoutForm()) {
        showCartToast('Please fill in all required fields');
        return;
    }

    var btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.textContent = 'Placing Order...';

    var form = document.getElementById('checkoutForm');
    var formData = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.success) {
            showCheckoutSuccess();
        } else {
            btn.disabled = false;
            btn.textContent = 'Place Order';
            showCartToast('Something went wrong. Please try again.');
        }
    })
    .catch(function() {
        btn.disabled = false;
        btn.textContent = 'Place Order';
        showCartToast('Network error. Please try again.');
    });
}

// --- SHOW SUCCESS ---
function showCheckoutSuccess() {
    var orderRef = document.getElementById('orderRefField').value;
    var total = getCartTotal();

    var content = document.getElementById('checkoutContent');
    content.innerHTML =
        '<div class="checkout-success">' +
            '<div class="success-icon">&#10003;</div>' +
            '<h2>Order Placed!</h2>' +
            '<p>Your order <strong>' + orderRef + '</strong> has been submitted. Please complete payment below.</p>' +
            '<div class="gcash-box">' +
                '<h3>GCash Payment</h3>' +
                '<div class="gcash-detail"><span class="label">Send to</span><span class="value">0968 751 2330</span></div>' +
                '<div class="gcash-detail"><span class="label">Account Name</span><span class="value">CebuLandMarket</span></div>' +
                '<div class="gcash-detail"><span class="label">Amount</span><span class="value">' + formatPrice(total) + '</span></div>' +
                '<div class="gcash-detail"><span class="label">Reference</span><span class="value">' + orderRef + '</span></div>' +
                '<div class="gcash-note">After sending payment, please screenshot the GCash receipt and send it to us via Messenger or email at r.reafil2@gmail.com. Include your order reference: ' + orderRef + '</div>' +
            '</div>' +
            '<p>We\'ll confirm your payment and process your order within 24 hours.</p>' +
            '<a href="shop.html" class="btn btn-primary mt-24">Continue Shopping</a>' +
        '</div>';

    clearCart();
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', function() {
    renderOrderSidebar();

    var form = document.getElementById('checkoutForm');
    if (form) {
        form.addEventListener('submit', submitOrder);
    }
});
