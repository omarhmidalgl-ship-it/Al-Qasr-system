'use strict';

const q = (s, r = document) => r.querySelector(s);
const qa = (s, r = document) => Array.from(r.querySelectorAll(s));
const fmt = n => 'E£ ' + Math.round(Number(n) || 0).toLocaleString('en-US');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nowLabel = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const KEY = 'qasr_state_v1';
const AUTH_KEY = 'qasr_auth_v1';

const OWNER = { email: 'admin@qasr.com', pass: 'changeme123' };

function isAuthed() {
  try { return localStorage.getItem(AUTH_KEY) === 'owner'; } catch (e) { return false; }
}
function showLogin() { q('#login').style.display = 'grid'; }
function hideLogin() { q('#login').style.display = 'none'; }

const CATS = ['Grill', 'Mains', 'Appetizers', 'Drinks', 'Desserts', 'Shisha'];
const STATIONS = ['Cold kitchen', 'Hot line', 'Grill', 'Beverage'];
const INV_CATS = ['Meat', 'Poultry', 'Fish', 'Produce', 'Dry goods', 'Dairy', 'Beverage', 'Other'];
const UNITS = ['kg', 'L', 'piece', 'bag', 'box', 'bunch', 'tray'];

const DEFAULT_MENU = [
  { id: 'm01', name: 'Mixed Grill Platter', cat: 'Grill', price: 520, avail: true },
  { id: 'm02', name: 'Lamb Kofta', cat: 'Grill', price: 320, avail: true },
  { id: 'm03', name: 'Shish Tawook', cat: 'Grill', price: 280, avail: true },
  { id: 'm04', name: 'Beef Kebab Halabi', cat: 'Grill', price: 420, avail: true },
  { id: 'm05', name: 'Grilled Quail', cat: 'Grill', price: 340, avail: false },
  { id: 'm06', name: 'Grilled Shrimp', cat: 'Grill', price: 480, avail: true },
  { id: 'm07', name: 'Fattah with Veal', cat: 'Mains', price: 310, avail: true },
  { id: 'm08', name: 'Molokhia with Chicken', cat: 'Mains', price: 260, avail: true },
  { id: 'm09', name: 'Sayadeya Fish', cat: 'Mains', price: 360, avail: true },
  { id: 'm10', name: 'Stuffed Vine Leaves', cat: 'Mains', price: 180, avail: true },
  { id: 'm11', name: 'Koshari Al-Qasr', cat: 'Mains', price: 140, avail: true },
  { id: 'm12', name: 'Macarona Bechamel', cat: 'Mains', price: 170, avail: true },
  { id: 'm13', name: 'Hummus with Meat', cat: 'Appetizers', price: 145, avail: true },
  { id: 'm14', name: 'Baba Ghanoush', cat: 'Appetizers', price: 90, avail: true },
  { id: 'm15', name: 'Tahini Salad', cat: 'Appetizers', price: 70, avail: true },
  { id: 'm16', name: 'Meat Sambousek', cat: 'Appetizers', price: 110, avail: true },
  { id: 'm17', name: 'Falafel Plate', cat: 'Appetizers', price: 80, avail: true },
  { id: 'm18', name: 'Fresh Mango Juice', cat: 'Drinks', price: 75, avail: true },
  { id: 'm19', name: 'Hibiscus Karkadeh', cat: 'Drinks', price: 45, avail: true },
  { id: 'm20', name: 'Mint Lemonade', cat: 'Drinks', price: 55, avail: true },
  { id: 'm21', name: 'Turkish Coffee', cat: 'Drinks', price: 40, avail: true },
  { id: 'm22', name: 'Egyptian Tea', cat: 'Drinks', price: 25, avail: true },
  { id: 'm23', name: 'Mineral Water', cat: 'Drinks', price: 15, avail: true },
  { id: 'm24', name: 'Om Ali', cat: 'Desserts', price: 120, avail: true },
  { id: 'm25', name: 'Kunafa with Cream', cat: 'Desserts', price: 130, avail: true },
  { id: 'm26', name: 'Basbousa', cat: 'Desserts', price: 70, avail: true },
  { id: 'm27', name: 'Baklava Mix', cat: 'Desserts', price: 110, avail: false },
  { id: 'm28', name: 'Rice Pudding', cat: 'Desserts', price: 65, avail: true },
  { id: 'm29', name: 'Classic Moassel Shisha', cat: 'Shisha', price: 120, avail: true },
  { id: 'm30', name: 'Double Apple Shisha', cat: 'Shisha', price: 140, avail: true },
  { id: 'm31', name: 'Mint Fresh Shisha', cat: 'Shisha', price: 140, avail: true },
  { id: 'm32', name: 'Grape Berry Shisha', cat: 'Shisha', price: 160, avail: true },
  { id: 'm33', name: 'Lemon Mint Shisha', cat: 'Shisha', price: 150, avail: true }
];
let MENU = DEFAULT_MENU.slice();

const DEFAULT_INV = [
  { id: 'i01', name: 'Beef Tenderloin', cat: 'Meat', qty: 12, unit: 'kg', par: 20 },
  { id: 'i02', name: 'Chicken Breast', cat: 'Poultry', qty: 26, unit: 'kg', par: 20 },
  { id: 'i03', name: 'Lamb Meat', cat: 'Meat', qty: 4, unit: 'kg', par: 10 },
  { id: 'i04', name: 'Sea Bass', cat: 'Fish', qty: 6, unit: 'kg', par: 5 },
  { id: 'i05', name: 'Tomatoes', cat: 'Produce', qty: 18, unit: 'kg', par: 15 },
  { id: 'i06', name: 'Lemons', cat: 'Produce', qty: 2, unit: 'kg', par: 8 },
  { id: 'i07', name: 'Potatoes', cat: 'Produce', qty: 30, unit: 'kg', par: 20 },
  { id: 'i08', name: 'Egyptian Rice', cat: 'Dry goods', qty: 60, unit: 'kg', par: 30 },
  { id: 'i09', name: 'Flour', cat: 'Dry goods', qty: 25, unit: 'kg', par: 15 },
  { id: 'i10', name: 'Molokhia Leaves', cat: 'Produce', qty: 3, unit: 'kg', par: 6 },
  { id: 'i11', name: 'Full-cream Milk', cat: 'Dairy', qty: 14, unit: 'L', par: 12 },
  { id: 'i12', name: 'Cooking Cream', cat: 'Dairy', qty: 2, unit: 'L', par: 6 },
  { id: 'i13', name: 'Charcoal', cat: 'Other', qty: 5, unit: 'bag', par: 6 },
  { id: 'i14', name: 'Shisha Tobacco', cat: 'Other', qty: 9, unit: 'box', par: 4 },
  { id: 'i15', name: 'Hibiscus Flowers', cat: 'Beverage', qty: 2, unit: 'kg', par: 3 },
  { id: 'i16', name: 'Fresh Mint', cat: 'Produce', qty: 0, unit: 'bunch', par: 4 }
];
let INV = DEFAULT_INV.slice();

