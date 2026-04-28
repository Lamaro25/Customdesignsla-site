const app = document.getElementById('cdla-studio-app');

const STATUS_FILTERS = [
  'All Orders', 'New', 'Reviewing', 'Designing', 'Preview Sent', 'Approved', 'Invoice Sent', 'Paid', 'Printing', 'Casting', 'Finishing', 'Ready', 'Shipped', 'Delivered', 'Cancelled'
];

const state = {
  authenticated: false,
  loading: true,
  orders: [],
  summary: {},
  statuses: [],
  filter: 'All Orders',
  query: '',
  selectedOrder: null,
  mobileNavOpen: false,
  saveStatusState: { type: '', message: '' }
};

init();

async function init() {
  await checkAuth();
  render();
  if (state.authenticated) {
    await loadOrders();
    render();
  }
}

async function checkAuth() {
  try {
    const res = await fetch('/.netlify/functions/cdla-studio-auth');
    const data = await res.json();
    state.authenticated = Boolean(data.authenticated);
  } catch {
    state.authenticated = false;
  }
  state.loading = false;
}

async function login(username, password) {
  const res = await fetch('/.netlify/functions/cdla-studio-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'login', username, password })
  });
  if (!res.ok) throw new Error('Invalid username or password.');
  state.authenticated = true;
  await loadOrders();
}

async function logout() {
  await fetch('/.netlify/functions/cdla-studio-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'logout' })
  });
  state.authenticated = false;
  state.orders = [];
  state.selectedOrder = null;
  render();
}

async function loadOrders() {
  state.loading = true;
  render();
  const res = await fetch('/.netlify/functions/cdla-studio-orders');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unable to load orders');
  state.orders = data.orders || [];
  state.summary = data.summary || {};
  state.statuses = data.statuses || [];
  state.loading = false;
}

function getFilteredOrders() {
  const q = state.query.trim().toLowerCase();
  return state.orders.filter((order) => {
    const statusMatch = state.filter === 'All Orders' || order.status === state.filter;

    const text = [
      order.customerName,
      order.email,
      order.phone,
      order.productName,
      order.sku,
      order.status
    ].join(' ').toLowerCase();

    const queryMatch = !q || text.includes(q);
    return statusMatch && queryMatch;
  });
}

function render() {
  if (state.loading && !state.authenticated) {
    app.innerHTML = '<div class="center-card">Loading CDLA Studio…</div>';
    return;
  }

  if (!state.authenticated) {
    renderLogin();
    return;
  }

  const filtered = getFilteredOrders();
  const emptyMessage = state.filter !== 'All Orders' && !state.query.trim()
    ? 'No orders found for this status.'
    : 'No orders found.';

  app.innerHTML = `
    <div class="studio-shell ${state.mobileNavOpen ? 'nav-open' : ''}">
      <button class="sidebar-backdrop" id="sidebar-backdrop" aria-label="Close menu"></button>
      <aside class="sidebar">
        <div class="sidebar-head">
          <span>Menu</span>
          <button class="btn ghost small" id="sidebar-close" aria-label="Close menu">✕</button>
        </div>
        <div class="brand">
          <h1>CDLA</h1>
          <p>Custom Design’s LA</p>
        </div>
        <nav class="filters">
          ${STATUS_FILTERS.map((filter) => `
            <button class="filter-btn ${state.filter === filter ? 'active' : ''}" data-filter="${filter}">${filter}</button>
          `).join('')}
        </nav>
        <button class="btn ghost" id="logout-btn">Logout</button>
      </aside>

      <section class="main">
        <header class="topbar">
          <div class="topbar-head">
            <button class="btn menu" id="menu-toggle" aria-label="Open menu">☰</button>
            <h2>CDLA Studio</h2>
            <p>Orders</p>
          </div>
        </header>

        <section class="cards">
          ${summaryCard('Total Orders', state.summary.totalOrders || 0)}
          ${summaryCard('New / Pending', state.summary.newPending || 0)}
          ${summaryCard('In Progress', state.summary.inProgress || 0)}
          ${summaryCard('Preview Sent', state.summary.previewSent || 0)}
          ${summaryCard('Paid / Ready', state.summary.paidReady || 0)}
          ${summaryCard('Estimated Revenue', formatMoney(state.summary.estimatedRevenue || 0))}
        </section>

        <section class="table-wrap">
          <div class="table-controls">
            <input id="search" placeholder="Search by customer, email, phone, product, SKU, or status" value="${escapeHtml(state.query)}" />
          </div>
          <div class="order-cards">
            ${filtered.map((order) => mobileCardHtml(order)).join('') || `<article class="order-card empty">${emptyMessage}</article>`}
          </div>
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Customer</th><th>Product</th><th>Customization</th><th>Image</th><th>Status</th><th>Est. Total</th><th>Submitted</th><th></th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map((order) => rowHtml(order)).join('') || `<tr><td colspan="9" class="empty">${emptyMessage}</td></tr>`}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>

    ${state.selectedOrder ? detailModal(state.selectedOrder) : ''}
  `;

  bindDashboardEvents();
}

