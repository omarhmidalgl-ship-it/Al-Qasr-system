'use strict';

const q = (s, r = document) => r.querySelector(s);
const qa = (s, r = document) => Array.from(r.querySelectorAll(s));
const fmt = n => 'E£ ' + Math.round(Number(n) || 0).toLocaleString('en-US');
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nowLabel = () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
const KEY = 'qasr_state_v3';
const AUTH_KEY = 'qasr_auth_v1';

const OWNER = { email: 'admin@qasr.com', pass: 'changeme123' };

function isAuthed() {
  try { return localStorage.getItem(AUTH_KEY) === 'owner'; } catch (e) { return false; }
}
function showLogin() { q('#login').style.display = 'grid'; }
function hideLogin() { q('#login').style.display = 'none'; }

const API_MODE = typeof location !== 'undefined' && location.protocol.startsWith('http');
let SERVER = false;
async function post(route, body) {
  const r = await fetch('/api/' + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
  if (!r.ok) throw new Error('API ' + route + ' failed');
  return r.json();
}
function syncFail() { SERVER = false; toast('Offline mode — changes kept locally · وضع أوفلاين — التغييرات محفوظة محليًا'); }
function syncUp(table, row) {
  save();
  if (!SERVER) return;
  post(table + '/upsert', { row }).catch(syncFail);
}
function syncDel(table, id) {
  save();
  if (!SERVER) return;
  post(table + '/delete', { id }).catch(syncFail);
}

const CATS = ['Hot Drinks', 'Turkish Coffee', 'Espresso Bar', 'Iced Coffee', 'Fresh Juices', 'Soft Drinks', 'Water', 'Breakfast', 'Light Sandwiches', 'Pastas', 'Main Dishes', 'Sandwiches'];
const BEV_CATS = ['Hot Drinks', 'Turkish Coffee', 'Espresso Bar', 'Iced Coffee', 'Fresh Juices', 'Soft Drinks', 'Water'];
const ORDER_TYPES = ['Dine-in', 'Take down', 'Walk-in', 'Staff meal', 'Owner order'];
const ORDER_TYPES_AR = { 'Dine-in': 'صالة', 'Take down': 'سفري', 'Walk-in': 'مباشر', 'Staff meal': 'وجبة موظف', 'Owner order': 'طلب المالك' };
const STATUS_AR = { Completed: 'مكتمل', Preparing: 'قيد التحضير', Ready: 'جاهز' };
const PAY_AR = { Cash: 'نقدي', Card: 'بطاقة', 'Room Tab': 'حساب غرفة', Unpaid: 'غير مدفوع', Other: 'أخرى' };
const payBi = m => m + (PAY_AR[m] ? ' · ' + PAY_AR[m] : '');
const stBi = s => s + (STATUS_AR[s] ? ' · ' + STATUS_AR[s] : '');
const PAY_METHODS = ['Cash', 'Vodafone Cash', 'InstaPay', 'Bank Transfer', 'Card', 'Room Tab', 'Other', 'Unpaid'];
const ROOMS = Array.from({ length: 8 }, (_, i) => 'S' + String(i + 1).padStart(2, '0')).concat(['D01', 'D02']);
const STATIONS = ['Cold kitchen', 'Hot line', 'Grill', 'Beverage'];
const INV_CATS = ['Meat', 'Poultry', 'Fish', 'Produce', 'Dry goods', 'Dairy', 'Beverage', 'Other'];
const INV_CATS_AR = { 'Meat': 'لحم', 'Poultry': 'دواجن', 'Fish': 'سمك', 'Produce': 'خضار', 'Dry goods': 'مواد جافة', 'Dairy': 'ألبان', 'Beverage': 'مشروبات', 'Other': 'أخرى' };
const CATS_AR = { 'Hot Drinks': 'مشروبات ساخنة', 'Turkish Coffee': 'قهوة تركي', 'Espresso Bar': 'إسبريسو', 'Iced Coffee': 'قهوة مثلجة', 'Fresh Juices': 'عصائر فريش', 'Soft Drinks': 'مشروبات غازية', 'Water': 'مياه', 'Breakfast': 'فطار', 'Light Sandwiches': 'ساندويتشات خفيفة', 'Pastas': 'باستا', 'Main Dishes': 'أطباق رئيسية', 'Sandwiches': 'ساندويتشات' };
const invCatBi = c => c + ' · ' + (INV_CATS_AR[c] || '');
const catBi = c => c + (CATS_AR[c] ? ' · ' + CATS_AR[c] : '');
const UNITS = ['kg', 'L', 'piece', 'bag', 'box', 'bunch', 'tray'];

const DEFAULT_MENU = [
  { id: 'm01', name: 'Tea', ar: 'شاي', cat: 'Hot Drinks', price: 40, avail: true },
  { id: 'm02', name: 'Small Hot Teapot 1-2', ar: 'براد شاي صغير 1-2', cat: 'Hot Drinks', price: 60, avail: true },
  { id: 'm03', name: 'Large Hot Teapot 3-4', ar: 'براد شاي كبير 3-4', cat: 'Hot Drinks', price: 100, avail: true },
  { id: 'm04', name: 'Nescafe Black', ar: 'نسكافيه بلاك', cat: 'Hot Drinks', price: 60, avail: true },
  { id: 'm05', name: 'Nescafe with Milk', ar: 'نسكافيه بلبن', cat: 'Hot Drinks', price: 100, avail: true },
  { id: 'm06', name: 'Anise', ar: 'ينسون', cat: 'Hot Drinks', price: 50, avail: true },
  { id: 'm07', name: 'Mint', ar: 'نعناع', cat: 'Hot Drinks', price: 50, avail: true },
  { id: 'm08', name: 'Karak Tea', ar: 'شاي كرك', cat: 'Hot Drinks', price: 60, avail: true },
  { id: 'm09', name: 'Turkish Coffee Single', ar: 'قهوة تركي سنجل', cat: 'Turkish Coffee', price: 60, avail: true },
  { id: 'm10', name: 'Turkish Coffee Double', ar: 'قهوة تركي دبل', cat: 'Turkish Coffee', price: 80, avail: true },
  { id: 'm11', name: 'French Coffee', ar: 'قهوة فرنساوي باللبن', cat: 'Turkish Coffee', price: 100, avail: true, desc: 'Coffee with milk' },
  { id: 'm12', name: 'Hazelnut Coffee', ar: 'قهوة بندق', cat: 'Turkish Coffee', price: 120, avail: true },
  { id: 'm13', name: 'Small Water', ar: 'مياه صغيرة', cat: 'Water', price: 25, avail: true },
  { id: 'm14', name: 'Large Water', ar: 'مياه كبيرة', cat: 'Water', price: 50, avail: true },
  { id: 'm15', name: 'Hibiscus', ar: 'كركديه', cat: 'Fresh Juices', price: 50, avail: true },
  { id: 'm16', name: 'Fresh Orange', ar: 'برتقال فريش', cat: 'Fresh Juices', price: 140, avail: true },
  { id: 'm17', name: 'Strawberry', ar: 'فراولة', cat: 'Fresh Juices', price: 140, avail: true },
  { id: 'm18', name: 'Banana Milk', ar: 'موز باللبن', cat: 'Fresh Juices', price: 140, avail: true },
  { id: 'm19', name: 'Guava', ar: 'جوافا', cat: 'Fresh Juices', price: 140, avail: true },
  { id: 'm20', name: 'Watermelon', ar: 'بطيخ', cat: 'Fresh Juices', price: 140, avail: true },
  { id: 'm21', name: 'Mango', ar: 'مانجا', cat: 'Fresh Juices', price: 140, avail: true },
  { id: 'm22', name: 'Lemon Mint', ar: 'ليمون نعناع', cat: 'Fresh Juices', price: 140, avail: true },
  { id: 'm23', name: 'Pepsi · Miranda · 7up', ar: 'بيبسي · ميرندا · سفن اب', cat: 'Soft Drinks', price: 60, avail: true },
  { id: 'm24', name: 'Coca Cola · Sprite · Fanta', ar: 'كوكاكولا · سبرايت · فانتا', cat: 'Soft Drinks', price: 60, avail: true },
  { id: 'm25', name: 'Schweppes', ar: 'شويبس', cat: 'Soft Drinks', price: 60, avail: true },
  { id: 'm26', name: 'Redbull', ar: 'ريد بل', cat: 'Soft Drinks', price: 140, avail: true },
  { id: 'm27', name: 'Twist', ar: 'تويست', cat: 'Soft Drinks', price: 60, avail: true },
  { id: 'm28', name: 'Cortado', ar: 'كورتادو', cat: 'Espresso Bar', price: 60, avail: true },
  { id: 'm29', name: 'Single Espresso', ar: 'اسبريسو سنجل', cat: 'Espresso Bar', price: 60, avail: true },
  { id: 'm30', name: 'Double Espresso', ar: 'اسبريسو دبل', cat: 'Espresso Bar', price: 100, avail: true },
  { id: 'm31', name: 'Ristretto', ar: 'ريستريتو', cat: 'Espresso Bar', price: 100, avail: true },
  { id: 'm32', name: 'Macchiato', ar: 'ماتشياتو', cat: 'Espresso Bar', price: 100, avail: true },
  { id: 'm33', name: 'Americano', ar: 'امريكانو', cat: 'Espresso Bar', price: 100, avail: true },
  { id: 'm34', name: 'Flat White', ar: 'فلات وايت', cat: 'Espresso Bar', price: 120, avail: true },
  { id: 'm35', name: 'Cappuccino', ar: 'كابتشينو', cat: 'Espresso Bar', price: 120, avail: true },
  { id: 'm36', name: 'Latte', ar: 'لاتيه', cat: 'Espresso Bar', price: 120, avail: true },
  { id: 'm37', name: 'Mocha', ar: 'موكا', cat: 'Espresso Bar', price: 140, avail: true },
  { id: 'm38', name: 'Hot Spanish Latte', ar: 'لاتيه اسباني ساخن', cat: 'Espresso Bar', price: 150, avail: true },
  { id: 'm39', name: 'Hot Caramel Latte', ar: 'لاتيه كراميل ساخن', cat: 'Espresso Bar', price: 160, avail: true },
  { id: 'm40', name: 'Hot Vanilla Latte', ar: 'لاتيه فانيليا ساخن', cat: 'Espresso Bar', price: 160, avail: true },
  { id: 'm41', name: 'Hot Hazelnut Latte', ar: 'لاتيه بندق ساخن', cat: 'Espresso Bar', price: 160, avail: true },
  { id: 'm42', name: 'White Mocha', ar: 'وايت موكا', cat: 'Espresso Bar', price: 160, avail: true },
  { id: 'm43', name: 'Iced Americano', ar: 'ايس امريكانو', cat: 'Iced Coffee', price: 120, avail: true },
  { id: 'm44', name: 'Iced Long Black', ar: 'ايس لونج بلاك', cat: 'Iced Coffee', price: 120, avail: true },
  { id: 'm45', name: 'Iced Latte', ar: 'ايس لاتيه', cat: 'Iced Coffee', price: 150, avail: true },
  { id: 'm46', name: 'Iced Spanish Latte', ar: 'ايس لاتيه اسباني', cat: 'Iced Coffee', price: 170, avail: true },
  { id: 'm47', name: 'Iced Caramel Latte', ar: 'ايس لاتيه كراميل', cat: 'Iced Coffee', price: 180, avail: true },
  { id: 'm48', name: 'Iced Vanilla Latte', ar: 'ايس لاتيه فانيليا', cat: 'Iced Coffee', price: 180, avail: true },
  { id: 'm49', name: 'Iced Hazelnut Latte', ar: 'ايس لاتيه بندق', cat: 'Iced Coffee', price: 180, avail: true },
  { id: 'm50', name: 'Iced Mocha', ar: 'ايس موكا', cat: 'Iced Coffee', price: 180, avail: true },
  { id: 'm51', name: 'Iced White Mocha', ar: 'ايس وايت موكا', cat: 'Iced Coffee', price: 180, avail: true },
  { id: 'm52', name: 'Iced Macchiato', ar: 'ايس ماتشياتو', cat: 'Iced Coffee', price: 120, avail: true },
  { id: 'm53', name: 'Affogato', ar: 'افوجاتو', cat: 'Iced Coffee', price: 150, avail: true },
  { id: 'm54', name: 'Egyptian Breakfast', ar: 'فطار مصري', cat: 'Breakfast', price: 199, avail: true, desc: 'Fava beans, eggs, falafel, and fried potatoes' },
  { id: 'm55', name: 'English Breakfast', ar: 'فطار انجليزي', cat: 'Breakfast', price: 259, avail: true, desc: 'Omelette, sausage, jam, Roumi cheese, cheddar toast' },
  { id: 'm56', name: 'Continental Breakfast', ar: 'فطار كونتيننتال', cat: 'Breakfast', price: 259, avail: true, desc: 'Fruit salad, corn flakes, jam, honey, cheddar toast' },
  { id: 'm57', name: 'Mix Cheese', ar: 'ساندوتش جبنة مشكلة', cat: 'Light Sandwiches', price: 199, avail: true, desc: 'Cheddar, Roumi cheese, tomato, cucumber, and fries' },
  { id: 'm58', name: 'Smoked Turkey', ar: 'ساندوتش ديك رومي مدخن', cat: 'Light Sandwiches', price: 249, avail: true, desc: 'Smoked turkey, cheddar, fries, and mayonnaise' },
  { id: 'm59', name: 'Tuna', ar: 'ساندوتش تونة', cat: 'Light Sandwiches', price: 199, avail: true, desc: 'Tuna, lettuce, cucumber, onion, mayonnaise, olives, and fries' },
  { id: 'm60', name: 'Alfredo Pasta', ar: 'باستا الفريدو', cat: 'Pastas', price: 249, avail: true, desc: 'Creamy white sauce pasta with parmesan-style flavor' },
  { id: 'm61', name: 'Negresco Pasta', ar: 'باستا نيجريسكو', cat: 'Pastas', price: 269, avail: true, desc: 'Baked creamy pasta with chicken and cheese' },
  { id: 'm62', name: 'Chicken Mushroom Pasta', ar: 'باستا فراخ بالمشروم', cat: 'Pastas', price: 279, avail: true, desc: 'Pasta with chicken, mushroom, and creamy sauce' },
  { id: 'm63', name: 'Shrimp Pasta', ar: 'باستا جمبري', cat: 'Pastas', price: 279, avail: true, desc: 'Pasta with shrimp and special sauce' },
  { id: 'm64', name: 'Bolognese Pasta', ar: 'باستا بولونيز', cat: 'Pastas', price: 249, avail: true, desc: 'Pasta with minced meat tomato sauce' },
  { id: 'm65', name: 'Mebakbaka Meat', ar: 'مبكبكة لحمة', cat: 'Pastas', price: 399, avail: true, desc: 'Libyan-style pasta cooked with meat and tomato sauce' },
  { id: 'm66', name: 'Mebakbaka Chicken', ar: 'مبكبكة فراخ', cat: 'Pastas', price: 349, avail: true, desc: 'Libyan-style pasta cooked with chicken and tomato sauce' },
  { id: 'm67', name: 'Chicken Lemon', ar: 'فراخ بالليمون', cat: 'Main Dishes', price: 319, avail: true, desc: 'Grilled or pan-seared chicken with lemon sauce · served with 2 sides' },
  { id: 'm68', name: 'Chicken Mushroom', ar: 'فراخ بالمشروم', cat: 'Main Dishes', price: 349, avail: true, desc: 'Chicken served with creamy mushroom sauce · served with 2 sides' },
  { id: 'm69', name: 'Steak Mushroom', ar: 'استيك بالمشروم', cat: 'Main Dishes', price: 399, avail: true, desc: 'Beef steak served with mushroom sauce · served with 2 sides' },
  { id: 'm70', name: 'Steak Demiglace', ar: 'استيك ديمي غلاس', cat: 'Main Dishes', price: 349, avail: true, desc: 'Beef steak served with demi-glace sauce · served with 2 sides' },
  { id: 'm71', name: 'Steak Shrimp', ar: 'استيك بالجمبري', cat: 'Main Dishes', price: 499, avail: true, desc: 'Beef steak topped or served with shrimp · served with 2 sides' },
  { id: 'm72', name: 'Chicken Shrimp', ar: 'فراخ بالجمبري', cat: 'Main Dishes', price: 429, avail: true, desc: 'Chicken served with shrimp and special sauce · served with 2 sides' },
  { id: 'm73', name: 'Beef Balady Smash Burger + Fries', ar: 'برجر لحم بلدي سماش 200 جم + فرايز', cat: 'Sandwiches', price: 249, avail: true, desc: 'Balady beef smash burger 200g + fries' },
  { id: 'm74', name: 'Beef Steak Burger + Fries', ar: 'برجر لحم ستيك 300 جم + فرايز', cat: 'Sandwiches', price: 299, avail: true, desc: 'Beef steak burger 300g + fries' },
  { id: 'm75', name: 'Chicken Strips Original', ar: 'تشيكن ستربس عادي', cat: 'Sandwiches', price: 179, avail: true },
  { id: 'm76', name: 'Chicken Strips Spicy', ar: 'تشيكن ستربس سبايسي', cat: 'Sandwiches', price: 179, avail: true },
  { id: 'm77', name: 'Chicken Zinger Spicy', ar: 'تشيكن زنجر سبايسي', cat: 'Sandwiches', price: 179, avail: true },
  { id: 'm78', name: 'Fire Shrimp Spicy', ar: 'فاير شريمب سبايسي', cat: 'Sandwiches', price: 250, avail: true },
  { id: 'm79', name: 'Shish Tawook', ar: 'شيش طاووق', cat: 'Sandwiches', price: 199, avail: true },
  { id: 'm80', name: 'Liver', ar: 'كبدة', cat: 'Sandwiches', price: 149, avail: true },
  { id: 'm81', name: 'Egyptian Sausage', ar: 'سجق', cat: 'Sandwiches', price: 149, avail: true },
  { id: 'm82', name: 'Egyptian Hawawshi', ar: 'حواوشي', cat: 'Sandwiches', price: 179, avail: true },
  { id: 'm83', name: 'Grilled Kofta', ar: 'كفتة', cat: 'Sandwiches', price: 179, avail: true },
  { id: 'm84', name: 'Hot Dog', ar: 'هوت دوج', cat: 'Sandwiches', price: 119, avail: true },
  { id: 'm85', name: 'Hot Dog Bikini', ar: 'هوت دوج بيكيني', cat: 'Sandwiches', price: 149, avail: true },
  { id: 'm86', name: 'Chicken Pane Balady', ar: 'فراخ بانية بلدي', cat: 'Sandwiches', price: 199, avail: true },
  { id: 'm87', name: 'Chicken Shawarma', ar: 'شاورما فراخ', cat: 'Sandwiches', price: 159, avail: true },
  { id: 'm88', name: 'Chicken Fajita', ar: 'فاهيتا فراخ', cat: 'Sandwiches', price: 159, avail: true }
];
let MENU = DEFAULT_MENU.slice();

const DEFAULT_INV = [];
let INV = DEFAULT_INV.slice();

const DEFAULT_PREP = [
  { id: 'p01', task: 'Chop onions — 5 kg', station: 'Cold kitchen', done: false },
  { id: 'p02', task: 'Wash & cut greens — 10 trays', station: 'Cold kitchen', done: true },
  { id: 'p03', task: 'Portion foul & tahini bowls ×30', station: 'Cold kitchen', done: false },
  { id: 'p04', task: 'Cook rice — 8 kg', station: 'Hot line', done: false },
  { id: 'p05', task: 'Prepare demi-glace sauce — 2 L', station: 'Hot line', done: true },
  { id: 'p06', task: 'Marinate kofta — 4 kg', station: 'Grill', done: false },
  { id: 'p07', task: 'Shape burger patties — 20 pieces', station: 'Grill', done: true },
  { id: 'p08', task: 'Brew hibiscus — 3 L', station: 'Beverage', done: false },
  { id: 'p09', task: 'Squeeze lemons — 2 kg', station: 'Beverage', done: false }
];
let PREP = DEFAULT_PREP.slice();

let settings = { name: 'Al Qasr Restaurant & Cafe', phone: '+20 100 555 1234', address: '12 Sharia El Nil, Zamalek, Cairo', vat: 14, service: 12, tables: 25 };

let orders = [
  { no: 1042, type: 'Dine-in', table: '8', room: null, staff: 'Aya Nabil', items: 3, total: 1265, paid: 1265, due: 0, method: 'Card', status: 'Completed', time: '12:42 PM' },
  { no: 1041, type: 'Dine-in', table: '3', room: null, staff: 'Sara Adel', items: 5, total: 2340, paid: 2340, due: 0, method: 'Cash', status: 'Preparing', time: '12:31 PM' },
  { no: 1040, type: 'Walk-in', table: null, room: null, staff: 'Youssef Samir', items: 3, total: 890, paid: 890, due: 0, method: 'Vodafone Cash', status: 'Ready', time: '12:18 PM' },
  { no: 1039, type: 'Dine-in', table: null, room: 'S03', staff: 'Aya Nabil', items: 2, total: 640, paid: 0, due: 640, method: 'Room Tab', status: 'Completed', time: '12:04 PM' }
];

let TICKETS = [
  { id: 'T-201', source: 'Table 03', station: 'kitchen', mins: 4, status: 'new', items: [{ n: 'Grilled Kofta', q: 2 }, { n: 'Egyptian Hawawshi', q: 1 }] },
  { id: 'T-202', source: 'Table 08', station: 'kitchen', mins: 9, status: 'preparing', items: [{ n: 'Chicken Mushroom', q: 1 }, { n: 'Steak Demiglace', q: 1 }] },
  { id: 'T-203', source: 'Delivery #1040', station: 'kitchen', mins: 12, status: 'ready', items: [{ n: 'Egyptian Breakfast', q: 2 }, { n: 'Mebakbaka Chicken', q: 1 }] },
  { id: 'T-204', source: 'Table 14', station: 'bar', mins: 3, status: 'new', items: [{ n: 'Hot Spanish Latte', q: 2 }, { n: 'Fresh Orange', q: 1 }] },
  { id: 'T-205', source: 'Table 05', station: 'bar', mins: 7, status: 'preparing', items: [{ n: 'Turkish Coffee Double', q: 2 }, { n: 'Tea', q: 1 }] }
];

let SHIFTS = [
  { id: 'SH-121', by: 'Omar Hamid', opened: '09:00 AM', float: 2000, cash: 18400, status: 'open' },
  { id: 'SH-120', by: 'Sara Adel', opened: '09:05 AM', closed: '05:32 PM', float: 2000, cash: 21350, counted: 21200, variance: -150, status: 'closed', day: 'Yesterday' },
  { id: 'SH-119', by: 'Mahmoud Reda', opened: '04:58 PM', closed: '01:10 AM', float: 2000, cash: 15980, counted: 15980, variance: 0, status: 'closed', day: 'Yesterday' },
  { id: 'SH-118', by: 'Sara Adel', opened: '09:02 AM', closed: '05:47 PM', float: 2000, cash: 19875, counted: 19960, variance: 85, status: 'closed', day: 'Fri 21 Aug' }
];
let SEQ = 1042;
let SEQ_SH = 121;

const state = { view: 'dashboard', cart: [], posCat: 'All', posQ: '', menuCat: 'All', menuQ: '', menuPage: 1, menuPer: 10, invF: 'All', range: 'today' };

const RANGES = {
  today: {
    label: 'Today · اليوم', chartTitle: 'Revenue — hourly flow · الإيرادات بالساعة',
    labels: ['10AM', '12PM', '2PM', '4PM', '6PM', '8PM', '10PM'],
    values: [1800, 4200, 6100, 3300, 8200, 15400, 9650],
    rev: 48650, orders: 86, cat: 'Sandwiches',
    mix: { Cash: 44, Card: 41, Wallet: 15 },
    top: [['Beef Steak Burger + Fries', 4200], ['Chicken Lemon', 3600], ['Iced Spanish Latte', 2100], ['Egyptian Breakfast', 1900], ['Fresh Orange', 1250]]
  },
  week: {
    label: 'This week · هذا الأسبوع', chartTitle: 'Revenue — last 7 days · الإيرادات آخر ٧ أيام',
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [28400, 36100, 31500, 43800, 52400, 66200, 58650],
    rev: 298400, orders: 512, cat: 'Main Dishes',
    mix: { Cash: 47, Card: 38, Wallet: 15 },
    top: [['Chicken Lemon', 26800], ['Beef Steak Burger + Fries', 24400], ['Mebakbaka Meat', 15800], ['Iced Spanish Latte', 11200], ['Egyptian Breakfast', 9700]]
  },
  month: {
    label: 'This month · هذا الشهر', chartTitle: 'Revenue — weekly totals · الإيرادات بالأسابيع',
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    values: [278000, 312000, 296000, 362000],
    rev: 1248000, orders: 2140, cat: 'Main Dishes',
    mix: { Cash: 49, Card: 37, Wallet: 14 },
    top: [['Steak Shrimp', 98400], ['Chicken Lemon', 88200], ['Mebakbaka Meat', 64600], ['Iced Caramel Latte', 41800], ['Mix Cheese', 33500]]
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
  return `<div class="order"><div class="order-no">#${o.no}</div><div class="order-info"><b>${esc(placeLabel(o))}</b><small>${o.items} items · أصناف · ${o.time}${o.method ? ' · ' + payBi(o.method) : ''}</small></div><div class="price">${fmt(o.total)}</div>${o.due > 0 ? `<span class="tag low">Due ${fmt(o.due)} · مستحق</span>` : ''}<span class="status${cls}">${stBi(o.status)}</span></div>`;
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
  let o = '';
  for (let i = 1; i <= Number(settings.tables); i++) o += `<option value="${i}">Table ${i}</option>`;
  return o;
}

function placeLabel(o) {
  const t = o.type || '';
  const bits = [ORDER_TYPES_AR[t] ? t + ' · ' + ORDER_TYPES_AR[t] : t];
  if (o.room) bits.push('Room · غرفة ' + o.room);
  else if (o.table) bits.push('Table · ترابيزة ' + o.table);
  if (o.staff) bits.push(o.staff);
  return bits.join(' · ');
}

function posCards() {
  const qq = state.posQ.trim().toLowerCase();
  const list = MENU.filter(m => (state.posCat === 'All' || m.cat === state.posCat) && (!qq || m.name.toLowerCase().includes(qq) || (m.ar || '').includes(qq)));
  if (!list.length) return '<div class="empty" style="grid-column:1/-1">No menu items match your search</div>';
  return list.map(m => `<button class="menu-card${m.avail ? '' : ' off'}" data-action="add" data-id="${m.id}"${m.avail ? '' : ' disabled title="Unavailable right now"'}><span class="mc-tag">${m.cat}</span><div class="mc-name">${esc(m.name)}</div>${m.ar ? `<div class="mc-ar" dir="rtl" lang="ar">${esc(m.ar)}</div>` : ''}${m.desc ? `<div class="mc-desc">${esc(m.desc)}</div>` : ''}<div class="mc-price">${fmt(m.price)}</div><span class="mc-plus">＋</span></button>`).join('');
}

function cartLines() {
  return state.cart.map(c => {
    const m = byId(c.id);
    if (!m) return '';
    return `<div class="ci"><div class="ci-info"><b>${esc(m.name)}</b><small>${fmt(m.price)} each · للواحدة</small></div><div class="stepper"><button data-action="dec" data-id="${c.id}">−</button><span>${c.qty}</span><button data-action="inc" data-id="${c.id}">＋</button></div><div class="ci-amt">${fmt(m.price * c.qty)}</div><button class="icon-x" data-action="rm" data-id="${c.id}" title="Remove · إزالة">✕</button></div>`;
  }).join('');
}

function cartPanel() {
  const tt = cartTotals();
  const n = cartCount();
  return `<aside class="panel pos-cart">
    <div class="panel-top"><div><h3>Current order · الطلب الحالي</h3><p class="panel-sub">${n ? n + ' items on this order · أصناف على الطلب' : 'Nothing added yet · لم يُضف شيء بعد'}</p></div>${n ? '<button class="link-clear" data-action="clear-cart">Clear all · تفريغ الكل</button>' : ''}</div>
    <div class="cart-list">${n ? cartLines() : '<div class="empty">Tap items from the menu<br>to start building this order<br>اختر أصنافًا من المنيو لبدء الطلب</div>'}</div>
    <div class="totals">
      <div class="tr"><span>Subtotal · المجموع</span><b>${fmt(tt.sub)}</b></div>
      <div class="tr"><span>Service charge · الخدمة ${settings.service}%</span><b>${fmt(tt.svc)}</b></div>
      <div class="tr"><span>VAT · الضريبة ${settings.vat}%</span><b>${fmt(tt.vat)}</b></div>
      <div class="tr grand"><span>Total · الإجمالي</span><span>${fmt(tt.total)}</span></div>
    </div>
    <button class="btn block" style="margin-top:13px" data-action="checkout-open">Confirm order · تأكيد الطلب ▸</button>
  </aside>`;
}

function rDashboard() {
  const t = RANGES.today;
  const avg = Math.round(t.rev / t.orders);
  const hot = RANGES.week.values.indexOf(Math.max(...RANGES.week.values));
  return `
  <div class="welcome"><div><h2>Here's your restaurant at a glance · مطعمك في لمحة</h2><p>Everything is running smoothly today. · كل شيء يسير بسلاسة اليوم.</p></div><button class="view-btn" data-goto="pos">＋ New order · طلب جديد</button></div>
  <section class="grid">
    ${statCard("Today's revenue · إيرادات اليوم", 'E£', fmt(t.rev), '↗ 12.8%', 'vs. yesterday · مقارنة بالأمس', true)}
    ${statCard('Orders today · طلبات اليوم', '◴', t.orders, '↗ 8.4%', 'vs. yesterday · مقارنة بالأمس', true)}
    ${statCard('Average order · متوسط الطلب', '⌁', fmt(avg), '↗ 3.2%', 'vs. yesterday · مقارنة بالأمس', true)}
    ${statCard('Table occupancy · إشغال الترابيزات', '♧', '72%', '↘ 2.1%', 'vs. yesterday · مقارنة بالأمس', false)}
  </section>
  <section class="content-grid">
    <div>
      <div class="panel"><div class="panel-top"><div><h3>Revenue overview · نظرة الإيرادات</h3><p class="panel-sub">Your earnings over the past 7 days · أرباحك آخر ٧ أيام</p></div><button class="select" data-goto="reports">This week · الأسبوع ⌄</button></div>
        ${chart(RANGES.week.labels, RANGES.week.values, hot)}
        <div class="legend"><span><i class="dot"></i>Best day · أفضل يوم</span><span><i class="dot green"></i>Previous days · باقي الأيام</span></div>
      </div>
      <div class="panel orders"><div class="panel-top"><div><h3>Recent orders · أحدث الطلبات</h3><p class="panel-sub">The latest activity from your floor · آخر حركة من الصالة</p></div><button class="select" data-goto="cashier">View all → · عرض الكل →</button></div>
        ${orders.slice(0, 4).map(orderRow).join('')}
      </div>
    </div>
    <div>
      <div class="panel"><div class="panel-top"><div><h3>Live floor · حركة الصالة</h3><p class="panel-sub">Current table occupancy · إشغال الترابيزات حاليًا</p></div><span class="status">Live now · مباشر الآن</span></div>
        <div class="occupancy"><div class="ring"><b>72%</b></div><div><b>18 of ${settings.tables} tables · ترابيزة من ${settings.tables}</b><p>You're having a busy service.<br>Keep the rhythm going.<br>يوم مزحوم — واصل الإيقاع.</p></div></div>
        <div class="mini-list"><div class="mini-row"><span>Available · متاح</span><b>${Math.max(settings.tables - 18, 0)} tables · ترابيزة</b></div><div class="mini-row"><span>Guests seated · عملاء جالسون</span><b>54 guests · عميل</b></div><div class="mini-row"><span>Avg. wait time · متوسط الانتظار</span><b>08 min · دقيقة</b></div></div>
      </div>
      <div class="panel" style="margin-top:17px"><div class="panel-top"><div><h3>Quick actions · إجراءات سريعة</h3><p class="panel-sub">Common tasks, one click away · مهامك بنقرة واحدة</p></div></div>
        <div class="quick">
          <button data-goto="pos"><span>▣</span>New order · طلب جديد</button>
          <button data-goto="menu"><span>▤</span>Add menu item · إضافة صنف</button>
          <button data-goto="inventory"><span>◇</span>Check inventory · فحص المخزون</button>
          <button data-goto="reports"><span>▰</span>View reports · التقارير</button>
        </div>
      </div>
    </div>
  </section>`;
}

function rPos() {
  const pills = ['All'].concat(CATS).map(c => `<button class="pill${state.posCat === c ? ' active' : ''}" data-action="cat" data-cat="${c}">${c === 'All' ? 'All · الكل' : c}</button>`).join('');
  return `<section class="pos-grid">
    <section>
      <div class="toolbar"><div class="pills grow">${pills}</div><input class="input" style="min-width:180px" placeholder="Search the menu… · ابحث في المنيو" value="${esc(state.posQ)}" data-input="pos-q"></div>
      <div class="menu-cards" id="menu-cards">${posCards()}</div>
    </section>
    ${cartPanel()}
  </section>`;
}

const NEXT_LABEL = { new: 'Start preparing ▸ · ابدأ التحضير', preparing: 'Mark ready ✓ · جاهز للتقديم', ready: 'Serve & clear ✔ · تم التقديم' };

function ticketCard(t) {
  return `<div class="ticket"><div class="tk-head"><b>#${t.id} · ${esc(t.source)}</b><span class="mins">${t.mins} min · د</span></div><ul class="tk-items">${t.items.map(i => `<li>${esc(i.n)}${i.ar ? ` <i class="tk-ar" dir="rtl" lang="ar">${esc(i.ar)}</i>` : ''}<span>×${i.q}</span></li>`).join('')}</ul><button class="tk-btn" data-action="tadv" data-id="${t.id}">${NEXT_LABEL[t.status]}</button></div>`;
}

function rBoard(station, subtitle) {
  const cols = [['new', 'New tickets · جديدة'], ['preparing', 'Preparing · قيد التحضير'], ['ready', 'Ready · جاهز للتقديم']];
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
    ${statCard('Open tickets · التذاكر المفتوحة', '◉', open.length, '● ', 'live count · مباشر', true)}
    ${statCard('Ready to serve · جاهز للتقديم', '♨', open.filter(o => o.status === 'Ready').length, '● ', 'waiting on floor · منتظرين على الصالة', true)}
    ${statCard('Settled today · تم تحصيله اليوم', '◫', done.length, '● ', 'completed orders · طلبات مكتملة', true)}
    ${statCard('Collected today · المحصل اليوم', 'E£', fmt(collected), '● ', 'cash · card · wallet · نقدي · بطاقة · محفظة', true)}
  </section>
  <div class="panel orders" style="margin-top:17px"><div class="panel-top"><div><h3>Tickets on the floor · تذاكر الصالة</h3><p class="panel-sub">Settle each order as it lands · حصّل كل طلب أول بأول</p></div></div>
    ${open.length ? open.map(o => {
      const act = [];
      if (o.due > 0) act.push(`<button class="pill" data-action="settle-open" data-no="${o.no}">Settle ${fmt(o.due)} · تحصيل</button>`);
      if (o.status === 'Preparing') act.push(`<button class="pill" data-action="mark-ready" data-no="${o.no}">Mark ready · جاهز</button>`);
      else act.push(`<button class="btn" data-action="complete" data-no="${o.no}">Complete · إغلاق</button>`);
      return `<div class="order"><div class="order-no">#${o.no}</div><div class="order-info"><b>${esc(placeLabel(o))}</b><small>${o.items} items · أصناف · ${o.time}${o.method ? ' · ' + payBi(o.method) : ''}${o.staff ? ' · ' + esc(o.staff) : ''}</small></div><div class="price">${fmt(o.total)}</div>${o.due > 0 ? `<span class="tag low">Due ${fmt(o.due)} · مستحق</span>` : ''}<span class="status${o.status === 'Preparing' ? ' wait' : ' ready'}">${stBi(o.status)}</span>${act.join('')}</div>`;
    }).join('') : '<div class="empty" style="margin-top:16px">No open tickets —<br>the floor is all caught up<br>لا توجد تذاكر مفتوحة — الصالة تمام</div>'}
  </div>`;
}

function menuFiltered() {
  const qq = state.menuQ.trim().toLowerCase();
  return MENU.filter(m => (state.menuCat === 'All' || m.cat === state.menuCat) && (!qq || m.name.toLowerCase().includes(qq) || (m.ar || '').includes(qq)));
}

function menuPages() { return Math.max(1, Math.ceil(menuFiltered().length / state.menuPer)); }

function menuRows() {
  const list = menuFiltered();
  if (!list.length) return '<tr><td colspan="5"><div class="empty">No items match — try a different search · لا توجد نتائج — جرّب بحثًا آخر</div></td></tr>';
  const start = (state.menuPage - 1) * state.menuPer;
  return list.slice(start, start + state.menuPer).map(m => `<tr>
    <td><b class="name">${esc(m.name)}</b>${m.ar ? `<span class="ar" dir="rtl" lang="ar">${esc(m.ar)}</span>` : ''}${m.desc ? `<span class="desc">${esc(m.desc)}</span>` : ''}</td>
    <td><span class="mc-tag">${catBi(m.cat)}</span></td>
    <td><b>${fmt(m.price)}</b></td>
    <td><label class="switch"><input type="checkbox" data-change="avail" data-id="${m.id}"${m.avail ? ' checked' : ''}><i></i></label></td>
    <td style="text-align:right;white-space:nowrap"><button class="icon-btn icon-sm" data-action="menu-edit" data-id="${m.id}" title="Edit">✎</button> <button class="icon-x" data-action="menu-del" data-id="${m.id}" title="Delete">✕</button></td>
  </tr>`).join('');
}

function pageList(pages, cur) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const seen = new Set([1, 2, cur - 1, cur, cur + 1, pages - 1, pages].filter(p => p >= 1 && p <= pages));
  const arr = [...seen].sort((a, b) => a - b);
  const out = [];
  arr.forEach((p, i) => { if (i && p - arr[i - 1] > 1) out.push('…'); out.push(p); });
  return out;
}

function menuPager() {
  const total = menuFiltered().length;
  const pages = menuPages();
  const cur = Math.min(state.menuPage, pages);
  const start = total ? (cur - 1) * state.menuPer + 1 : 0;
  const end = Math.min(total, cur * state.menuPer);
  const nums = pageList(pages, cur).map(p => p === '…' ? '<span class="pg-dots">…</span>' : `<button class="pg-num${p === cur ? ' active' : ''}" data-action="mpage" data-p="${p}">${p}</button>`).join('');
  return `<div class="pg-info">Showing ${start}–${end} of ${total} items · عرض ${start}–${end} من ${total}</div><div class="pg-controls">
    <button class="pg-num"${cur > 1 ? '' : ' disabled'} data-action="mpage" data-p="${cur - 1}">‹ Prev · السابق</button>
    ${nums}
    <button class="pg-num"${cur < pages ? '' : ' disabled'} data-action="mpage" data-p="${cur + 1}">Next · التالي ›</button>
    <select class="pg-per" data-change="mper">${[10, 25, 50].map(n => `<option value="${n}"${state.menuPer === n ? ' selected' : ''}>${n} / page · لكل صفحة</option>`).join('')}</select>
  </div>`;
}

function refreshMenuTable(resetPage) {
  if (resetPage) state.menuPage = 1;
  state.menuPage = Math.min(state.menuPage, menuPages());
  const tb = q('#menu-tbody');
  if (tb) tb.innerHTML = menuRows();
  const pg = q('#menu-pager');
  if (pg) pg.innerHTML = menuPager();
}

function rMenuItems() {
  return `<div class="toolbar">
      <input class="input grow" placeholder="Search menu items… · ابحث في المنيو" value="${esc(state.menuQ)}" data-input="menu-q">
      <select class="input" data-change="menu-cat">${['All'].concat(CATS).map(c => `<option value="${c}"${state.menuCat === c ? ' selected' : ''}>${c === 'All' ? 'All · الكل' : catBi(c)}</option>`).join('')}</select>
      <button class="btn" data-action="menu-add-open">＋ Add item · إضافة صنف</button>
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Item · الصنف</th><th>Category · الفئة</th><th>Price · السعر</th><th>Available · متاح</th><th></th></tr></thead><tbody id="menu-tbody">${menuRows()}</tbody></table></div>
    <div id="menu-pager" class="pager">${menuPager()}</div>`;
}

function invRows() {
  const list = INV.filter(i => state.invF === 'All' || invStatus(i) === state.invF);
  if (!list.length) return '<tr><td colspan="6"><div class="empty">Nothing here yet — add your first stock item<br>لا يوجد شيء بعد — أضف أول صنف للمخزون</div></td></tr>';
  return list.map(i => {
    const st = invStatus(i);
    const cls = st === 'Out' ? 'out' : st === 'Low' ? 'low' : 'ok';
    const stAr = { In: 'متاح', Low: 'منخفض', Out: 'نفد' }[st] || '';
    return `<tr><td><b class="name">${esc(i.name)}</b></td><td>${invCatBi(i.cat)}</td><td><b>${i.qty} ${i.unit}</b></td><td>${i.par} ${i.unit}</td><td><span class="tag ${cls}">${st}${stAr ? ' · ' + stAr : ''}</span></td><td style="text-align:right"><button class="pill" data-action="restock" data-id="${i.id}">Restock +${i.par} · توريد</button></td></tr>`;
  }).join('');
}

function rInventory() {
  const low = INV.filter(i => invStatus(i) === 'Low').length;
  const out = INV.filter(i => invStatus(i) === 'Out').length;
  const chips = [['All', INV.length, 'الكل'], ['Low', low, 'منخفض'], ['Out', out, 'نفد']].map(([k, n, ar]) => `<button class="chip${state.invF === k ? ' active' : ''}" data-action="chip" data-f="${k}">${k} · ${ar}<i>${n}</i></button>`).join('');
  return `<div class="toolbar">
      <div class="chips grow">${chips}</div>
      <button class="btn" data-action="stock-add-open">＋ Add stock item · إضافة صنف</button>
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Item · الصنف</th><th>Category · الفئة</th><th>On hand · المتوفر</th><th>Par level · حد الطلب</th><th>Status · الحالة</th><th></th></tr></thead><tbody id="inv-tbody">${invRows()}</tbody></table></div>`;
}

function prepProgress() {
  const total = PREP.length;
  const done = PREP.filter(p => p.done).length;
  const pct = total ? Math.round(done / total * 100) : 0;
  return `<div style="display:flex;justify-content:space-between;font-size:12px"><b>${done} of ${total} tasks done · ${done} من ${total} مهمة</b><span style="color:var(--green);font-weight:800">${pct}%</span></div><div class="progress"><i style="width:${pct}%"></i></div>`;
}

const STATIONS_AR = { 'Cold kitchen': 'المطبخ البارد', 'Hot line': 'الخط الساخن', 'Grill': 'الجريل', 'Beverage': 'المشروبات' };

function rPrep() {
  return `<div class="panel" id="prep-progress">${prepProgress()}</div>
  <form class="prep-form" data-form="prep-add">
    <input class="input grow" name="task" placeholder="New prep task… e.g. Peel potatoes — 4 kg · مهمة جديدة… مثال: تقشير بطاطس — ٤ كيلو" required>
    <select class="input" name="station">${STATIONS.map(s => `<option value="${s}">${s} · ${STATIONS_AR[s] || ''}</option>`).join('')}</select>
    <button class="btn" type="submit">Add task · إضافة مهمة</button>
  </form>` +
  STATIONS.map(st => {
    const list = PREP.filter(p => p.station === st);
    if (!list.length) return '';
    return `<div class="panel orders"><h3 style="font-size:15px">${st} · ${STATIONS_AR[st] || ''}</h3>${list.map(p => `
      <div class="prep-item"><input type="checkbox" data-change="prepd" data-id="${p.id}"${p.done ? ' checked' : ''}><span class="grow${p.done ? ' strike' : ''}">${esc(p.task)}</span><button class="icon-x" data-action="del-prep" data-id="${p.id}">✕</button></div>`).join('')}</div>`;
  }).join('');
}

function rShifts() {
  const os = currentOpen();
  const openCard = os
    ? `<div class="panel shift-card"><div><h3 style="font-size:16px">Shift ${os.id} · open · وردية مفتوحة</h3><p class="panel-sub">Opened at ${os.opened} by ${esc(os.by)} · فُتحت ${os.opened} بواسطة ${esc(os.by)}</p>
        <div class="shift-meta">
          <div class="sm"><span>Opening float · الافتتاحي</span><b>${fmt(os.float)}</b></div>
          <div class="sm"><span>Cash sales · مبيعات كاش</span><b>${fmt(os.cash)}</b></div>
          <div class="sm"><span>Expected in drawer · المتوقع في الدراج</span><b>${fmt(os.float + os.cash)}</b></div>
        </div></div>
        <button class="btn ghost" data-action="shift-close-open">Close shift & count drawer · إغلاق الوردية وجرد الدراج</button></div>`
    : `<div class="panel" style="text-align:center;padding:34px"><h3>No shift is open right now · لا توجد وردية مفتوحة حاليًا</h3><p class="panel-sub" style="margin-bottom:18px">Open a cash shift to start taking payments at the counter. · افتح وردية كاش لبدء التحصيل على الكاونتر.</p><button class="btn" data-action="shift-open-modal">◫ Open cash shift · فتح وردية</button></div>`;
  const history = SHIFTS.filter(s => s.status === 'closed');
  return `${openCard}
  <div class="panel orders" style="margin-top:17px"><div class="panel-top"><div><h3>Shift history · سجل الورديات</h3><p class="panel-sub">Closed shifts and their drawer variance · الورديات المغلقة وعجز الدراج</p></div></div>
    ${history.length ? `<div class="tbl-wrap" style="margin-top:8px;box-shadow:none;border:0"><table class="tbl"><thead><tr><th>Shift · الوردية</th><th>Cashier · الكاشير</th><th>When · الفترة</th><th>Cash sales · الكاش</th><th>Counted · الجرد</th><th>Variance · العجز</th></tr></thead><tbody>${history.map(s => {
      const v = s.variance;
      return `<tr><td><b>${s.id}</b></td><td>${esc(s.by)}</td><td>${s.day || ''} · ${s.opened} → ${s.closed}</td><td>${fmt(s.cash)}</td><td>${fmt(s.counted)}</td><td><span class="tag ${v < 0 ? 'low' : 'ok'}">${v > 0 ? '+' : v < 0 ? '−' : ''}${fmt(Math.abs(v)).replace('E£ ', '')} E£</span></td></tr>`;
    }).join('')}</tbody></table></div>` : '<div class="empty" style="margin-top:16px">No closed shifts yet · لا توجد ورديات مغلقة بعد</div>'}
  </div>`;
}

function rReports() {
  const r = RANGES[state.range];
  const avg = Math.round(r.rev / r.orders);
  const hot = r.values.indexOf(Math.max(...r.values));
  const mx = Math.max(...r.top.map(t => t[1]));
  return `<section class="grid">
      ${statCard(r.label + ' revenue · إيرادات ' + r.label, 'E£', fmt(r.rev), '↗ healthy · ممتاز', 'all channels · كل القنوات', true)}
      ${statCard('Orders · الطلبات', '◴', r.orders.toLocaleString('en-US'), '● ', r.label.toLowerCase(), true)}
      ${statCard('Average ticket · متوسط الفاتورة', '⌁', fmt(avg), '↗ steady · ثابت', 'per order · للطلب', true)}
      ${statCard('Top category · الفئة الأقوى', '▤', r.cat, '★ ', 'by sales · بالمبيعات', true)}
    </section>
    <section class="content-grid">
      <div class="panel"><div class="panel-top"><div><h3>${r.chartTitle}</h3><p class="panel-sub">Amounts in Egyptian pounds · المبالغ بالجنيه المصري</p></div>
        <select class="input" data-change="range">${Object.keys(RANGES).map(k => `<option value="${k}"${state.range === k ? ' selected' : ''}>${RANGES[k].label}</option>`).join('')}</select></div>
        ${chart(r.labels, r.values, hot)}
        <div class="legend"><span><i class="dot"></i>Best period · أفضل فترة</span><span><i class="dot green"></i>Others · الباقي</span></div>
      </div>
      <div>
        <div class="panel"><div class="panel-top"><div><h3>Payment mix · طرق الدفع</h3><p class="panel-sub">How guests paid · كيف دفع العملاء</p></div></div>
          <div class="occupancy"><div class="ring" style="background:${mixBg(r.mix)}"><b>${r.mix.Cash}%</b></div>
          <div><b>Cash still leads · الكاش لسه متصدر</b><p>Keep small change ready.<br>Wallets are growing steadily.<br>جهّز فكة كفاية — والمحافظ بتزيد.</p></div></div>
          <div class="legend"><span><i class="dot"></i>Cash ${r.mix.Cash}% · نقدي</span><span><i class="dot green"></i>Card ${r.mix.Card}% · بطاقة</span><span><i class="dot coral"></i>Wallet ${r.mix.Wallet}% · محفظة</span></div>
        </div>
        <div class="panel" style="margin-top:17px"><div class="panel-top"><div><h3>Best sellers · الأكثر مبيعًا</h3><p class="panel-sub">Top 5 items by revenue · أعلى ٥ أصناف بالإيراد</p></div></div>
          <div style="margin-top:10px">${r.top.map(t => `<div class="rb"><div class="rb-top"><b>${t[0]}</b><span>${fmt(t[1])}</span></div><div class="rb-track"><div class="rb-fill" style="width:${Math.round(t[1] / mx * 100)}%"></div></div></div>`).join('')}</div>
        </div>
      </div>
    </section>`;
}

const TEAM = [
  { ini: 'OH', name: 'Omar Hamid · عمر حميد', role: 'Owner · مالك' },
  { ini: 'SA', name: 'Sara Adel · سارة عادل', role: 'Cashier · كاشير' },
  { ini: 'MR', name: 'Mahmoud Reda · محمود رضا', role: 'Head chef · شيف التنفيذ' },
  { ini: 'YS', name: 'Youssef Samir · يوسف سمير', role: 'Floor captain · كابتن صالة' },
  { ini: 'AN', name: 'Aya Nabil · آية نبيل', role: 'Waitress · ويترس' }
];

function rSettings() {
  return `<section class="content-grid">
    <form class="panel" data-form="settings">
      <div class="panel-top"><div><h3>Restaurant profile · بيانات المطعم</h3><p class="panel-sub">Shown across the POS and receipts · تظهر في النظام وفي الفواتير</p></div></div>
      <label class="field" style="margin-top:14px"><span>Restaurant name · اسم المطعم</span><input name="name" required value="${esc(settings.name)}"></label>
      <div class="row2">
        <label class="field"><span>Phone · التليفون</span><input name="phone" value="${esc(settings.phone)}"></label>
        <label class="field"><span>Address · العنوان</span><input name="address" value="${esc(settings.address)}"></label>
      </div>
      <div class="row3">
        <label class="field"><span>VAT % · الضريبة %</span><input name="vat" type="number" min="0" max="50" step="0.5" value="${settings.vat}"></label>
        <label class="field"><span>Service % · الخدمة %</span><input name="service" type="number" min="0" max="30" step="0.5" value="${settings.service}"></label>
        <label class="field"><span>Tables · عدد الترابيزات</span><input name="tables" type="number" min="1" max="200" value="${settings.tables}"></label>
      </div>
      <label class="field"><span>Currency · العملة</span><input value="EGP — Egyptian Pound (E£) · جنيه مصري" disabled></label>
      <button class="btn" type="submit">Save settings · حفظ الإعدادات</button>
    </form>
    <div>
      <div class="panel"><div class="panel-top"><div><h3>Team · الفريق</h3><p class="panel-sub">People with access today · المتاحين على النظام اليوم</p></div><button class="pill" data-action="toast" data-msg="Team management coming soon · إدارة الفريق قريبًا">Manage · إدارة</button></div>
        <div class="orders" style="margin-top:6px">${TEAM.map(t => `<div class="order"><div class="avatar">${t.ini}</div><div class="order-info"><b>${t.name}</b><small>${t.role}</small></div><span class="status">Active · نشط</span></div>`).join('')}</div>
      </div>
      <div class="panel" style="margin-top:17px"><div class="panel-top"><div><h3>About money display · عن عرض الأسعار</h3></div></div>
        <p class="panel-sub" style="line-height:1.7;margin-top:12px">Every amount in this system is shown in Egyptian Pounds (E£). VAT and service charge are added automatically at checkout using the rates above.<br>كل المبالغ في النظام بالجنيه المصري — والضريبة والخدمة بيتضافوا تلقائي عند تأكيد الطلب حسب النسب اللي فوق.</p>
      </div>
    </div>
  </section>`;
}

function itemModal(m) {
  return `<form data-form="item">
    <h3>${m ? 'Edit menu item · تعديل صنف' : 'Add menu item · إضافة صنف'}</h3>
    <p class="sub">${m ? 'Update the details of this dish. · حدّث بيانات الصنف.' : 'It will appear instantly on the POS screen. · هيظهر فورًا على شاشة نقطة البيع.'}</p>
    <input type="hidden" name="id" value="${m ? m.id : ''}">
    <label class="field"><span>Name · الاسم</span><input name="name" required value="${m ? esc(m.name) : ''}" placeholder="e.g. Tea · مثال: شاي"></label>
    <label class="field"><span>Arabic name · الاسم بالعربي</span><input name="ar" dir="rtl" lang="ar" value="${m && m.ar ? esc(m.ar) : ''}" placeholder="شاي"></label>
    <label class="field"><span>Description · optional · الوصف (اختياري)</span><input name="desc" value="${m && m.desc ? esc(m.desc) : ''}" placeholder="Shown under the item name · يظهر تحت اسم الصنف"></label>
    <div class="row2">
      <label class="field"><span>Category · الفئة</span><select name="cat">${CATS.map(c => `<option value="${c}"${m && m.cat === c ? ' selected' : ''}>${catBi(c)}</option>`).join('')}</select></label>
      <label class="field"><span>Price · EGP · السعر بالجنيه</span><input name="price" type="number" min="1" required value="${m ? m.price : ''}" placeholder="250"></label>
    </div>
    <label class="check"><input type="checkbox" name="avail"${!m || m.avail ? ' checked' : ''}> Available right now · متاح الآن</label>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel · إلغاء</button><button class="btn" type="submit">${m ? 'Save changes · حفظ التعديلات' : 'Add item · إضافة الصنف'}</button></div>
  </form>`;
}

function stockModal() {
  return `<form data-form="stock">
    <h3>Add stock item · إضافة صنف للمخزون</h3>
    <p class="sub">Track it in inventory with a par level for low-stock alerts. · تتبعه في المخزون مع حد طلب لتنبيهات النقص.</p>
    <label class="field"><span>Name · الاسم</span><input name="name" required placeholder="e.g. Butter"></label>
    <div class="row2">
      <label class="field"><span>Category · الفئة</span><select name="cat">${INV_CATS.map(c => `<option value="${c}">${invCatBi(c)}</option>`).join('')}</select></label>
      <label class="field"><span>Unit · الوحدة</span><select name="unit">${UNITS.map(u => `<option>${u}</option>`).join('')}</select></label>
    </div>
    <div class="row2">
      <label class="field"><span>Quantity on hand · الكمية الحالية</span><input name="qty" type="number" min="0" required placeholder="10"></label>
      <label class="field"><span>Par level · حد الطلب</span><input name="par" type="number" min="1" required placeholder="8"></label>
    </div>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel · إلغاء</button><button class="btn" type="submit">Add item · إضافة الصنف</button></div>
  </form>`;
}

function shiftOpenModal() {
  return `<form data-form="shift-open">
    <h3>Open cash shift · فتح وردية كاش</h3>
    <p class="sub">Count the drawer and record the opening float. · جرّد الدراج وسجّل مبلغ الافتتاح.</p>
    <label class="field"><span>Cashier · الكاشير</span><input name="by" required value="Omar Hamid"></label>
    <label class="field"><span>Opening float · EGP · الافتتاحي بالجنيه</span><input name="float" type="number" min="0" required value="2000"></label>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel · إلغاء</button><button class="btn" type="submit">Open shift · فتح الوردية</button></div>
  </form>`;
}

function shiftCloseModal(os) {
  return `<form data-form="shift-close">
    <input type="hidden" name="id" value="${os.id}">
    <h3>Close shift ${os.id} · إغلاق الوردية ${os.id}</h3>
    <p class="sub">Cash sales so far: ${fmt(os.cash)} · Expected in drawer: ${fmt(os.float + os.cash)}<br>المبيعات كاش حتى الآن: ${fmt(os.cash)} · المتوقع في الدراج: ${fmt(os.float + os.cash)}</p>
    <label class="field"><span>Counted cash in drawer · EGP · النقد المجرود في الدراج بالجنيه</span><input name="counted" type="number" min="0" required placeholder="${os.float + os.cash}"></label>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel · إلغاء</button><button class="btn" type="submit">Close shift · إغلاق الوردية</button></div>
  </form>`;
}

const VIEWS = {
  dashboard: { title: 'Dashboard · لوحة التحكم', render: rDashboard },
  pos: { title: 'Point of Sale · نقطة البيع', render: rPos },
  cashier: { title: 'Cashier · الكاشير', render: rCashier },
  kitchen: { title: 'Kitchen Display · شاشة المطبخ', render: () => rBoard('kitchen', 'Food line — move tickets as they cook · خط المطبخ — حرّك التذاكر أثناء التحضير') },
  bar: { title: 'Bar Station · محطة البار', render: () => rBoard('bar', 'Coffee & drinks — keep the cups coming · القهوة والمشروبات — استمر في التقديم') },
  menu: { title: 'Menu Items · أصناف المنيو', render: rMenuItems },
  inventory: { title: 'Inventory · المخزون', render: rInventory },
  prep: { title: 'Prep List · قائمة التحضير', render: rPrep },
  shifts: { title: 'Cash Shifts · ورديات الكاش', render: rShifts },
  reports: { title: 'Reports · التقارير', render: rReports },
  settings: { title: 'Settings · الإعدادات', render: rSettings }
};

async function createOrder(inp) {
  const total = Math.round(cartTotals().total);
  const paid = Math.max(0, Math.min(Math.round(inp.paid || 0), total));
  SEQ += 1;
  const lines = state.cart.map(c => { const m = byId(c.id); return m ? { id: c.id, name: m.name, ar: m.ar || '', cat: m.cat, qty: c.qty, price: m.price } : null; }).filter(Boolean);
  const o = { no: SEQ, type: inp.type || ORDER_TYPES[0], table: inp.table || null, room: inp.room || null, staff: inp.staff || '', items: lines.reduce((a, l) => a + l.qty, 0), total, paid, due: total - paid, method: inp.method || 'Cash', status: 'Preparing', time: nowLabel(), lines };
  if (SERVER) {
    try {
      const r = await post('orders/create', { type: o.type, table: o.table, room: o.room, staff: o.staff, items: o.items, total: o.total, paid: o.paid, method: o.method, status: o.status, timeLabel: o.time, lines });
      if (r.no) { o.no = r.no; SEQ = Math.max(SEQ, r.no); }
    } catch (e) { syncFail(); }
  }
  orders.unshift(o);
  const mkTicket = (station, items, mins) => { const t = { id: 'T-' + o.no + (station === 'bar' ? 'B' : ''), source: placeLabel(o), station, mins, status: 'new', items }; TICKETS.unshift(t); syncUp('tickets', t); };
  const food = lines.filter(l => !BEV_CATS.includes(l.cat)).map(l => ({ n: l.name, ar: l.ar, q: l.qty }));
  const drinks = lines.filter(l => BEV_CATS.includes(l.cat)).map(l => ({ n: l.name, ar: l.ar, q: l.qty }));
  if (food.length) mkTicket('kitchen', food, 10);
  if (drinks.length) mkTicket('bar', drinks, 4);
  const os = currentOpen();
  if (os && o.method === 'Cash') os.cash += o.paid;
  return o;
}

function openCheckout() {
  if (!state.cart.length) { toast('Cart is empty — add items first · العربة فاضية — ضيف أصناف الأول'); return; }
  openModal(checkoutModal());
  coDue();
}

function checkoutModal() {
  const tt = cartTotals();
  return `<form data-form="checkout">
    <h3>New order · طلب جديد</h3>
    <p class="sub">${cartCount()} items · أصناف · Total · الإجمالي ${fmt(tt.total)} · incl. service ${settings.service}% + VAT ${settings.vat}% · شامل الخدمة والضريبة</p>
    <div class="row2">
      <label class="field"><span>Type · النوع</span><select name="type">${ORDER_TYPES.map(t => `<option>${t}</option>`).join('')}</select></label>
      <label class="field"><span>Staff · الموظف</span><select name="staff">${TEAM.map(s => `<option>${esc(s.name)}</option>`).join('')}</select></label>
    </div>
    <div class="row2">
      <label class="field"><span>Room · الغرفة</span><select name="room"><option value="">—</option>${ROOMS.map(r => `<option>${r}</option>`).join('')}</select></label>
      <label class="field"><span>Table · ترابيزة</span><select name="table"><option value="">—</option>${tablesOpts()}</select></label>
    </div>
    <div class="row2">
      <label class="field"><span>Payment · الدفع</span><select name="method" data-change="co-method">${PAY_METHODS.map(m => `<option>${m}</option>`).join('')}</select></label>
      <label class="field"><span>Paid · المدفوع</span><input id="co-paid" name="paid" data-input="co-paid" type="number" min="0" value="${Math.round(tt.total)}"></label>
    </div>
    <p class="sub" id="co-due" style="font-weight:700"></p>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel · إلغاء</button><button class="btn" type="submit">Confirm · تأكيد الطلب</button></div>
  </form>`;
}

function coDue() {
  const paidEl = q('#co-paid');
  const el = q('#co-due');
  if (!paidEl || !el) return;
  const total = Math.round(cartTotals().total);
  const paid = Math.max(0, Math.round(parseFloat(paidEl.value) || 0));
  const d = total - paid;
  if (d > 0) { el.textContent = 'Remaining due · المتبقي: ' + fmt(d); el.style.color = '#b66650'; }
  else if (d < 0) { el.textContent = 'Change · الباقي للعميل: ' + fmt(-d); el.style.color = '#4d8560'; }
  else { el.textContent = 'Fully paid · مدفوع بالكامل'; el.style.color = '#4d8560'; }
}

function settleModal(o) {
  return `<form data-form="settle">
    <input type="hidden" name="no" value="${o.no}">
    <h3>Settle order #${o.no} · تحصيل الطلب #${o.no}</h3>
    <p class="sub">Total ${fmt(o.total)} · Already paid ${fmt(o.paid)} · Remaining ${fmt(o.due)}<br>الإجمالي ${fmt(o.total)} · المدفوع ${fmt(o.paid)} · المتبقي ${fmt(o.due)}</p>
    <label class="field"><span>Amount received · المبلغ المستلم</span><input name="amt" type="number" min="0" max="${o.due}" required value="${o.due}"></label>
    <label class="field"><span>Received as · طريقة الاستلام</span><select name="how">${['Cash', 'Vodafone Cash', 'InstaPay', 'Bank Transfer', 'Card', 'Other'].map(m => `<option value="${m}">${payBi(m)}</option>`).join('')}</select></label>
    <div class="modal-actions"><button type="button" class="btn ghost" data-action="close-modal">Cancel · إلغاء</button><button class="btn" type="submit">Settle · تحصيل</button></div>
  </form>`;
}

function setOrder(no, st) {
  const o = orders.find(x => x.no === Number(no));
  if (!o) return;
  o.status = st;
  syncUp('orders', o);
  render();
  toast('Order #' + no + ' → ' + stBi(st));
}

async function advanceTicket(id) {
  const t = TICKETS.find(x => x.id === id);
  if (!t) return;
  const flow = ['new', 'preparing', 'ready'];
  const i = flow.indexOf(t.status);
  if (SERVER) {
    try {
      const r = await post('tickets/advance', { id });
      if (r.removed) {
        TICKETS = TICKETS.filter(x => x.id !== id);
        toast('Ticket ' + id + ' served — nice work · التذكرة اتحكمت — برافو');
      } else {
        t.status = r.status;
        toast('Ticket ' + id + ' → ' + t.status);
      }
    } catch (e) { syncFail(); }
    render();
    return;
  }
  if (i >= flow.length - 1) {
    TICKETS = TICKETS.filter(x => x.id !== id);
    toast('Ticket ' + id + ' served — nice work · التذكرة اتحكمت — برافو');
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
      el.textContent = p.type === 'password' ? 'Show · إظهار' : 'Hide · إخفاء';
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
      toast(m.name + ' added to the order · اتضاف للطلب');
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
    case 'clear-cart': state.cart = []; render(); toast('Order cleared · تم تفريغ الطلب'); break;
    case 'cat': state.posCat = el.dataset.cat; q('#page-title').textContent = VIEWS.pos.title; qa('.pill').forEach(p => p.classList.toggle('active', p.dataset.cat === state.posCat)); q('#menu-cards').innerHTML = posCards(); break;
    case 'mpage': {
      const p = parseInt(el.dataset.p, 10);
      if (!isNaN(p) && p >= 1) { state.menuPage = p; refreshMenuTable(); }
      break;
    }
    case 'checkout-open': openCheckout(); break;
    case 'settle-open': { const o = orders.find(x => x.no === Number(el.dataset.no)); if (o) openModal(settleModal(o)); break; }
    case 'tadv': advanceTicket(id); break;
    case 'mark-ready': setOrder(el.dataset.no, 'Ready'); break;
    case 'complete': setOrder(el.dataset.no, 'Completed'); break;
    case 'chip': state.invF = el.dataset.f; qa('.chip').forEach(c => c.classList.toggle('active', c.dataset.f === state.invF)); q('#inv-tbody').innerHTML = invRows(); break;
    case 'restock': {
      const it = INV.find(x => x.id === id);
      if (!it) break;
      it.qty += Math.max(it.par, 1);
      syncUp('inventory', it); render();
      toast(it.name + ' restocked — now ' + it.qty + ' ' + it.unit + ' · تم التوريد — صار ' + it.qty + ' ' + it.unit);
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
      syncDel('menu', id); refreshMenuTable();
      toast(nm + ' removed from the menu · اتنشال من المنيو');
      break;
    }
    case 'del-prep': {
      PREP = PREP.filter(p => p.id !== id);
      syncDel('prep', id); render();
      break;
    }
    case 'shift-open-modal':
      if (currentOpen()) { toast('A shift is already open · في وردية مفتوحة بالفعل'); break; }
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
  if (inp === 'menu-q') { state.menuQ = e.target.value; refreshMenuTable(true); }
  if (inp === 'co-paid') coDue();
}

function onChange(e) {
  const ch = e.target.dataset.change;
  if (!ch) return;
  const t = e.target;
  if (ch === 'co-method') {
    const tt = cartTotals();
    const free = t.value === 'Unpaid' || t.value === 'Room Tab';
    const paidEl = q('#co-paid');
    if (paidEl) paidEl.value = free ? 0 : Math.round(tt.total);
    coDue();
    return;
  }
  if (ch === 'menu-cat') { state.menuCat = t.value; refreshMenuTable(true); return; }
  if (ch === 'mper') { state.menuPer = parseInt(t.value, 10) || 10; state.menuPage = 1; refreshMenuTable(); return; }
  if (ch === 'range') { state.range = t.value; render(); return; }
  if (ch === 'avail') {
    const m = byId(t.dataset.id);
    if (!m) return;
    m.avail = t.checked;
    syncUp('menu', m);
    toast(m.name + (t.checked ? ' is back on the menu · رجع للمنيو' : ' marked unavailable · موقوف مؤقتًا'));
    return;
  }
  if (ch === 'prepd') {
    const p = PREP.find(x => x.id === t.dataset.id);
    if (!p) return;
    p.done = t.checked;
    syncUp('prep', p);
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

async function onSubmit(e) {
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
      toast('Welcome back, Omar — you are signed in as owner · أهلاً بعودتك يا عمر — داخل كمالك');
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

  if (kind === 'checkout') {
    const type = val('type') || ORDER_TYPES[0];
    const room = val('room');
    const table = val('table');
    const staff = val('staff');
    const method = val('method') || 'Cash';
    const paid = Math.max(0, Math.round(parseFloat(val('paid')) || 0));
    if (type === 'Dine-in' && !table && !room) { toast('اختر ترابيزة أو غرفة · choose a table or a room'); return; }
    if (method === 'Room Tab' && !room) { toast('Room Tab needs a room · اختر غرفة'); return; }
    const o = await createOrder({ type, table, room, staff, method, paid });
    const hasFood = o.lines.some(l => !BEV_CATS.includes(l.cat));
    const hasDrink = o.lines.some(l => BEV_CATS.includes(l.cat));
    const destMap = { 'Kitchen': 'Kitchen · المطبخ', 'Bar': 'Bar · البار', 'Kitchen + Bar': 'Kitchen + Bar · المطبخ + البار' };
    const dest = destMap[hasFood && hasDrink ? 'Kitchen + Bar' : hasFood ? 'Kitchen' : 'Bar'];
    state.cart = [];
    closeModal(); render();
    toast('Order #' + o.no + ' · ' + payBi(method) + (o.due > 0 ? ' · ' + fmt(o.due) + ' on tab · على الحساب' : ' · paid · مدفوع ' + fmt(o.paid)) + ' · sent to ' + dest);
    return;
  }

  if (kind === 'settle') {
    const ord = orders.find(x => x.no === Number(val('no')));
    if (!ord) { closeModal(); return; }
    const amt = Math.max(0, Math.round(parseFloat(val('amt')) || 0));
    const how = val('how') || 'Cash';
    ord.paid = Math.min(ord.total, ord.paid + amt);
    ord.due = Math.max(0, ord.total - ord.paid);
    if (ord.due === 0 && ord.method === 'Unpaid') ord.method = how;
    let cashShift = null;
    if (how === 'Cash' && amt > 0) { const os = currentOpen(); if (os) { os.cash += Math.min(amt, ord.total); cashShift = os; } }
    syncUp('orders', ord);
    if (cashShift) syncUp('shifts', cashShift);
    closeModal(); render();
    toast('Order #' + ord.no + ' settled · تم تحصيل الطلب · ' + fmt(Math.min(amt, ord.total)) + ' ' + payBi(how));
    return;
  }

  if (kind === 'item') {
    const id = val('id');
    const name = val('name');
    const price = Math.round(parseFloat(val('price')));
    if (!name || !(price > 0)) { toast('Enter a name and a valid price · اكتب اسم وسعر صحيح'); return; }
    const cat = val('cat') || CATS[0];
    const desc = val('desc');
    const ar = val('ar');
    const avail = !!d.get('avail');
    if (id) {
      const m = byId(id);
      if (m) { Object.assign(m, { name, cat, price, avail, desc, ar }); syncUp('menu', m); }
      closeModal(); render();
      toast(name + ' updated · اتعدل');
    } else {
      const m = { id: 'm' + Date.now(), name, cat, price, avail, desc, ar };
      MENU.push(m);
      state.menuPage = menuPages();
      syncUp('menu', m); closeModal(); render();
      toast(name + ' added to the menu · اتضاف للمنيو');
    }
    return;
  }

  if (kind === 'stock') {
    const name = val('name');
    if (!name) { toast('Give the item a name · اكتب الاسم'); return; }
    const it = { id: 'i' + Date.now(), name, cat: val('cat'), qty: Math.max(0, parseFloat(val('qty')) || 0), unit: val('unit') || 'kg', par: Math.max(1, parseInt(val('par'), 10) || 1) };
    INV.push(it);
    syncUp('inventory', it); closeModal(); render();
    toast(name + ' added to inventory · اتضاف للمخزون');
    return;
  }

  if (kind === 'shift-open') {
    const s = { id: 'SH-' + (++SEQ_SH), by: val('by') || 'Staff', opened: nowLabel(), float: Math.max(0, parseFloat(val('float')) || 0), cash: 0, status: 'open' };
    SHIFTS.unshift(s);
    syncUp('shifts', s); closeModal(); render();
    toast('Shift opened — good service tonight · فُتحت الوردية — بالتوفيق الليلة');
    return;
  }

  if (kind === 'shift-close') {
    const s = SHIFTS.find(x => x.id === val('id'));
    if (!s) { closeModal(); return; }
    const counted = parseFloat(val('counted'));
    if (isNaN(counted)) { toast('Enter the counted amount · اكتب المبلغ المجرود'); return; }
    s.counted = counted;
    s.variance = counted - (s.float + s.cash);
    s.closed = nowLabel();
    s.day = 'Today';
    s.status = 'closed';
    syncUp('shifts', s);
    closeModal(); render();
    const v = s.variance;
    toast('Shift closed · variance العجز ' + (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v)) + ' · أُغلقت الوردية');
    return;
  }

  if (kind === 'prep-add') {
    const task = val('task');
    if (!task) { toast('Type the task first · اكتب المهمة الأول'); return; }
    const p = { id: 'p' + Date.now(), task, station: val('station') || STATIONS[0], done: false };
    PREP.push(p);
    syncUp('prep', p); render();
    toast('Task added to the prep list · اتاضافت لقائمة التحضير');
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
    save();
    if (SERVER) post('settings', { settings }).catch(syncFail);
    render();
    toast('Settings saved');
  }
}

document.addEventListener('click', onClick);
document.addEventListener('input', onInput);
document.addEventListener('change', onChange);
document.addEventListener('submit', onSubmit);
q('#backdrop').addEventListener('click', e => { if (e.target.id === 'backdrop') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

(async function boot() {
  if (API_MODE) {
    try {
      let s = await post('state');
      if (s.empty) s = await post('bootstrap', { menu: MENU, inventory: INV, prep: PREP, orders, tickets: TICKETS, shifts: SHIFTS, settings });
      if (Array.isArray(s.menu) && s.menu.length) MENU = s.menu;
      if (Array.isArray(s.inventory)) INV = s.inventory;
      if (Array.isArray(s.prep)) PREP = s.prep;
      if (Array.isArray(s.orders)) orders = s.orders;
      if (Array.isArray(s.tickets)) TICKETS = s.tickets;
      if (Array.isArray(s.shifts)) SHIFTS = s.shifts;
      if (s.settings) settings = Object.assign(settings, s.settings);
      if (s.seq > SEQ) SEQ = s.seq;
      if (s.seqSh > SEQ_SH) SEQ_SH = s.seqSh;
      SERVER = true;
    } catch (e) { console.warn('Server unreachable — running in offline mode'); }
  }
  if (!SERVER) load();
  applySettings();
  render();
  if (SERVER) toast('Connected · data saved to qasr.db · متصل — البيانات محفوظة في قاعدة البيانات');
  if (isAuthed()) hideLogin(); else showLogin();
})();
