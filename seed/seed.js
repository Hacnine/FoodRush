/**
 * FoodRush – Full Seed Script
 * Populates auth_db, user_db (PostgreSQL), restaurant_db (MongoDB),
 * order_db, payment_db, delivery_db (PostgreSQL) with realistic demo data.
 *
 * Run AFTER docker-compose is fully up:
 *   cd seed && npm install && node seed.js
 */

const { Client } = require('pg');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

// ─── Fixed IDs (consistent across DBs) ─────────────────────────────────────
const IDS = {
  adminUser:       'aaaaaaaa-0000-0000-0000-000000000001',
  customerUser:    'aaaaaaaa-0000-0000-0000-000000000002',
  ownerUser:       'aaaaaaaa-0000-0000-0000-000000000003',
  driverUser:      'aaaaaaaa-0000-0000-0000-000000000004',

  restaurant1:     new ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa'),
  restaurant2:     new ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb'),

  order1:          'cccccccc-0000-0000-0000-000000000001',
  order2:          'cccccccc-0000-0000-0000-000000000002',

  payment1:        'dddddddd-0000-0000-0000-000000000001',
  payment2:        'dddddddd-0000-0000-0000-000000000002',

  delivery1:       'eeeeeeee-0000-0000-0000-000000000001',
  delivery2:       'eeeeeeee-0000-0000-0000-000000000002',
};

// ─── DB connection configs ───────────────────────────────────────────────────
const PG = {
  auth:     { host: 'localhost', port: 5437, database: 'auth_db',     user: 'postgres', password: 'postgres' },
  user:     { host: 'localhost', port: 5433, database: 'user_db',     user: 'postgres', password: 'postgres' },
  order:    { host: 'localhost', port: 5434, database: 'order_db',    user: 'postgres', password: 'postgres' },
  payment:  { host: 'localhost', port: 5435, database: 'payment_db',  user: 'postgres', password: 'postgres' },
  delivery: { host: 'localhost', port: 5436, database: 'delivery_db', user: 'postgres', password: 'postgres' },
};
const MONGO_URI = 'mongodb://mongo:mongo@localhost:27017/restaurant_db?authSource=admin';