const DEFAULT_PREP = [
  { id: 'p01', task: 'Chop onions — 5 kg', station: 'Cold kitchen', done: false },
  { id: 'p02', task: 'Wash & cut greens — 10 trays', station: 'Cold kitchen', done: true },
  { id: 'p03', task: 'Portion tahini bowls ×30', station: 'Cold kitchen', done: false },
  { id: 'p04', task: 'Cook rice — 8 kg', station: 'Hot line', done: false },
  { id: 'p05', task: 'Prepare veal broth — 6 L', station: 'Hot line', done: true },
  { id: 'p06', task: 'Marinate kofta — 4 kg', station: 'Grill', done: false },
  { id: 'p07', task: 'Skewer kebab — 40 pieces', station: 'Grill', done: true },
  { id: 'p08', task: 'Brew hibiscus — 3 L', station: 'Beverage', done: false },
  { id: 'p09', task: 'Squeeze lemons — 2 kg', station: 'Beverage', done: false }
];
let PREP = DEFAULT_PREP.slice();

let settings = { name: 'Al-Qasr Dahab', phone: '+20 100 555 1234', address: '12 Sharia El Nil, Zamalek, Cairo', vat: 14, service: 12, tables: 25 };

let orders = [
  { no: 1042, type: 'Dine-in', table: '8', items: 3, total: 1265, status: 'Completed', time: '12:42 PM', method: 'Card' },
  { no: 1041, type: 'Dine-in', table: '3', items: 5, total: 2340, status: 'Preparing', time: '12:31 PM' },
  { no: 1040, type: 'Delivery', table: null, items: 3, total: 890, status: 'Ready', time: '12:18 PM', method: 'Wallet' },
  { no: 1039, type: 'Dine-in', table: '12', items: 2, total: 640, status: 'Completed', time: '12:04 PM', method: 'Cash' }
];

let TICKETS = [
  { id: 'T-201', source: 'Table 03', station: 'kitchen', mins: 4, status: 'new', items: [{ n: 'Lamb Kofta', q: 2 }, { n: 'Fattah with Veal', q: 1 }, { n: 'Tahini Salad', q: 1 }] },
  { id: 'T-202', source: 'Table 08', station: 'kitchen', mins: 9, status: 'preparing', items: [{ n: 'Mixed Grill Platter', q: 1 }, { n: 'Shish Tawook', q: 2 }] },
  { id: 'T-203', source: 'Delivery #1040', station: 'kitchen', mins: 12, status: 'ready', items: [{ n: 'Sayadeya Fish', q: 1 }, { n: 'Egyptian Rice', q: 2 }] },
  { id: 'T-204', source: 'Table 14', station: 'bar', mins: 3, status: 'new', items: [{ n: 'Mint Lemonade', q: 3 }, { n: 'Hibiscus Karkadeh', q: 2 }] },
  { id: 'T-205', source: 'Table 05', station: 'bar', mins: 7, status: 'preparing', items: [{ n: 'Turkish Coffee', q: 2 }, { n: 'Om Ali', q: 1 }] },
  { id: 'T-206', source: 'Terrace', station: 'shisha', mins: 2, status: 'new', items: [{ n: 'Double Apple Shisha', q: 1 }, { n: 'Mint Fresh Shisha', q: 1 }] },
  { id: 'T-207', source: 'Table 02', station: 'shisha', mins: 15, status: 'ready', items: [{ n: 'Grape Berry Shisha', q: 1 }] }
];

let SHIFTS = [
  { id: 'SH-121', by: 'Omar Hamid', opened: '09:00 AM', float: 2000, cash: 18400, status: 'open' },
  { id: 'SH-120', by: 'Sara Adel', opened: '09:05 AM', closed: '05:32 PM', float: 2000, cash: 21350, counted: 21200, variance: -150, status: 'closed', day: 'Yesterday' },
  { id: 'SH-119', by: 'Mahmoud Reda', opened: '04:58 PM', closed: '01:10 AM', float: 2000, cash: 15980, counted: 15980, variance: 0, status: 'closed', day: 'Yesterday' },
  { id: 'SH-118', by: 'Sara Adel', opened: '09:02 AM', closed: '05:47 PM', float: 2000, cash: 19875, counted: 19960, variance: 85, status: 'closed', day: 'Fri 21 Aug' }
];
let SEQ = 1042;
let SEQ_SH = 121;

const state = { view: 'dashboard', cart: [], posType: 'Dine-in', posTable: '', posCat: 'All', posQ: '', menuCat: 'All', menuQ: '', invF: 'All', range: 'today' };

const RANGES = {
  today: {
    label: 'Today', chartTitle: 'Revenue — hourly flow',
    labels: ['10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'],
    values: [1800, 4200, 6100, 3300, 8200, 15400, 9650],
    rev: 48650, orders: 86, cat: 'Grill',
    mix: { Cash: 44, Card: 41, Wallet: 15 },
    top: [['Mixed Grill Platter', 6240], ['Shish Tawook', 3920], ['Om Ali', 2160], ['Mint Lemonade', 1540], ['Classic Moassel Shisha', 1320]]
  },
  week: {
    label: 'This week', chartTitle: 'Revenue — last 7 days',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [28400, 36100, 31500, 43800, 52400, 66200, 58650],
    rev: 298400, orders: 512, cat: 'Grill',
    mix: { Cash: 47, Card: 38, Wallet: 15 },
    top: [['Mixed Grill Platter', 34200], ['Shish Tawook', 21800], ['Fattah with Veal', 14300], ['Om Ali', 11250], ['Double Apple Shisha', 9800]]
  },
  month: {
    label: 'This month', chartTitle: 'Revenue — weekly totals',
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [278000, 312000, 296000, 362000],
    rev: 1248000, orders: 2140, cat: 'Grill',
    mix: { Cash: 49, Card: 37, Wallet: 14 },
    top: [['Mixed Grill Platter', 141000], ['Lamb Kofta', 88400], ['Shish Tawook', 76200], ['Om Ali', 48900], ['Grape Berry Shisha', 35200]]
  }
};

