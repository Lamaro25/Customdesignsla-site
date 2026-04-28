const app = document.getElementById('cdla-studio-app');

const STATUS_FILTERS = [
  'All Orders', 'New', 'Reviewing', 'Designing', 'Preview Sent', 'Approved', 'Paid', 'Printing', 'Casting', 'Ready', 'Shipped/Delivered', 'Cancelled'
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
  adminNotesDraft: ''
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
    const statusMatch = state.filter === 'All Orders'
      || order.status === state.filter
      || (state.filter === 'Shipped/Delivered' && (order.status === 'Shipped' || order.status === 'Delivered'));

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
  app.innerHTML = `
    <div class="studio-shell ${state.mobileNavOpen ? 'nav-open' : ''}">
      <aside class="sidebar">
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
          <button class="btn menu" id="menu-toggle">☰</button>
          <h2>CDLA Studio</h2>
          <p>Orders</p>
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
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Customer</th><th>Product</th><th>Customization</th><th>Image</th><th>Status</th><th>Est. Total</th><th>Submitted</th><th></th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map((order) => rowHtml(order)).join('') || '<tr><td colspan="9" class="empty">No orders found.</td></tr>'}
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
      state.adminNotesDraft = '';
      render();
    });
  });

  document.getElementById('modal-close')?.addEventListener('click', () => {
    state.selectedOrder = null;
    render();
  });

  document.getElementById('save-status')?.addEventListener('click', async () => {
    const status = document.getElementById('status-select').value;
    const notes = document.getElementById('admin-notes')?.value || '';
    const order = state.selectedOrder;
    if (!order) return;

    const res = await fetch('/.netlify/functions/cdla-studio-update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowNumber: order.id, status, adminNotes: notes })
    });
    if (!res.ok) {
      alert('Unable to save status.');
      return;
    }

    await loadOrders();
    state.selectedOrder = state.orders.find((o) => o.id === order.id) || null;
    render();
  });
}

function rowHtml(order) {
  const customSummary = [order.insideText, order.outsideText, order.symbols].filter(Boolean).join(' • ') || '—';
  return `
    <tr>
      <td>#${order.id}</td>
      <td><strong>${escapeHtml(order.customerName || '—')}</strong><br><small>${escapeHtml(order.email || '')}</small></td>
      <td>${escapeHtml(order.productName || '—')}<br><small>${escapeHtml(order.sku || '')}</small></td>
      <td>${escapeHtml(customSummary)}</td>
      <td>${order.uploadedImageUrl ? `<img class="thumb" src="${escapeAttr(order.uploadedImageUrl)}" alt="Uploaded" />` : '<span class="muted">No image</span>'}</td>
      <td><span class="chip">${escapeHtml(order.status)}</span></td>
      <td>${escapeHtml(order.estimatedTotal || '—')}</td>
      <td>${escapeHtml(order.submittedAt || '—')}</td>
      <td><button class="btn small" data-view-id="${order.id}">View</button></td>
    </tr>
  `;
}

function detailModal(order) {
  return `
    <div class="modal-backdrop">
      <section class="modal">
        <button id="modal-close" class="btn ghost">Close</button>
        <h3>Order #${order.id}</h3>

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
            ${order.uploadedImageUrl
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
            <textarea id="admin-notes" placeholder="Add an internal note for this order"></textarea>
          </label>
          <button class="btn" id="save-status">Save status</button>
        </div>
      </section>
    </div>
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