async function pgClient(cfg) {
  const c = new Client(cfg);
  await c.connect();
  return c;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForPg(cfg, label, retries = 10) {
  for (let i = 0; i < retries; i++) {
    try {
      const c = await pgClient(cfg);
      await c.query('SELECT 1');
      await c.end();
      console.log(`  ✔ ${label} ready`);
      return;
    } catch {
      console.log(`  ⏳ Waiting for ${label}… (${i + 1}/${retries})`);
      await sleep(3000);
    }
  }
  throw new Error(`Could not connect to ${label}`);
}

// ─── 1. AUTH DB ─────────────────────────────────────────────────────────────
async function seedAuth() {
  console.log('\n[auth_db] Seeding users…');
  const db = await pgClient(PG.auth);

  const users = [
    { id: IDS.adminUser,    email: 'admin@foodrush.com',        name: 'Admin User',      phone: '+1-555-0001', role: 'admin',              password: 'Admin123!' },
    { id: IDS.customerUser, email: 'john@example.com',          name: 'John Smith',      phone: '+1-555-0002', role: 'customer',           password: 'Customer123!' },
    { id: IDS.ownerUser,    email: 'owner@pizzapalace.com',     name: 'Marco Romano',    phone: '+1-555-0003', role: 'restaurant_owner',   password: 'Owner123!' },
    { id: IDS.driverUser,   email: 'driver@example.com',        name: 'Carlos Ruiz',     phone: '+1-555-0004', role: 'delivery_driver',    password: 'Driver123!' },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12);
    await db.query(`
      INSERT INTO users (id, email, "passwordHash", name, phone, role, "isActive", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [u.id, u.email, hash, u.name, u.phone, u.role]);
    console.log(`  ✔ ${u.role}: ${u.email}  →  password: ${u.password}`);
  }

  await db.end();
}

// ─── 2. USER DB ─────────────────────────────────────────────────────────────
async function seedUsers() {
  console.log('\n[user_db] Seeding profiles & addresses…');
  const db = await pgClient(PG.user);

  const profiles = [
    { id: IDS.adminUser,    email: 'admin@foodrush.com',    name: 'Admin User',   phone: '+1-555-0001' },
    { id: IDS.customerUser, email: 'john@example.com',      name: 'John Smith',   phone: '+1-555-0002' },
    { id: IDS.ownerUser,    email: 'owner@pizzapalace.com', name: 'Marco Romano', phone: '+1-555-0003' },
    { id: IDS.driverUser,   email: 'driver@example.com',    name: 'Carlos Ruiz',  phone: '+1-555-0004' },
  ];

  for (const p of profiles) {
    await db.query(`
      INSERT INTO user_profiles (id, email, name, phone, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [p.id, p.email, p.name, p.phone]);
  }

  // Address for customer
  await db.query(`
    INSERT INTO addresses (id, "userId", label, street, city, state, "zipCode", country, latitude, longitude, "isDefault", "createdAt")
    VALUES (
      gen_random_uuid(), $1, 'Home', '123 Main St', 'New York', 'NY', '10001', 'US',
      40.7128, -74.0060, true, NOW()
    ) ON CONFLICT DO NOTHING
  `, [IDS.customerUser]);

  console.log('  ✔ 4 profiles + 1 address seeded');
  await db.end();
}

// ─── 3. MONGODB (restaurants + menu items) ───────────────────────────────────
async function seedRestaurants() {
  console.log('\n[MongoDB] Seeding restaurants & menu items…');
  const mongo = new MongoClient(MONGO_URI);
  await mongo.connect();
  const db = mongo.db('restaurant_db');

  const restaurants = db.collection('restaurants');
  const menuItems   = db.collection('menuitems');

  // Upsert restaurants
  const r1 = {
    _id: IDS.restaurant1,
    name: 'Pizza Palace',
    ownerId: IDS.ownerUser,
    description: 'Authentic Neapolitan pizzas made with wood-fired ovens and fresh ingredients.',
    address: '456 Napoli Ave',
    city: 'New York',
    phone: '+1-555-1001',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    categories: ['Italian', 'Pizza', 'Fast Food'],
    rating: 4.7,
    totalReviews: 238,
    estimatedDeliveryTime: 25,
    deliveryFee: 2.99,
    minimumOrder: 15,
    isOpen: true,
    isActive: true,
  };

  const r2 = {
    _id: IDS.restaurant2,
    name: 'Burger Hub',
    ownerId: IDS.ownerUser,
    description: 'Juicy gourmet burgers crafted from 100% grass-fed beef with house-made sauces.',
    address: '789 Broadway',
    city: 'New York',
    phone: '+1-555-1002',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    categories: ['American', 'Burgers', 'Fast Food'],
    rating: 4.5,
    totalReviews: 184,
    estimatedDeliveryTime: 20,
    deliveryFee: 1.99,
    minimumOrder: 10,
    isOpen: true,
    isActive: true,
  };

  await restaurants.replaceOne({ _id: r1._id }, r1, { upsert: true });
  await restaurants.replaceOne({ _id: r2._id }, r2, { upsert: true });
  console.log('  ✔ 2 restaurants');

  // Menu items – Pizza Palace
  const pizzaMenuItems = [
    { name: 'Margherita Pizza',    description: 'Classic tomato sauce, fresh mozzarella, basil',              price: 14.99, category: 'Pizza',    isFeatured: true,  preparationTime: 15 },
    { name: 'Pepperoni Pizza',     description: 'Tomato sauce, mozzarella, double pepperoni',                  price: 16.99, category: 'Pizza',    isFeatured: true,  preparationTime: 15 },
    { name: 'Veggie Supreme',      description: 'Roasted peppers, mushrooms, olives, sun-dried tomatoes',      price: 15.99, category: 'Pizza',    isFeatured: false, preparationTime: 15 },
    { name: 'Garlic Bread',        description: 'Toasted ciabatta with garlic butter and parsley',             price: 5.99,  category: 'Sides',    isFeatured: false, preparationTime: 8  },
    { name: 'Tiramisu',            description: 'Classic Italian dessert with mascarpone and espresso',        price: 6.99,  category: 'Desserts', isFeatured: false, preparationTime: 5  },
    { name: 'San Pellegrino',      description: 'Sparkling mineral water 750ml',                               price: 3.49,  category: 'Drinks',   isFeatured: false, preparationTime: 1  },
  ];

  const burgerMenuItems = [
    { name: 'Classic Burger',      description: '6oz beef patty, lettuce, tomato, pickles, house sauce',       price: 11.99, category: 'Burgers',  isFeatured: true,  preparationTime: 10 },
    { name: 'Cheeseburger',        description: '6oz beef patty, cheddar, caramelised onion, mustard',         price: 13.99, category: 'Burgers',  isFeatured: true,  preparationTime: 10 },
    { name: 'Veggie Burger',       description: 'House-made black bean patty, avocado, tomato relish',         price: 12.99, category: 'Burgers',  isFeatured: false, preparationTime: 10 },
    { name: 'Crispy Fries',        description: 'Double-fried skin-on fries with sea salt',                    price: 4.99,  category: 'Sides',    isFeatured: false, preparationTime: 6  },
    { name: 'Onion Rings',         description: 'Beer-battered onion rings with sriracha dip',                 price: 5.99,  category: 'Sides',    isFeatured: false, preparationTime: 6  },
    { name: 'Chocolate Milkshake', description: 'Thick hand-spun milkshake with Valrhona chocolate',           price: 6.49,  category: 'Drinks',   isFeatured: false, preparationTime: 5  },
  ];

  await menuItems.deleteMany({ restaurantId: { $in: [IDS.restaurant1, IDS.restaurant2] } });

  const allItems = [
    ...pizzaMenuItems.map(i => ({ ...i, restaurantId: IDS.restaurant1, isAvailable: true, allergens: [] })),
    ...burgerMenuItems.map(i => ({ ...i, restaurantId: IDS.restaurant2, isAvailable: true, allergens: [] })),
  ];
  await menuItems.insertMany(allItems);
  console.log('  ✔ 12 menu items (6 per restaurant)');

  await mongo.close();
}

// ─── 4. ORDER DB ─────────────────────────────────────────────────────────────
async function seedOrders() {
  console.log('\n[order_db] Seeding orders & order items…');
  const db = await pgClient(PG.order);

  // Clear any existing items for idempotency
  await db.query(`DELETE FROM order_items WHERE "orderId" IN ($1,$2)`, [IDS.order1, IDS.order2]);

  // Order 1 – Pizza Palace
  await db.query(`
    INSERT INTO orders (id, "userId", "restaurantId", status, subtotal, "deliveryFee", total,
      "deliveryAddress", "paymentId", "deliveryDriverId", notes, "createdAt", "updatedAt")
    VALUES ($1,$2,$3,'delivered',31.97,2.99,34.96,
      '{"street":"123 Main St","city":"New York","state":"NY","zipCode":"10001"}',
      $4, $5, 'Extra napkins please', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
    ON CONFLICT (id) DO NOTHING
  `, [IDS.order1, IDS.customerUser, IDS.restaurant1.toString(), IDS.payment1, IDS.driverUser]);

  await db.query(`
    INSERT INTO order_items (id, "orderId", "menuItemId", name, price, quantity, "imageUrl")
    VALUES
      (gen_random_uuid(), $1, gen_random_uuid(), 'Margherita Pizza',  14.99, 1, NULL),
      (gen_random_uuid(), $1, gen_random_uuid(), 'Pepperoni Pizza',   16.99, 1, NULL),
      (gen_random_uuid(), $1, gen_random_uuid(), 'Garlic Bread',       5.99, 1, NULL)
  `, [IDS.order1]);

  // Order 2 – Burger Hub
  await db.query(`
    INSERT INTO orders (id, "userId", "restaurantId", status, subtotal, "deliveryFee", total,
      "deliveryAddress", "paymentId", "deliveryDriverId", notes, "createdAt", "updatedAt")
    VALUES ($1,$2,$3,'delivered',27.97,1.99,29.96,
      '{"street":"123 Main St","city":"New York","state":"NY","zipCode":"10001"}',
      $4, $5, NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING
  `, [IDS.order2, IDS.customerUser, IDS.restaurant2.toString(), IDS.payment2, IDS.driverUser]);

  await db.query(`
    INSERT INTO order_items (id, "orderId", "menuItemId", name, price, quantity, "imageUrl")
    VALUES
      (gen_random_uuid(), $1, gen_random_uuid(), 'Cheeseburger',   13.99, 1, NULL),
      (gen_random_uuid(), $1, gen_random_uuid(), 'Classic Burger', 11.99, 1, NULL),
      (gen_random_uuid(), $1, gen_random_uuid(), 'Crispy Fries',    4.99, 2, NULL)
  `, [IDS.order2]);

  console.log('  ✔ 2 orders + 6 order items');
  await db.end();
}

// ─── 5. PAYMENT DB ───────────────────────────────────────────────────────────
async function seedPayments() {
  console.log('\n[payment_db] Seeding payments…');
  const db = await pgClient(PG.payment);

  await db.query(`
    INSERT INTO payments (id, "orderId", "userId", amount, currency, status,
      "stripePaymentIntentId", "stripeClientSecret", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,34.96,'usd','succeeded','pi_demo_111','secret_demo_111',NOW() - INTERVAL '2 days',NOW() - INTERVAL '2 days')
    ON CONFLICT (id) DO NOTHING
  `, [IDS.payment1, IDS.order1, IDS.customerUser]);

  await db.query(`
    INSERT INTO payments (id, "orderId", "userId", amount, currency, status,
      "stripePaymentIntentId", "stripeClientSecret", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,29.96,'usd','succeeded','pi_demo_222','secret_demo_222',NOW() - INTERVAL '1 day',NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING
  `, [IDS.payment2, IDS.order2, IDS.customerUser]);

  console.log('  ✔ 2 payments (succeeded)');
  await db.end();
}

// ─── 6. DELIVERY DB ──────────────────────────────────────────────────────────
async function seedDeliveries() {
  console.log('\n[delivery_db] Seeding deliveries…');
  const db = await pgClient(PG.delivery);

  const addr = JSON.stringify({ street: '123 Main St', city: 'New York', state: 'NY', zipCode: '10001' });

  await db.query(`
    INSERT INTO deliveries (id, "orderId", "userId", "driverId", "driverName", "driverPhone",
      status, "currentLatitude", "currentLongitude", "deliveryAddress", "estimatedArrival",
      "deliveredAt", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,'Carlos Ruiz','+1-555-0004','delivered',40.7128,-74.0060,$5::jsonb,
      NOW() - INTERVAL '2 days' + INTERVAL '30 minutes',
      NOW() - INTERVAL '2 days' + INTERVAL '28 minutes',
      NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')
    ON CONFLICT (id) DO NOTHING
  `, [IDS.delivery1, IDS.order1, IDS.customerUser, IDS.driverUser, addr]);

  await db.query(`
    INSERT INTO deliveries (id, "orderId", "userId", "driverId", "driverName", "driverPhone",
      status, "currentLatitude", "currentLongitude", "deliveryAddress", "estimatedArrival",
      "deliveredAt", "createdAt", "updatedAt")
    VALUES ($1,$2,$3,$4,'Carlos Ruiz','+1-555-0004','delivered',40.7128,-74.0060,$5::jsonb,
      NOW() - INTERVAL '1 day' + INTERVAL '25 minutes',
      NOW() - INTERVAL '1 day' + INTERVAL '22 minutes',
      NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING
  `, [IDS.delivery2, IDS.order2, IDS.customerUser, IDS.driverUser, addr]);

  console.log('  ✔ 2 deliveries (delivered)');
  await db.end();
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log('         FoodRush Seed Script');
  console.log('═══════════════════════════════════════════════════');
  console.log('\nWaiting for databases to be ready…');

  await waitForPg(PG.auth,     'auth_db     (5437)');
  await waitForPg(PG.user,     'user_db     (5433)');
  await waitForPg(PG.order,    'order_db    (5434)');
  await waitForPg(PG.payment,  'payment_db  (5435)');
  await waitForPg(PG.delivery, 'delivery_db (5436)');

  await seedAuth();
  await seedUsers();
  await seedRestaurants();
  await seedOrders();
  await seedPayments();
  await seedDeliveries();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('  ✅  All seed data inserted successfully!');
  console.log('═══════════════════════════════════════════════════');
  console.log('\n📋 Demo credentials:');
  console.log('  Customer:    john@example.com         /  Customer123!');
  console.log('  Admin:       admin@foodrush.com        /  Admin123!');
  console.log('  Owner:       owner@pizzapalace.com     /  Owner123!');
  console.log('  Driver:      driver@example.com        /  Driver123!');
  console.log('\n🌐 App URLs:');
  console.log('  Customer app:    http://localhost:4000');
  console.log('  Restaurant app:  http://localhost:4001');
  console.log('  Admin app:       http://localhost:4002');
  console.log('  API gateway:     http://localhost:3000');
}

main().catch(err => { console.error('\n❌ Seed failed:', err.message); process.exit(1); });
