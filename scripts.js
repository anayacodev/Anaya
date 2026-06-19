const STORAGE_KEY = 'anayaCart';

function getCart() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => {
    el.textContent = count;
  });
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(entry => entry.slug === item.slug);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  saveCart(cart);
  updateCartCount();
}

function handleProductPage() {
  const productSection = document.querySelector('.product-detail');
  if (!productSection) return;

  const buyButton = document.getElementById('add-to-cart-btn');
  const quantityInput = document.getElementById('product-quantity');
  const message = document.getElementById('cart-message');

  if (!buyButton || !quantityInput || !message) return;

  buyButton.addEventListener('click', () => {
    const slug = buyButton.dataset.slug;
    const title = buyButton.dataset.title;
    const price = parseFloat(buyButton.dataset.price);
    const quantity = Math.max(1, Number(quantityInput.value));

    addToCart({ slug, title, price, quantity });
    message.textContent = `${quantity} ${title} added to cart.`;
    message.classList.add('message-visible');
    setTimeout(() => {
      message.classList.remove('message-visible');
    }, 2600);
  });
}

function renderCartTable() {
  const cartTable = document.getElementById('cart-table');
  const cartTotal = document.getElementById('cart-total');
  const emptyMessage = document.getElementById('cart-empty');
  const checkoutButton = document.getElementById('proceed-to-checkout');

  if (!cartTable || !cartTotal || !emptyMessage) return;

  const cart = getCart();
  cartTable.innerHTML = '';

  if (cart.length === 0) {
    emptyMessage.style.display = 'block';
    if (checkoutButton) {
      checkoutButton.setAttribute('disabled', 'disabled');
      checkoutButton.onclick = null;
    }
    cartTotal.textContent = formatCurrency(0);
    return;
  }

  emptyMessage.style.display = 'none';
  if (checkoutButton) {
    checkoutButton.removeAttribute('disabled');
    checkoutButton.onclick = () => {
      window.location.href = 'checkout.html';
    };
  }

  let total = 0;

  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-name">
        <strong>${item.title}</strong>
        <span>${formatCurrency(item.price)} each</span>
      </div>
      <div class="cart-actions">
        <input type="number" min="1" value="${item.quantity}" data-slug="${item.slug}" class="cart-qty" />
        <button type="button" class="button button-small remove-item" data-slug="${item.slug}">Remove</button>
      </div>
      <div class="cart-subtotal">${formatCurrency(subtotal)}</div>
    `;

    cartTable.appendChild(row);
  });

  cartTotal.textContent = formatCurrency(total);

  cartTable.querySelectorAll('.cart-qty').forEach(input => {
    input.addEventListener('change', () => {
      const slug = input.dataset.slug;
      const quantity = Math.max(1, Number(input.value));
      updateCartItem(slug, quantity);
    });
  });

  cartTable.querySelectorAll('.remove-item').forEach(button => {
    button.addEventListener('click', () => {
      removeCartItem(button.dataset.slug);
    });
  });
}

function updateCartItem(slug, quantity) {
  const cart = getCart();
  const item = cart.find(entry => entry.slug === slug);
  if (!item) return;
  item.quantity = quantity;
  saveCart(cart);
  renderCartTable();
  updateCartCount();
}

function removeCartItem(slug) {
  const cart = getCart().filter(entry => entry.slug !== slug);
  saveCart(cart);
  renderCartTable();
  updateCartCount();
}

function handleCartPage() {
  if (!document.getElementById('cart-page')) return;
  renderCartTable();
}

function handleCheckoutPage() {
  if (!document.getElementById('checkout-page')) return;
  const form = document.getElementById('checkout-form');
  const summary = document.getElementById('checkout-summary');
  const complete = document.getElementById('checkout-complete');
  const cart = getCart();

  if (!form || !summary || !complete) return;

  if (cart.length === 0) {
    summary.innerHTML = '<p>Your cart is empty. Please add items before checking out.</p>';
    form.style.display = 'none';
    return;
  }

  summary.innerHTML = `
    <p><strong>Order total:</strong> ${formatCurrency(cart.reduce((sum, item) => sum + item.price * item.quantity, 0))}</p>
    <ul>${cart.map(item => `<li>${item.quantity} × ${item.title}</li>`).join('')}</ul>
  `;

  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const pickup = form.elements.pickup.value;

    if (!name || !email || !pickup) return;

    complete.innerHTML = `
      <h3>Thanks for your order, ${name}!</h3>
      <p>We will email your pickup details to <strong>${email}</strong>.</p>
      <p>Your treats will be ready on <strong>${pickup}</strong>.</p>
    `;
    form.style.display = 'none';
    localStorage.removeItem(STORAGE_KEY);
    updateCartCount();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  handleProductPage();
  handleCartPage();
  handleCheckoutPage();
});