function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ menu: MENU, inventory: INV, prep: PREP, settings })); } catch (e) {}
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!d) return;
    if (Array.isArray(d.menu) && d.menu.length) MENU = d.menu;
    if (Array.isArray(d.inventory)) INV = d.inventory;
    if (Array.isArray(d.prep)) PREP = d.prep;
    if (d.settings) settings = Object.assign(settings, d.settings);
  } catch (e) {}
}

const byId = id => MENU.find(m => m.id === id);
const currentOpen = () => SHIFTS.find(s => s.status === 'open');
const invStatus = i => (i.qty <= 0 ? 'Out' : i.qty <= i.par ? 'Low' : 'In');
const cartCount = () => state.cart.reduce((a, c) => a + c.qty, 0);

function cartTotals() {
  const sub = state.cart.reduce((a, c) => { const m = byId(c.id); return a + (m ? m.price * c.qty : 0); }, 0);
  const svc = sub * (settings.service / 100);
  const vat = (sub + svc) * (settings.vat / 100);
  return { sub, svc, vat, total: sub + svc + vat };
}

function toast(msg) {
  const el = q('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => el.classList.remove('show'), 2400);
}

function openModal(html) {
  q('#modal').innerHTML = html;
  q('#backdrop').classList.add('open');
  const first = q('#modal input:not([type=hidden]), #modal select');
  if (first) first.focus();
}
function closeModal() { q('#backdrop').classList.remove('open'); }

function applySettings() {
  const b = q('#brand-name');
  if (b) b.textContent = settings.name;
  document.title = settings.name + ' — POS & Inventory';
}

function go(view) {
  closeModal();
  state.view = view;
  qa('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  render();
  window.scrollTo({ top: 0 });
}

function render() {
  const v = VIEWS[state.view];
  q('#page-title').textContent = v.title;
  q('#view').innerHTML = v.render();
}

function statCard(label, icon, val, trendTxt, vs, up) {
  return `<div class="stat"><div class="stat-head"><span>${label}</span><span class="stat-icon">${icon}</span></div><strong>${val}</strong><div class="trend${up ? '' : ' down'}">${trendTxt} <span>${vs}</span></div></div>`;
}

function orderRow(o) {
  const cls = o.status === 'Completed' ? '' : o.status === 'Preparing' ? ' wait' : ' ready';
  const place = o.type === 'Delivery' ? 'Online · Delivery' : o.type === 'Takeaway' ? 'Takeaway' : `Table ${o.table} · Dine-in`;
  return `<div class="order"><div class="order-no">#${o.no}</div><div class="order-info"><b>${place}</b><small>${o.items} items · ${o.time}</small></div><div class="price">${fmt(o.total)}</div><span class="status${cls}">${o.status}</span></div>`;
}

function chart(labels, values, hotIdx) {
  const max = Math.max(...values, 1);
  return `<div class="chart">${labels.map((l, i) => `<div class="bar-group"><div class="bar${i === hotIdx ? ' hot' : ''}" style="height:${Math.max(8, Math.round(values[i] / max * 100))}%"></div><small>${l}</small></div>`).join('')}</div>`;
}

function mixBg(mix) {
  const colors = ['var(--gold)', '#b9d0bd', '#e48667'];
  let acc = 0;
  const parts = Object.values(mix).map((v, i) => { const s = `${colors[i]} ${acc}% ${acc + v}%`; acc += v; return s; });
  return `conic-gradient(${parts.join(',')})`;
}

function tablesOpts() {
  let o = '<option value="">Select table…</option>';
  for (let i = 1; i <= Number(settings.tables); i++) o += `<option value="${i}"${String(i) === String(state.posTable) ? ' selected' : ''}>Table ${i}</option>`;
  return o;
}

function posCards() {
  const qq = state.posQ.trim().toLowerCase();
  const list = MENU.filter(m => (state.posCat === 'All' || m.cat === state.posCat) && (!qq || m.name.toLowerCase().includes(qq)));
  if (!list.length) return '<div class="empty" style="grid-column:1/-1">No menu items match your search</div>';
  return list.map(m => `<button class="menu-card${m.avail ? '' : ' off'}" data-action="add" data-id="${m.id}"${m.avail ? '' : ' disabled title="Unavailable right now"'}><span class="mc-tag">${m.cat}</span><div class="mc-name">${esc(m.name)}</div><div class="mc-price">${fmt(m.price)}</div><span class="mc-plus">＋</span></button>`).join('');
}

function cartLines() {
  return state.cart.map(c => {
    const m = byId(c.id);
    if (!m) return '';
    return `<div class="ci"><div class="ci-info"><b>${esc(m.name)}</b><small>${fmt(m.price)} each</small></div><div class="stepper"><button data-action="dec" data-id="${c.id}">−</button><span>${c.qty}</span><button data-action="inc" data-id="${c.id}">＋</button></div><div class="ci-amt">${fmt(m.price * c.qty)}</div><button class="icon-x" data-action="rm" data-id="${c.id}" title="Remove">✕</button></div>`;
  }).join('');
}

function cartPanel() {
  const tt = cartTotals();
  const n = cartCount();
  const types = ['Dine-in', 'Takeaway', 'Delivery'];
  return `<aside class="panel pos-cart">
    <div class="panel-top"><div><h3>Current order</h3><p class="panel-sub">${n ? n + ' item' + (n > 1 ? 's' : '') + ' on this order' : 'Nothing added yet'}</p></div>${n ? '<button class="link-clear" data-action="clear-cart">Clear all</button>' : ''}</div>
    <div class="seg">${types.map(t => `<button class="${state.posType === t ? 'active' : ''}" data-action="type" data-type="${t}">${t}</button>`).join('')}</div>
    ${state.posType === 'Dine-in' ? `<label class="field" style="margin-top:12px"><span>Table number</span><select data-change="table">${tablesOpts()}</select></label>` : ''}
    <div class="cart-list">${n ? cartLines() : '<div class="empty">Tap items from the menu<br>to start building this order</div>'}</div>
    <div class="totals">
      <div class="tr"><span>Subtotal</span><b>${fmt(tt.sub)}</b></div>
      <div class="tr"><span>Service charge · ${settings.service}%</span><b>${fmt(tt.svc)}</b></div>
      <div class="tr"><span>VAT · ${settings.vat}%</span><b>${fmt(tt.vat)}</b></div>
      <div class="tr grand"><span>Total</span><span>${fmt(tt.total)}</span></div>
    </div>
    <div class="pay-row">
      <button class="pay" data-action="pay" data-method="Cash">Cash</button>
      <button class="pay" data-action="pay" data-method="Card">Card</button>
      <button class="pay" data-action="pay" data-method="Wallet">Wallet</button>
    </div>
  </aside>`;
}

function rDashboard() {
  const t = RANGES.today;
  const avg = Math.round(t.rev / t.orders);
  const hot = RANGES.week.values.indexOf(Math.max(...RANGES.week.values));
  return `
  <div class="welcome"><div><h2>Here's your restaurant at a glance</h2><p>Everything is running smoothly today.</p></div><button class="view-btn" data-goto="pos">＋ New order</button></div>
  <section class="grid">
    ${statCard("Today's revenue", 'E£', fmt(t.rev), '↗ 12.8%', 'vs. yesterday', true)}
    ${statCard('Orders today', '◴', t.orders, '↗ 8.4%', 'vs. yesterday', true)}
    ${statCard('Average order', '⌁', fmt(avg), '↗ 3.2%', 'vs. yesterday', true)}
    ${statCard('Table occupancy', '♧', '72%', '↘ 2.1%', 'vs. yesterday', false)}
  </section>
  <section class="content-grid">
    <div>
      <div class="panel"><div class="panel-top"><div><h3>Revenue overview</h3><p class="panel-sub">Your earnings over the past 7 days</p></div><button class="select" data-goto="reports">This week ⌄</button></div>
        ${chart(RANGES.week.labels, RANGES.week.values, hot)}
        <div class="legend"><span><i class="dot"></i>Best day</span><span><i class="dot green"></i>Previous days</span></div>
      </div>
      <div class="panel orders"><div class="panel-top"><div><h3>Recent orders</h3><p class="panel-sub">The latest activity from your floor</p></div><button class="select" data-goto="cashier">View all →</button></div>
        ${orders.slice(0, 4).map(orderRow).join('')}
      </div>
    </div>
    <div>
      <div class="panel"><div class="panel-top"><div><h3>Live floor</h3><p class="panel-sub">Current table occupancy</p></div><span class="status">Live now</span></div>
        <div class="occupancy"><div class="ring"><b>72%</b></div><div><b>18 of ${settings.tables} tables</b><p>You're having a busy service.<br>Keep the rhythm going.</p></div></div>
        <div class="mini-list"><div class="mini-row"><span>Available</span><b>${Math.max(settings.tables - 18, 0)} tables</b></div><div class="mini-row"><span>Guests seated</span><b>54 guests</b></div><div class="mini-row"><span>Avg. wait time</span><b>08 min</b></div></div>
      </div>
      <div class="panel" style="margin-top:17px"><div class="panel-top"><div><h3>Quick actions</h3><p class="panel-sub">Common tasks, one click away</p></div></div>
        <div class="quick">
          <button data-goto="pos"><span>▣</span>New order</button>
          <button data-goto="menu"><span>▤</span>Add menu item</button>
          <button data-goto="inventory"><span>◇</span>Check inventory</button>
          <button data-goto="reports"><span>▰</span>View reports</button>
        </div>
      </div>
    </div>
  </section>`;
}

function rPos() {
  const pills = ['All'].concat(CATS).map(c => `<button class="pill${state.posCat === c ? ' active' : ''}" data-action="cat" data-cat="${c}">${c}</button>`).join('');
  return `<section class="pos-grid">
    <section>
      <div class="toolbar"><div class="pills grow">${pills}</div><input class="input" style="min-width:180px" placeholder="Search the menu…" value="${esc(state.posQ)}" data-input="pos-q"></div>
      <div class="menu-cards" id="menu-cards">${posCards()}</div>
    </section>
    ${cartPanel()}
  </section>`;
}

const NEXT_LABEL = { new: 'Start preparing ▸', preparing: 'Mark ready ✓', ready: 'Serve & clear ✔' };

function ticketCard(t) {
  return `<div class="ticket"><div class="tk-head"><b>#${t.id} · ${esc(t.source)}</b><span class="mins">${t.mins} min</span></div><ul class="tk-items">${t.items.map(i => `<li>${esc(i.n)}<span>×${i.q}</span></li>`).join('')}</ul><button class="tk-btn" data-action="tadv" data-id="${t.id}">${NEXT_LABEL[t.status]}</button></div>`;
}

function rBoard(station, subtitle) {
  const cols = [['new', 'New tickets'], ['preparing', 'Preparing'], ['ready', 'Ready']];
  return `<p class="panel-sub" style="margin-bottom:4px">${subtitle}</p><div class="kanban">${cols.map(([k, label]) => {
    const list = TICKETS.filter(t => t.station === station && t.status === k);
    return `<div class="kcol"><div class="kcol-head"><b>${label}</b><span class="count">${list.length}</span></div>${list.length ? list.map(ticketCard).join('') : '<div class="empty">Nothing here<br>for the moment</div>'}</div>`;
  }).join('')}</div>`;
}

function rCashier() {
  const open = orders.filter(o => o.status !== 'Completed');
  const done = orders.filter(o => o.status === 'Completed');
  const collected = done.reduce((a, o) => a + o.total, 0);
  return `
  <section class="grid">
    ${statCard('Open tickets', '◉', open.length, '● ', 'live count', true)}
    ${statCard('Ready to serve', '♨', open.filter(o => o.status === 'Ready').length, '● ', 'waiting on floor', true)}
    ${statCard('Settled today', '◫', done.length, '● ', 'completed orders', true)}
    ${statCard('Collected today', 'E£', fmt(collected), '● ', 'cash · card · wallet', true)}
  </section>
  <div class="panel orders" style="margin-top:17px"><div class="panel-top"><div><h3>Tickets on the floor</h3><p class="panel-sub">Settle each order as it lands</p></div></div>
    ${open.length ? open.map(o => {
      const place = o.type === 'Delivery' ? 'Online · Delivery' : o.type === 'Takeaway' ? 'Takeaway' : `Table ${o.table} · Dine-in`;
      const act = o.status === 'Preparing'
        ? `<button class="pill" data-action="mark-ready" data-no="${o.no}">Mark ready</button>`
        : `<button class="btn" data-action="complete" data-no="${o.no}">Complete</button>`;
      return `<div class="order"><div class="order-no">#${o.no}</div><div class="order-info"><b>${place}</b><small>${o.items} items · ${o.time}${o.method ? ' · ' + o.method : ''}</small></div><div class="price">${fmt(o.total)}</div><span class="status${o.status === 'Preparing' ? ' wait' : ' ready'}">${o.status}</span>${act}</div>`;
    }).join('') : '<div class="empty" style="margin-top:16px">No open tickets —<br>the floor is all caught up</div>'}
  </div>`;
}

function menuFiltered() {
  const qq = state.menuQ.trim().toLowerCase();
  return MENU.filter(m => (state.menuCat === 'All' || m.cat === state.menuCat) && (!qq || m.name.toLowerCase().includes(qq)));
}

function menuRows() {
  const list = menuFiltered();
  if (!list.length) return '<tr><td colspan="5"><div class="empty">No items match — try a different search</div></td></tr>';
  return list.map(m => `<tr>
    <td><b class="name">${esc(m.name)}</b></td>
    <td><span class="mc-tag">${m.cat}</span></td>
    <td><b>${fmt(m.price)}</b></td>
    <td><label class="switch"><input type="checkbox" data-change="avail" data-id="${m.id}"${m.avail ? ' checked' : ''}><i></i></label></td>
    <td style="text-align:right;white-space:nowrap"><button class="icon-btn icon-sm" data-action="menu-edit" data-id="${m.id}" title="Edit">✎</button> <button class="icon-x" data-action="menu-del" data-id="${m.id}" title="Delete">✕</button></td>
  </tr>`).join('');
}

function rMenuItems() {
  return `<div class="toolbar">
      <input class="input grow" placeholder="Search menu items…" value="${esc(state.menuQ)}" data-input="menu-q">
      <select class="input" data-change="menu-cat">${['All'].concat(CATS).map(c => `<option${state.menuCat === c ? ' selected' : ''}>${c}</option>`).join('')}</select>
      <button class="btn" data-action="menu-add-open">＋ Add item</button>
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Available</th><th></th></tr></thead><tbody id="menu-tbody">${menuRows()}</tbody></table></div>`;
}

function invRows() {
  const list = INV.filter(i => state.invF === 'All' || invStatus(i) === state.invF);
  if (!list.length) return '<tr><td colspan="6"><div class="empty">Nothing in this bucket — good news, probably</div></td></tr>';
  return list.map(i => {
    const st = invStatus(i);
    const cls = st === 'Out' ? 'out' : st === 'Low' ? 'low' : 'ok';
    return `<tr><td><b class="name">${esc(i.name)}</b></td><td>${i.cat}</td><td><b>${i.qty} ${i.unit}</b></td><td>${i.par} ${i.unit}</td><td><span class="tag ${cls}">${st}</span></td><td style="text-align:right"><button class="pill" data-action="restock" data-id="${i.id}">Restock +${i.par}</button></td></tr>`;
  }).join('');
}

function rInventory() {
  const low = INV.filter(i => invStatus(i) === 'Low').length;
  const out = INV.filter(i => invStatus(i) === 'Out').length;
  const chips = [['All', INV.length], ['Low', low], ['Out', out]].map(([k, n]) => `<button class="chip${state.invF === k ? ' active' : ''}" data-action="chip" data-f="${k}">${k}<i>${n}</i></button>`).join('');
  return `<div class="toolbar">
      <div class="chips grow">${chips}</div>
      <button class="btn" data-action="stock-add-open">＋ Add stock item</button>
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Item</th><th>Category</th><th>On hand</th><th>Par level</th><th>Status</th><th></th></tr></thead><tbody id="inv-tbody">${invRows()}</tbody></table></div>`;
}

function prepProgress() {
  const total = PREP.length;
  const done = PREP.filter(p => p.done).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  return `<div style="display:flex;justify-content:space-between;font-size:12px"><b>${done} of ${total} tasks done</b><span style="color:var(--green);font-weight:800">${pct}%</span></div><div class="progress"><i style="width:${pct}%"></i></div>`;
}

function rPrep() {
  return `<div class="panel" id="prep-progress">${prepProgress()}</div>
  <form class="prep-form" data-form="prep-add">
    <input class="input grow" name="task" placeholder="New prep task… e.g. Peel potatoes — 4 kg" required>
    <select class="input" name="station">${STATIONS.map(s => `<option>${s}</option>`).join('')}</select>
    <button class="btn" type="submit">Add task</button>
  </form>` +
  STATIONS.map(st => {
    const list = PREP.filter(p => p.station === st);
    if (!list.length) return '';
    return `<div class="panel orders"><h3 style="font-size:15px">${st}</h3>${list.map(p => `
      <div class="prep-item"><input type="checkbox" data-change="prepd" data-id="${p.id}"${p.done ? ' checked' : ''}><span class="grow${p.done ? ' strike' : ''}">${esc(p.task)}</span><button class="icon-x" data-action="del-prep" data-id="${p.id}">✕</button></div>`).join('')}</div>`;
  }).join('');
}

function rShifts() {
  const os = currentOpen();
  const openCard = os
    ? `<div class="panel shift-card"><div><h3 style="font-size:16px">Shift ${os.id} · open</h3><p class="panel-sub">Opened at ${os.opened} by ${esc(os.by)}</p>
        <div class="shift-meta">
          <div class="sm"><span>Opening float</span><b>${fmt(os.float)}</b></div>
          <div class="sm"><span>Cash sales</span><b>${fmt(os.cash)}</b></div>
          <div class="sm"><span>Expected in drawer</span><b>${fmt(os.float + os.cash)}</b></div>
        </div></div>
        <button class="btn ghost" data-action="shift-close-open">Close shift & count drawer</button></div>`
    : `<div class="panel" style="text-align:center;padding:34px"><h3>No shift is open right now</h3><p class="panel-sub" style="margin-bottom:18px">Open a cash shift to start taking payments at the counter.</p><button class="btn" data-action="shift-open-modal">◫ Open cash shift</button></div>`;
  const history = SHIFTS.filter(s => s.status === 'closed');
  return `${openCard}
  <div class="panel orders" style="margin-top:17px"><div class="panel-top"><div><h3>Shift history</h3><p class="panel-sub">Closed shifts and their drawer variance</p></div></div>
    ${history.length ? `<div class="tbl-wrap" style="margin-top:8px;box-shadow:none;border:0"><table class="tbl"><thead><tr><th>Shift</th><th>Cashier</th><th>When</th><th>Cash sales</th><th>Counted</th><th>Variance</th></tr></thead><tbody>${history.map(s => {
      const v = s.variance;
      return `<tr><td><b>${s.id}</b></td><td>${esc(s.by)}</td><td>${s.day || ''} · ${s.opened} → ${s.closed}</td><td>${fmt(s.cash)}</td><td>${fmt(s.counted)}</td><td><span class="tag ${v < 0 ? 'low' : 'ok'}">${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt(Math.abs(v)).replace('E£ ', '')} E£</span></td></tr>`;
    }).join('')}</tbody></table></div>` : '<div class="empty" style="margin-top:16px">No closed shifts yet</div>'}
  </div>`;
}

function rReports() {
  const r = RANGES[state.range];
  const avg = Math.round(r.rev / r.orders);
  const hot = r.values.indexOf(Math.max(...r.values));
  const mx = Math.max(...r.top.map(t => t[1]));
  return `<section class="grid">
      ${statCard(r.label === 'Today' ? "Today's revenue" : r.label + "'s revenue", 'E£', fmt(r.rev), '↗ healthy', 'all channels', true)}
      ${statCard('Orders', '◴', r.orders.toLocaleString('en-US'), '● ', r.label.toLowerCase(), true)}
      ${statCard('Average ticket', '⌁', fmt(avg), '↗ steady', 'per order', true)}
      ${statCard('Top category', '▤', r.cat, '★ ', 'by sales', true)}
    </section>
    <section class="content-grid">
      <div class="panel"><div class="panel-top"><div><h3>${r.chartTitle}</h3><p class="panel-sub">Amounts in Egyptian pounds</p></div>
        <select class="input" data-change="range">${Object.keys(RANGES).map(k => `<option value="${k}"${state.range === k ? ' selected' : ''}>${RANGES[k].label}</option>`).join('')}</select></div>
        ${chart(r.labels, r.values, hot)}
        <div class="legend"><span><i class="dot"></i>Best period</span><span><i class="dot green"></i>Others</span></div>
      </div>
      <div>
        <div class="panel"><div class="panel-top"><div><h3>Payment mix</h3><p class="panel-sub">How guests paid</p></div></div>
          <div class="occupancy"><div class="ring" style="background:${mixBg(r.mix)}"><b>${r.mix.Cash}%</b></div>
          <div><b>Cash still leads</b><p>Keep small change ready.<br>Wallets are growing steadily.</p></div></div>
          <div class="legend"><span><i class="dot"></i>Cash ${r.mix.Cash}%</span><span><i class="dot green"></i>Card ${r.mix.Card}%</span><span><i class="dot coral"></i>Wallet ${r.mix.Wallet}%</span></div>
        </div>
        <div class="panel" style="margin-top:17px"><div class="panel-top"><div><h3>Best sellers</h3><p class="panel-sub">Top 5 items by revenue</p></div></div>
          <div style="margin-top:10px">${r.top.map(t => `<div class="rb"><div class="rb-top"><b>${t[0]}</b><span>${fmt(t[1])}</span></div><div class="rb-track"><div class="rb-fill" style="width:${Math.round(t[1] / mx * 100)}%"></div></div></div>`).join('')}</div>
        </div>
      </div>
    </section>`;
}

const TEAM = [
  { ini: 'OH', name: 'Omar Hamid', role: 'Owner' },
  { ini: 'SA', name: 'Sara Adel', role: 'Cashier' },
  { ini: 'MR', name: 'Mahmoud Reda', role: 'Head chef' },
  { ini: 'YS', name: 'Youssef Samir', role: 'Shisha master' },
  { ini: 'AN', name: 'Aya Nabil', role: 'Floor captain' }
];

function rSettings() {
  return `<section class="content-grid">
    <form class="panel" data-form="settings">
      <div class="panel-top"><div><h3>Restaurant profile</h3><p class="panel-sub">Shown across the POS and receipts</p></div></div>
      <label class="field" style="margin-top:14px"><span>Restaurant name</span><input name="name" required value="${esc(settings.name)}"></label>
      <div class="row2">
        <label class="field"><span>Phone</span><input name="phone" value="${esc(settings.phone)}"></label>
        <label class="field"><span>Address</span><input name="address" value="${esc(settings.address)}"></label>
      </div>
      <div class="row3">
        <label class="field"><span>VAT %</span><input name="vat" type="number" min="0" max="50" step="0.5" value="${settings.vat}"></label>
        <label class="field"><span>Service %</span><input name="service" type="number" min="0" max="30" step="0.5" value="${settings.service}"></label>
        <label class="field"><span>Tables</span><input name="tables" type="number" min="1" max="200" value="${settings.tables}"></label>
      </div>
      <label class="field"><span>Currency</span><input value="EGP — Egyptian Pound (E£)" disabled></label>
      <button class="btn" type="submit">Save settings</button>
    </form>
    <div>
      <div class="panel"><div class="panel-top"><div><h3>Team</h3><p class="panel-sub">People with access today</p></div><button class="pill" data-action="toast" data-msg="Team management coming soon">Manage</button></div>
        <div class="orders" style="margin-top:6px">${TEAM.map(t => `<div class="order"><div class="avatar">${t.ini}</div><div class="order-info"><b>${t.name}</b><small>${t.role}</small></div><span class="status">Active</span></div>`).join('')}</div>
      </div>
      <div class="panel" style="margin-top:17px"><div class="panel-top"><div><h3>About money display</h3></div></div>
        <p class="panel-sub" style="line-height:1.7;margin-top:12px">Every amount in this system is shown in Egyptian Pounds (E£). VAT and service charge are added automatically at checkout using the rates above.</p>
      </div>
    </div>
  </section>`;
}

function itemModal(m) {
  return `<form data-form="item">
    <h3>${m ? 'Edit menu item' : 'Add menu item'}</h3>
    <p class="sub">${m ? 'Update the details of this dish.' : 'It will appear instantly on the POS screen.'}</p>
    <input type="hidden" name="id" value="${m ? m.id : ''}">
    <label class="field"><span>Name</span><input name="name" required value="${m ? esc(m.name) : ''}" placeholder="e.g. Stuffed Pigeon"></label>
    <div class="row2">
      <label class="field"><span>Category</span><select name="cat">${CATS.map(c => `<option${m && m.cat === c ? ' selected' : ''}>${c}</option>`).join('')}</select></label>
      <label class="field"><span>Price · EGP</span><input name="price" type="number" min="1" required value="${m ? m.price : ''}" placeholder="250"></label>
    </div>
    <label class="check"><input type="checkbox" name="avail"${!m || m.avail ? ' checked' : ''}> Available right now</label>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button class="btn" type="submit">${m ? 'Save changes' : 'Add item'}</button></div>
  </form>`;
}

function stockModal() {
  return `<form data-form="stock">
    <h3>Add stock item</h3>
    <p class="sub">Track it in inventory with a par level for low-stock alerts.</p>
    <label class="field"><span>Name</span><input name="name" required placeholder="e.g. Butter"></label>
    <div class="row2">
      <label class="field"><span>Category</span><select name="cat">${INV_CATS.map(c => `<option>${c}</option>`).join('')}</select></label>
      <label class="field"><span>Unit</span><select name="unit">${UNITS.map(u => `<option>${u}</option>`).join('')}</select></label>
    </div>
    <div class="row2">
      <label class="field"><span>Quantity on hand</span><input name="qty" type="number" min="0" required placeholder="10"></label>
      <label class="field"><span>Par level</span><input name="par" type="number" min="1" required placeholder="8"></label>
    </div>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button class="btn" type="submit">Add item</button></div>
  </form>`;
}

function shiftOpenModal() {
  return `<form data-form="shift-open">
    <h3>Open cash shift</h3>
    <p class="sub">Count the drawer and record the opening float.</p>
    <label class="field"><span>Cashier</span><input name="by" required value="Omar Hamid"></label>
    <label class="field"><span>Opening float · EGP</span><input name="float" type="number" min="0" required value="2000"></label>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button class="btn" type="submit">Open shift</button></div>
  </form>`;
}

function shiftCloseModal(os) {
  return `<form data-form="shift-close">
    <input type="hidden" name="id" value="${os.id}">
    <h3>Close shift ${os.id}</h3>
    <p class="sub">Cash sales so far: ${fmt(os.cash)} · Expected in drawer: ${fmt(os.float + os.cash)}</p>
    <label class="field"><span>Counted cash in drawer · EGP</span><input name="counted" type="number" min="0" required placeholder="${os.float + os.cash}"></label>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel</button><button class="btn" type="submit">Close shift</button></div>
  </form>`;
}

const VIEWS = {
  dashboard: { title: 'Dashboard', render: rDashboard },
  pos: { title: 'Point of Sale', render: rPos },
  cashier: { title: 'Cashier', render: rCashier },
  kitchen: { title: 'Kitchen Display', render: () => rBoard('kitchen', 'Hot & cold line — move tickets as they cook') },
  bar: { title: 'Bar Station', render: () => rBoard('bar', 'Drinks & desserts — keep the glasses coming') },
  shisha: { title: 'Shisha Lounge', render: () => rBoard('shisha', 'Terrace orders — coals and fresh heads') },
  menu: { title: 'Menu Items', render: rMenuItems },
  inventory: { title: 'Inventory', render: rInventory },
  prep: { title: 'Prep List', render: rPrep },
  shifts: { title: 'Cash Shifts', render: rShifts },
  reports: { title: 'Reports', render: rReports },
  settings: { title: 'Settings', render: rSettings }
};

function pay(method) {
  if (!state.cart.length) { toast('Cart is empty — add items first'); return; }
  if (state.posType === 'Dine-in' && !state.posTable) { toast('Choose a table number for this order'); return; }
  const tt = cartTotals();
  const total = Math.round(tt.total);
  SEQ += 1;
  orders.unshift({ no: SEQ, type: state.posType, table: state.posType === 'Dine-in' ? state.posTable : null, items: cartCount(), total, status: 'Completed', time: nowLabel(), method });
  const os = currentOpen();
  if (os && method === 'Cash') os.cash += total;
  state.cart = [];
  state.posTable = '';
  render();
  toast(method + ' payment received — ' + fmt(total) + ' · Order #' + SEQ);
}

function setOrder(no, st) {
  const o = orders.find(x => x.no === Number(no));
  if (!o) return;
  o.status = st;
  render();
  toast('Order #' + no + ' → ' + st);
}

function advanceTicket(id) {
  const t = TICKETS.find(x => x.id === id);
  if (!t) return;
  const flow = ['new', 'preparing', 'ready'];
  const i = flow.indexOf(t.status);
  if (i >= flow.length - 1) {
    TICKETS = TICKETS.filter(x => x.id !== id);
    toast('Ticket ' + id + ' served — nice work');
  } else {
    t.status = flow[i + 1];
    toast('Ticket ' + id + ' → ' + t.status);
  }
  render();
}

function onClick(e) {
  const el = e.target.closest('[data-action],[data-goto],[data-view]');
  if (!el) return;
  if (el.dataset.view) { go(el.dataset.view); return; }
  if (el.dataset.goto) { go(el.dataset.goto); return; }
  const a = el.dataset.action;
  const id = el.dataset.id;
  switch (a) {
    case 'toast': toast(el.dataset.msg); break;
    case 'toggle-pass': {
      const p = q('#login-pass');
      if (!p) break;
      p.type = p.type === 'password' ? 'text' : 'password';
      el.textContent = p.type === 'password' ? 'Show' : 'Hide';
      break;
    }
    case 'logout':
      try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
      location.reload();
      break;
    case 'close-modal': closeModal(); break;
    case 'add': {
      const m = byId(id);
      if (!m || !m.avail) break;
      const line = state.cart.find(c => c.id === id);
      if (line) line.qty += 1; else state.cart.push({ id, qty: 1 });
      render();
      toast(m.name + ' added to the order');
      break;
    }
    case 'inc': case 'dec': case 'rm': {
      const i = state.cart.findIndex(c => c.id === id);
      if (i < 0) break;
      if (a === 'inc') state.cart[i].qty += 1;
      else if (a === 'dec') { state.cart[i].qty -= 1; if (state.cart[i].qty < 1) state.cart.splice(i, 1); }
      else state.cart.splice(i, 1);
      render();
      break;
    }
    case 'clear-cart': state.cart = []; state.posTable = ''; render(); toast('Order cleared'); break;
    case 'type': state.posType = el.dataset.type; if (state.posType !== 'Dine-in') state.posTable = ''; render(); break;
    case 'cat': state.posCat = el.dataset.cat; q('#page-title').textContent = VIEWS.pos.title; qa('.pill').forEach(p => p.classList.toggle('active', p.dataset.cat === state.posCat)); q('#menu-cards').innerHTML = posCards(); break;
    case 'pay': pay(el.dataset.method); break;
    case 'tadv': advanceTicket(id); break;
    case 'mark-ready': setOrder(el.dataset.no, 'Ready'); break;
    case 'complete': setOrder(el.dataset.no, 'Completed'); break;
    case 'chip': state.invF = el.dataset.f; qa('.chip').forEach(c => c.classList.toggle('active', c.dataset.f === state.invF)); q('#inv-tbody').innerHTML = invRows(); break;
    case 'restock': {
      const it = INV.find(x => x.id === id);
      if (!it) break;
      it.qty += Math.max(it.par, 1);
      save(); render();
      toast(it.name + ' restocked — now ' + it.qty + ' ' + it.unit);
      break;
    }
    case 'stock-add-open': openModal(stockModal()); break;
    case 'menu-add-open': openModal(itemModal(null)); break;
    case 'menu-edit': { const m = byId(id); if (m) openModal(itemModal(m)); break; }
    case 'menu-del': {
      const i = MENU.findIndex(m => m.id === id);
      if (i < 0) break;
      const nm = MENU[i].name;
      MENU.splice(i, 1);
      save(); render();
      toast(nm + ' removed from the menu');
      break;
    }
    case 'del-prep': {
      PREP = PREP.filter(p => p.id !== id);
      save(); render();
      break;
    }
    case 'shift-open-modal':
      if (currentOpen()) { toast('A shift is already open'); break; }
      openModal(shiftOpenModal());
      break;
    case 'shift-close-open': {
      const os = currentOpen();
      if (os) openModal(shiftCloseModal(os));
      break;
    }
  }
}

function onInput(e) {
  const inp = e.target.dataset.input;
  if (!inp) return;
  if (inp === 'pos-q') { state.posQ = e.target.value; q('#menu-cards').innerHTML = posCards(); }
  if (inp === 'menu-q') { state.menuQ = e.target.value; q('#menu-tbody').innerHTML = menuRows(); }
}

function onChange(e) {
  const ch = e.target.dataset.change;
  if (!ch) return;
  const t = e.target;
  if (ch === 'table') { state.posTable = t.value; return; }
  if (ch === 'menu-cat') { state.menuCat = t.value; q('#menu-tbody').innerHTML = menuRows(); return; }
  if (ch === 'range') { state.range = t.value; render(); return; }
  if (ch === 'avail') {
    const m = byId(t.dataset.id);
    if (!m) return;
    m.avail = t.checked;
    save();
    toast(m.name + (t.checked ? ' is back on the menu' : ' marked unavailable'));
    return;
  }
  if (ch === 'prepd') {
    const p = PREP.find(x => x.id === t.dataset.id);
    if (!p) return;
    p.done = t.checked;
    save();
    const box = q('#prep-progress');
    if (box) box.innerHTML = prepProgress();
    const span = t.closest('.prep-item').querySelector('.grow');
    if (span) span.classList.toggle('strike', p.done);
  }
}

function clampNum(v, def, mn, mx) {
  const n = parseFloat(v);
  if (isNaN(n)) return def;
  return Math.min(mx, Math.max(mn, n));
}

function onSubmit(e) {
  const f = e.target.closest('[data-form]');
  if (!f) return;
  e.preventDefault();
  const d = new FormData(f);
  const val = n => String(d.get(n) == null ? '' : d.get(n)).trim();
  const kind = f.dataset.form;

  if (kind === 'login') {
    const email = val('email').toLowerCase();
    const pass = String(d.get('pass') || '');
    if (email === OWNER.email && pass === OWNER.pass) {
      try { localStorage.setItem(AUTH_KEY, 'owner'); } catch (e) {}
      q('#login-error').classList.remove('show');
      hideLogin();
      f.reset();
      toast('Welcome back, Omar — you are signed in as owner');
    } else {
      const err = q('#login-error');
      err.classList.add('show');
      const card = q('#login-card');
      card.classList.remove('shake');
      void card.offsetWidth;
      card.classList.add('shake');
    }
    return;
  }

  if (kind === 'item') {
    const id = val('id');
    const name = val('name');
    const price = Math.round(parseFloat(val('price')));
    if (!name || !(price > 0)) { toast('Enter a name and a valid price'); return; }
    const cat = val('cat') || CATS[0];
    const avail = !!d.get('avail');
    if (id) {
      const m = byId(id);
      if (m) Object.assign(m, { name, cat, price, avail });
      save(); closeModal(); render();
      toast(name + ' updated');
    } else {
      MENU.push({ id: 'm' + Date.now(), name, cat, price, avail });
      save(); closeModal(); render();
      toast(name + ' added to the menu');
    }
    return;
  }

  if (kind === 'stock') {
    const name = val('name');
    if (!name) { toast('Give the item a name'); return; }
    INV.push({ id: 'i' + Date.now(), name, cat: val('cat'), qty: Math.max(0, parseFloat(val('qty')) || 0), unit: val('unit') || 'kg', par: Math.max(1, parseInt(val('par'), 10) || 1) });
    save(); closeModal(); render();
    toast(name + ' added to inventory');
    return;
  }

  if (kind === 'shift-open') {
    SHIFTS.unshift({ id: 'SH-' + (++SEQ_SH), by: val('by') || 'Staff', opened: nowLabel(), float: Math.max(0, parseFloat(val('float')) || 0), cash: 0, status: 'open' });
    closeModal(); render();
    toast('Shift opened — good service tonight');
    return;
  }

  if (kind === 'shift-close') {
    const s = SHIFTS.find(x => x.id === val('id'));
    if (!s) { closeModal(); return; }
    const counted = parseFloat(val('counted'));
    if (isNaN(counted)) { toast('Enter the counted amount'); return; }
    s.counted = counted;
    s.variance = counted - (s.float + s.cash);
    s.closed = nowLabel();
    s.day = 'Today';
    s.status = 'closed';
    closeModal(); render();
    const v = s.variance;
    toast('Shift closed · variance ' + (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v)));
    return;
  }

  if (kind === 'prep-add') {
    const task = val('task');
    if (!task) { toast('Type the task first'); return; }
    PREP.push({ id: 'p' + Date.now(), task, station: val('station') || STATIONS[0], done: false });
    save(); render();
    toast('Task added to the prep list');
    return;
  }

  if (kind === 'settings') {
    settings.name = val('name') || settings.name;
    settings.phone = val('phone');
    settings.address = val('address');
    settings.vat = clampNum(val('vat'), 14, 0, 50);
    settings.service = clampNum(val('service'), 12, 0, 30);
    settings.tables = Math.round(clampNum(val('tables'), 25, 1, 200));
    applySettings();
    save(); render();
    toast('Settings saved');
  }
}

document.addEventListener('click', onClick);
document.addEventListener('input', onInput);
document.addEventListener('change', onChange);
document.addEventListener('submit', onSubmit);
q('#backdrop').addEventListener('click', e => { if (e.target.id === 'backdrop') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

load();
applySettings();
render();
if (isAuthed()) hideLogin(); else showLogin();
