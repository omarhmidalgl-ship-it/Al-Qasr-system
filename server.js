'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'qasr.db');

const db = new DatabaseSync(DB_PATH);
db.exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS kv(k TEXT PRIMARY KEY, v TEXT);
CREATE TABLE IF NOT EXISTS menu(id TEXT PRIMARY KEY, name TEXT, ar TEXT, cat TEXT, price REAL, avail INTEGER, descr TEXT);
CREATE TABLE IF NOT EXISTS inventory(id TEXT PRIMARY KEY, name TEXT, cat TEXT, qty REAL, unit TEXT, par REAL);
CREATE TABLE IF NOT EXISTS prep(id TEXT PRIMARY KEY, task TEXT, station TEXT, done INTEGER);
CREATE TABLE IF NOT EXISTS orders(no INTEGER PRIMARY KEY, type TEXT, "table" TEXT, room TEXT, staff TEXT, items INTEGER, total REAL, paid REAL, due REAL, method TEXT, status TEXT, time_label TEXT, created_at TEXT DEFAULT (datetime('now','localtime')));
CREATE TABLE IF NOT EXISTS order_items(seq INTEGER PRIMARY KEY AUTOINCREMENT, order_no INTEGER, item_id TEXT, name TEXT, qty REAL, price REAL);
CREATE TABLE IF NOT EXISTS tickets(id TEXT PRIMARY KEY, source TEXT, station TEXT, mins INTEGER, status TEXT, items_json TEXT);
CREATE TABLE IF NOT EXISTS shifts(id TEXT PRIMARY KEY, "by" TEXT, opened TEXT, closed TEXT, "float" REAL, cash REAL, counted REAL, variance REAL, status TEXT, day TEXT);
`);

const num = v => (v === undefined || v === null ? null : +v);

function rows(sql, p = []) { return db.prepare(sql).all(...p); }
function run(sql, p = []) { return db.prepare(sql).run(...p); }

const rowToMenu = r => ({ id: r.id, name: r.name, ar: r.ar, cat: r.cat, price: r.price, avail: !!r.avail, desc: r.descr });
const rowToPrep = r => ({ id: r.id, task: r.task, station: r.station, done: !!r.done });

function readState() {
  const empty = rows('SELECT COUNT(*) c FROM menu')[0].c === 0;
  const linesBy = {};
  rows('SELECT * FROM order_items').forEach(li => { (linesBy[li.order_no] = linesBy[li.order_no] || []).push({ id: li.item_id, name: li.name, qty: li.qty, price: li.price }); });
  let settings = null;
  const srow = rows(`SELECT v FROM kv WHERE k='settings'`);
  if (srow.length) { try { settings = JSON.parse(srow[0].v); } catch (e) {} }
  return {
    empty,
    settings,
    menu: rows('SELECT * FROM menu ORDER BY rowid').map(rowToMenu),
    inventory: rows('SELECT * FROM inventory'),
    prep: rows('SELECT * FROM prep').map(rowToPrep),
    orders: rows('SELECT * FROM orders ORDER BY no DESC').map(r => ({ no: r.no, type: r.type, table: r.table, room: r.room, staff: r.staff, items: r.items, total: r.total, paid: r.paid, due: r.due, method: r.method, status: r.status, time: r.time_label, lines: linesBy[r.no] || [] })),
    tickets: rows('SELECT * FROM tickets').map(t => ({ id: t.id, source: t.source, station: t.station, mins: t.mins, status: t.status, items: JSON.parse(t.items_json || '[]') })),
    shifts: rows('SELECT * FROM shifts'),
    seq: rows('SELECT COALESCE(MAX("no"),1042) n FROM orders')[0].n,
    seqSh: rows('SELECT COALESCE(MAX(CAST(SUBSTR(id,4) AS INTEGER)),121) n FROM shifts')[0].n
  };
}

function bootstrap(b) {
  db.exec('BEGIN IMMEDIATE');
  try {
    (b.menu || []).forEach(m => run('INSERT OR REPLACE INTO menu(id,name,ar,cat,price,avail,descr) VALUES(?,?,?,?,?,?,?)', [m.id, m.name, m.ar || null, m.cat, +m.price || 0, m.avail ? 1 : 0, m.desc || null]));
    (b.inventory || []).forEach(i => run('INSERT OR REPLACE INTO inventory(id,name,cat,qty,unit,par) VALUES(?,?,?,?,?,?)', [i.id, i.name, i.cat, +i.qty || 0, i.unit || 'kg', +i.par || 0]));
    (b.prep || []).forEach(p => run('INSERT OR REPLACE INTO prep(id,task,station,done) VALUES(?,?,?,?)', [p.id, p.task, p.station, p.done ? 1 : 0]));
    (b.orders || []).forEach(o => run('INSERT OR REPLACE INTO orders("no","type","table",room,staff,items,total,paid,due,method,status,time_label) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', [o.no, o.type || null, o.table || null, o.room || null, o.staff || null, o.items || 0, +o.total || 0, +o.paid || 0, +o.due || 0, o.method || null, o.status || null, o.time || null]));
    (b.tickets || []).forEach(t => run('INSERT OR REPLACE INTO tickets(id,source,station,mins,status,items_json) VALUES(?,?,?,?,?,?)', [t.id, t.source || '', t.station || 'kitchen', t.mins || 0, t.status || 'new', JSON.stringify(t.items || [])]));
    (b.shifts || []).forEach(s => run('INSERT OR REPLACE INTO shifts(id,"by",opened,closed,"float",cash,counted,variance,status,day) VALUES(?,?,?,?,?,?,?,?,?,?)', [s.id, s.by || null, s.opened || null, s.closed || null, +s.float || 0, +s.cash || 0, num(s.counted), num(s.variance), s.status || null, s.day || null]));
    if (b.settings) run('INSERT OR REPLACE INTO kv(k,v) VALUES(?,?)', ['settings', JSON.stringify(b.settings)]);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  return readState();
}

function upsert(table, r) {
  switch (table) {
    case 'menu':
      run('INSERT OR REPLACE INTO menu(id,name,ar,cat,price,avail,descr) VALUES(?,?,?,?,?,?,?)', [r.id, r.name, r.ar || null, r.cat, +r.price || 0, r.avail ? 1 : 0, r.desc || null]);
      break;
    case 'inventory':
      run('INSERT OR REPLACE INTO inventory(id,name,cat,qty,unit,par) VALUES(?,?,?,?,?,?)', [r.id, r.name, r.cat, +r.qty || 0, r.unit || 'kg', +r.par || 0]);
      break;
    case 'prep':
      run('INSERT OR REPLACE INTO prep(id,task,station,done) VALUES(?,?,?,?)', [r.id, r.task, r.station, r.done ? 1 : 0]);
      break;
    case 'tickets':
      run('INSERT OR REPLACE INTO tickets(id,source,station,mins,status,items_json) VALUES(?,?,?,?,?,?)', [r.id, r.source || '', r.station || 'kitchen', +r.mins || 0, r.status || 'new', JSON.stringify(r.items || [])]);
      break;
    case 'shifts':
      run('INSERT OR REPLACE INTO shifts(id,"by",opened,closed,"float",cash,counted,variance,status,day) VALUES(?,?,?,?,?,?,?,?,?,?)', [r.id, r.by || null, r.opened || null, r.closed || null, +r.float || 0, +r.cash || 0, num(r.counted), num(r.variance), r.status || null, r.day || null]);
      break;
    case 'orders':
      run('INSERT OR REPLACE INTO orders("no","type","table",room,staff,items,total,paid,due,method,status,time_label) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)', [+r.no, r.type || null, r.table || null, r.room || null, r.staff || null, r.items || 0, +r.total || 0, +r.paid || 0, +r.due || 0, r.method || null, r.status || null, r.time || null]);
      break;
    default: throw new Error('unknown table');
  }
  return { ok: true };
}

const TABLE_PK = { menu: 'id', inventory: 'id', prep: 'id', shifts: 'id', orders: 'no', tickets: 'id' };

function deleteRow(table, id) {
  const pk = TABLE_PK[table];
  if (!pk) throw new Error('unknown table');
  run(`DELETE FROM "${table}" WHERE "${pk}" = ?`, [id]);
  return { ok: true };
}

function createOrder(b) {
  const total = +b.total || 0;
  const paid = Math.min(Math.max(0, +b.paid || 0), total);
  db.exec('BEGIN IMMEDIATE');
  try {
    const no = rows('SELECT COALESCE(MAX("no"),1042)+1 AS n FROM orders')[0].n;
    run('INSERT INTO orders("no","type","table",room,staff,items,total,paid,due,method,status,time_label) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
      [no, b.type || null, b.table || null, b.room || null, b.staff || null, b.items || 0, total, paid, total - paid, b.method || null, b.status || 'Preparing', b.timeLabel || null]);
    (b.lines || []).forEach(it => run('INSERT INTO order_items(order_no,item_id,name,qty,price) VALUES(?,?,?,?,?)', [no, it.id || null, it.name || '', +it.qty || 1, +it.price || 0]));
    if (b.method === 'Cash' && paid > 0) {
      const os = rows(`SELECT id FROM shifts WHERE status='open' ORDER BY rowid DESC LIMIT 1`)[0];
      if (os) run('UPDATE shifts SET cash = cash + ? WHERE id = ?', [paid, os.id]);
    }
    db.exec('COMMIT');
    return { no };
  } catch (e) { db.exec('ROLLBACK'); throw e; }
}

function ticketAdvance(b) {
  const t = rows('SELECT * FROM tickets WHERE id = ?', [b.id])[0];
  if (!t) throw new Error('ticket not found');
  const flow = ['new', 'preparing', 'ready'];
  const i = flow.indexOf(t.status);
  if (i >= flow.length - 1) {
    run('DELETE FROM tickets WHERE id = ?', [b.id]);
    return { removed: true, id: b.id };
  }
  const next = flow[i + 1];
  run('UPDATE tickets SET status = ? WHERE id = ?', [next, b.id]);
  return { removed: false, id: b.id, status: next };
}

function dispatch(route, b) {
  if (route === 'state') return readState();
  if (route === 'bootstrap') return bootstrap(b);
  if (route === 'settings') { run('INSERT OR REPLACE INTO kv(k,v) VALUES(?,?)', ['settings', JSON.stringify(b.settings || {})]); return { ok: true }; }
  if (route === 'orders/create') return createOrder(b);
  if (route === 'tickets/advance') return ticketAdvance(b);
  const parts = route.split('/');
  if (parts.length === 2 && TABLE_PK[parts[0]]) {
    if (parts[1] === 'upsert') return upsert(parts[0], b.row || {});
    if (parts[1] === 'delete') return deleteRow(parts[0], b.id);
  }
  throw new Error('unknown route: ' + route);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

function serveStatic(p, res) {
  if (p === '/') p = '/index.html';
  const fp = path.join(ROOT, path.normalize(p).replace(/^([.][.][/\\])+/, ''));
  if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname.startsWith('/api/')) {
    let body = '';
    req.on('data', d => { body += d; if (body.length > 2e6) req.destroy(); });
    req.on('end', () => {
      let b = {};
      try { if (body) b = JSON.parse(body); } catch (e) {}
      try {
        const out = dispatch(u.pathname.slice(5), b);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(out));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(e.message || e) }));
      }
    });
    return;
  }
  serveStatic(u.pathname, res);
});

server.listen(PORT, () => {
  console.log('Al Qasr POS — SQLite server running');
  console.log('Local:   http://localhost:' + PORT);
  Object.keys(os.networkInterfaces()).forEach(k => {
    os.networkInterfaces()[k].forEach(i => { if (i.family === 'IPv4' && !i.internal) console.log('Network: http://' + i.address + ':' + PORT); });
  });
  console.log('Database file: ' + DB_PATH);
});