function renderLogin() {
  app.innerHTML = `
    <section class="login-shell">
      <form id="login-form" class="login-card">
        <h1>CDLA Studio</h1>
        <p>Custom Design’s LA Internal Dashboard</p>
        <label>Username<input name="username" required autocomplete="username" /></label>
        <label>Password<input type="password" name="password" required autocomplete="current-password" /></label>
        <p id="login-error" class="error"></p>
        <button class="btn" type="submit">Login</button>
      </form>
    </section>
  `;

  const form = document.getElementById('login-form');
  const error = document.getElementById('login-error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    error.textContent = '';
    const formData = new FormData(form);
    try {
      await login(formData.get('username'), formData.get('password'));
      render();
    } catch (err) {
      error.textContent = err.message;
    }
  });
}

function bindDashboardEvents() {
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('menu-toggle')?.addEventListener('click', () => {
    state.mobileNavOpen = !state.mobileNavOpen;
    render();
  });
  document.getElementById('sidebar-close')?.addEventListener('click', () => {
    state.mobileNavOpen = false;
    render();
  });
  document.getElementById('sidebar-backdrop')?.addEventListener('click', () => {
    state.mobileNavOpen = false;
    render();
  });

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.filter = btn.dataset.filter;
      state.mobileNavOpen = false;
      render();
    });
  });

  document.getElementById('search')?.addEventListener('input', (e) => {
    state.query = e.target.value;
    render();
  });

  document.querySelectorAll('[data-view-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.viewId);
      state.selectedOrder = state.orders.find((o) => o.id === id) || null;
      state.saveStatusState = { type: '', message: '' };
      render();
    });
  });

  document.getElementById('modal-close')?.addEventListener('click', closeDetailModal);
  document.getElementById('modal-back')?.addEventListener('click', closeDetailModal);
  document.getElementById('modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id !== 'modal-backdrop') return;
    closeDetailModal();
  });

  document.getElementById('save-status')?.addEventListener('click', async () => {
    const saveButton = document.getElementById('save-status');
    const status = document.getElementById('status-select')?.value;
    const notes = document.getElementById('admin-notes')?.value || '';
    const order = state.selectedOrder;
    if (!order || !status) return;

    saveButton.disabled = true;
    saveButton.textContent = 'Saving…';

    try {
      const res = await fetch('/.netlify/functions/cdla-studio-update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowNumber: order.id, status, adminNotes: notes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to save status.');

      state.orders = state.orders.map((existingOrder) => {
        if (existingOrder.id !== order.id) return existingOrder;
        return { ...existingOrder, status, adminNotes: notes };
      });
      state.selectedOrder = state.orders.find((o) => o.id === order.id) || null;
      state.saveStatusState = { type: 'success', message: 'Status updated.' };
      render();

      await loadOrders();
      state.selectedOrder = state.orders.find((o) => o.id === order.id) || state.selectedOrder;
      render();
    } catch (error) {
      state.saveStatusState = { type: 'error', message: error.message || 'Unable to save status.' };
      render();
    }
  });
}

function closeDetailModal() {
  state.selectedOrder = null;
  state.saveStatusState = { type: '', message: '' };
  render();
}

function isCloudinaryImageUrl(value) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return /^https?:$/.test(parsed.protocol) && parsed.hostname.endsWith('res.cloudinary.com');
  } catch {
    return false;
  }
}

function getUploadedImageMarkup(order) {
  if (!isCloudinaryImageUrl(order.uploadedImageUrl)) {
    return '<span class="muted">No image uploaded</span>';
  }
  return `
    <img class="thumb" src="${escapeAttr(order.uploadedImageUrl)}" alt="Uploaded" />
    <a class="image-link" href="${escapeAttr(order.uploadedImageUrl)}" target="_blank" rel="noopener noreferrer">Open full image</a>
  `;
}

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

function rowHtml(order) {
  const customSummary = [order.insideText, order.outsideText, order.symbols].filter(Boolean).join(' • ') || '—';
  return `
    <tr>
      <td>#${order.id}</td>
      <td><strong>${escapeHtml(order.customerName || '—')}</strong><br><small>${escapeHtml(order.email || '')}</small></td>
      <td>${escapeHtml(order.productName || '—')}<br><small>${escapeHtml(order.sku || '')}</small></td>
      <td>${escapeHtml(customSummary)}</td>
      <td>${getUploadedImageMarkup(order)}</td>
      <td><span class="chip">${escapeHtml(order.status)}</span></td>
      <td>${escapeHtml(order.estimatedTotal || '—')}</td>
      <td>${escapeHtml(formatDateTime(order.submittedAt))}</td>
      <td><button class="btn small" data-view-id="${order.id}">View</button></td>
    </tr>
  `;
}

function detailModal(order) {
  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <section class="modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
        <div class="modal-head">
          <button id="modal-back" class="btn ghost modal-back-btn">Back to Orders</button>
          <button id="modal-close" class="modal-close-btn" aria-label="Close order details">✕</button>
        </div>
        <h3 id="order-detail-title">Order #${order.id}</h3>
        <p class="muted">Submitted: ${escapeHtml(formatDateTime(order.submittedAt))}</p>

        <div class="detail-grid">
          <article>
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> ${escapeHtml(order.customerName || '—')}</p>
            <p><strong>Email:</strong> ${escapeHtml(order.email || '—')}</p>
            <p><strong>Phone:</strong> ${escapeHtml(order.phone || '—')}</p>
            <p><strong>Address:</strong> ${escapeHtml(order.address || '—')}</p>
          </article>
          <article>
            <h4>Product Information</h4>
            <p><strong>Product:</strong> ${escapeHtml(order.productName || '—')}</p>
            <p><strong>SKU:</strong> ${escapeHtml(order.sku || '—')}</p>
            <p><strong>Size:</strong> ${escapeHtml(order.ringSize || '—')}</p>
            <p><strong>Estimated Total:</strong> ${escapeHtml(order.estimatedTotal || '—')}</p>
          </article>
          <article>
            <h4>Customization</h4>
            <p><strong>Inside text:</strong> ${escapeHtml(order.insideText || '—')}</p>
            <p><strong>Outside text:</strong> ${escapeHtml(order.outsideText || '—')}</p>
            <p><strong>Symbols:</strong> ${escapeHtml(order.symbols || '—')}</p>
            <p><strong>Customer notes:</strong> ${escapeHtml(order.customerNotes || '—')}</p>
          </article>
          <article>
            <h4>Uploaded Image</h4>
            ${isCloudinaryImageUrl(order.uploadedImageUrl)
              ? `<img class="detail-image" src="${escapeAttr(order.uploadedImageUrl)}" alt="Uploaded by customer" /><p><a href="${escapeAttr(order.uploadedImageUrl)}" target="_blank" rel="noopener noreferrer">Open full image</a></p><p class="muted">${escapeHtml(order.uploadedImageFilename || '')}</p>`
              : '<p>No image uploaded</p>'}
          </article>
        </div>

        <div class="admin-controls">
          <h4>Admin Controls</h4>
          <label>Status
            <select id="status-select">
              ${state.statuses.map((s) => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </label>
          <label>Internal admin notes (optional)
            <textarea id="admin-notes" placeholder="Add an internal note for this order">${escapeHtml(order.adminNotes || '')}</textarea>
          </label>
          <button class="btn" id="save-status">Save status</button>
          <p class="${state.saveStatusState.type === 'error' ? 'error' : 'success'} status-feedback">${escapeHtml(state.saveStatusState.message || '')}</p>
        </div>
      </section>
    </div>
  `;
}

function mobileCardHtml(order) {
  return `
    <article class="order-card">
      <div class="order-card-head">
        <h4>Order #${order.id}</h4>
        <span class="chip">${escapeHtml(order.status || '—')}</span>
      </div>
      <p><strong>Customer:</strong> ${escapeHtml(order.customerName || '—')}</p>
      <p><strong>Email:</strong> ${escapeHtml(order.email || '—')}</p>
      <p><strong>Phone:</strong> ${escapeHtml(order.phone || '—')}</p>
      <p><strong>Product:</strong> ${escapeHtml(order.productName || '—')}</p>
      <p><strong>Estimated total:</strong> ${escapeHtml(order.estimatedTotal || '—')}</p>
      <p><strong>Date submitted:</strong> ${escapeHtml(formatDateTime(order.submittedAt))}</p>
      <div class="order-card-image">
        ${getUploadedImageMarkup(order)}
      </div>
      <button class="btn small" data-view-id="${order.id}">View</button>
    </article>
  `;
}

function summaryCard(label, value) {
  return `<article class="card"><h3>${label}</h3><p>${value}</p></article>`;
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}
