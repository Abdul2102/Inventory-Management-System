const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const categoriesData = [
  { name: 'Electronics', description: 'Computers, screens, adapters and electronic gadgets' },
  { name: 'Accessories', description: 'Cables, stands, cases and complementary gear' },
  { name: 'Stationery', description: 'Notebooks, pens, paper and writing products' },
  { name: 'Furniture', description: 'Desks, office chairs and physical workspace items' },
  { name: 'Office Supplies', description: 'Organizers, shredders and general office gear' }
];

const seed = async () => {
  try {
    console.log('Connecting to database...');
    let connected = false;
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('Connected to remote database.');
      connected = true;
    } catch (err) {
      console.error('Remote MongoDB Connection Error during seeding:', err.message);
      console.log('Attempting local database connection fallback...');
      try {
        await mongoose.connect('mongodb://127.0.0.1:27017/stockflow');
        console.log('Connected to local database fallback.');
        connected = true;
      } catch (localErr) {
        console.error('All database connection attempts failed:', localErr.message);
      }
    }

    if (!connected) {
      process.exit(1);
    }

    // 1. Find or create default admin user
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating default admin...');
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@stockflow.com',
        password: 'admin1234',
        role: 'admin'
      });
      console.log('Default admin created: admin@stockflow.com / admin1234');
    }

    let staffUser = await User.findOne({ role: 'staff' });
    if (!staffUser) {
      console.log('No staff user found. Creating default staff...');
      staffUser = await User.create({
        name: 'Staff User',
        email: 'staff@stockflow.com',
        password: 'staff1234',
        role: 'staff'
      });
      console.log('Default staff created: staff@stockflow.com / staff1234');
    }

    // 2. Clear old data & Drop products collection to delete legacy SKU index
    console.log('Dropping products collection to reset legacy database indexes...');
    await mongoose.connection.db.collection('products').drop().catch(() => {
      console.log('Collection products did not exist yet or was empty.');
    });

    console.log('Clearing existing categories...');
    await Category.deleteMany({});

    // 3. Create Categories
    console.log('Seeding categories...');
    const categoriesMap = {};
    for (const cat of categoriesData) {
      const createdCat = await Category.create({
        name: cat.name,
        description: cat.description,
        createdBy: adminUser._id
      });
      categoriesMap[cat.name] = createdCat._id;
    }
    console.log('Categories seeded.');

    // 4. Create Products without SKU properties
    console.log('Seeding products...');
    const productsData = [
      {
        name: 'Wireless Mouse',
        category: categoriesMap['Electronics'],
        price: 899.00,
        quantity: 45,
        minimumStock: 10,
        supplier: 'TechSupply Ltd',
        description: 'Ergonomic 2.4GHz wireless mouse with optical tracker'
      },
      {
        name: 'Mechanical Keyboard',
        category: categoriesMap['Electronics'],
        price: 3499.00,
        quantity: 25,
        minimumStock: 10,
        supplier: 'KeyGeeks Inc',
        description: 'RGB mechanical keyboard with blue tactile switches'
      },
      {
        name: 'USB-C Cable',
        category: categoriesMap['Accessories'],
        price: 299.00,
        quantity: 4,
        minimumStock: 10,
        supplier: 'WireLoop Co',
        description: 'Braided fast-charging USB-C to USB-C cable (2m)'
      },
      {
        name: 'Laptop Stand',
        category: categoriesMap['Accessories'],
        price: 1199.00,
        quantity: 8,
        minimumStock: 10,
        supplier: 'ErgoDesign',
        description: 'Aluminum foldable laptop riser with ventilation slots'
      },
      {
        name: 'Desk Lamp',
        category: categoriesMap['Accessories'],
        price: 999.00,
        quantity: 15,
        minimumStock: 5,
        supplier: 'LuxLights',
        description: 'Dimmable LED office desk lamp with USB charging port'
      },
      {
        name: 'Notebook',
        category: categoriesMap['Stationery'],
        price: 199.00,
        quantity: 120,
        minimumStock: 20,
        supplier: 'PaperCo Ltd',
        description: 'A5 ruled hardcover notebook, 200 pages'
      },
      {
        name: 'Office Chair',
        category: categoriesMap['Furniture'],
        price: 8500.00,
        quantity: 0,
        minimumStock: 5,
        supplier: 'ComfortSeat',
        description: 'High-back mesh ergonomic office chair with lumbar support'
      },
      {
        name: 'Monitor',
        category: categoriesMap['Electronics'],
        price: 11499.00,
        quantity: 0,
        minimumStock: 3,
        supplier: 'ViewTech',
        description: '24-inch Full HD borderless IPS desktop monitor'
      },
      {
        name: 'HDMI Cable',
        category: categoriesMap['Accessories'],
        price: 499.00,
        quantity: 0,
        minimumStock: 5,
        supplier: 'WireLoop Co',
        description: 'High-speed 4K Gold-plated HDMI 2.0 cable (3m)'
      },
      {
        name: 'Webcam',
        category: categoriesMap['Electronics'],
        price: 2499.00,
        quantity: 15,
        minimumStock: 5,
        supplier: 'ViewTech',
        description: '1080p HD webcam with built-in noise-canceling mic'
      },
      {
        name: 'Pen Set',
        category: categoriesMap['Stationery'],
        price: 350.00,
        quantity: 5,
        minimumStock: 10,
        supplier: 'PaperCo Ltd',
        description: 'Premium gel ink pen gift box (set of 5 colors)'
      },
      {
        name: 'Office Desk',
        category: categoriesMap['Furniture'],
        price: 14500.00,
        quantity: 3,
        minimumStock: 2,
        supplier: 'ErgoDesign',
        description: 'Solid wooden office desk with built-in cable management drawer'
      },
      {
        name: 'File Organizer',
        category: categoriesMap['Office Supplies'],
        price: 450.00,
        quantity: 2,
        minimumStock: 5,
        supplier: 'PaperCo Ltd',
        description: '3-tier mesh desk tray and folder filing unit'
      },
      {
        name: 'Paper Shredder',
        category: categoriesMap['Office Supplies'],
        price: 4200.00,
        quantity: 1,
        minimumStock: 2,
        supplier: 'TechSupply Ltd',
        description: 'Cross-cut high security paper and credit card shredder'
      },
      {
        name: 'Sticky Notes',
        category: categoriesMap['Stationery'],
        price: 99.00,
        quantity: 200,
        minimumStock: 25,
        supplier: 'PaperCo Ltd',
        description: '3x3 inches pastel sticky notes pack, 400 sheets'
      },
      {
        name: 'Bluetooth Speaker',
        category: categoriesMap['Electronics'],
        price: 1999.00,
        quantity: 30,
        minimumStock: 5,
        supplier: 'KeyGeeks Inc',
        description: 'Waterproof portable Bluetooth speaker with rich bass'
      },
      {
        name: 'Smart Watch',
        category: categoriesMap['Electronics'],
        price: 4999.00,
        quantity: 12,
        minimumStock: 5,
        supplier: 'ViewTech',
        description: 'Fitness tracker smartwatch with heart rate & sleep monitoring'
      },
      {
        name: 'Extension Cord',
        category: categoriesMap['Accessories'],
        price: 699.00,
        quantity: 2,
        minimumStock: 5,
        supplier: 'WireLoop Co',
        description: 'Surge protector power strip with 4 outlets & 2 USB ports'
      },
      {
        name: 'Pencil Sharpener',
        category: categoriesMap['Stationery'],
        price: 150.00,
        quantity: 10,
        minimumStock: 2,
        supplier: 'PaperCo Ltd',
        description: 'Heavy duty manual desk pencil sharpener'
      },
      {
        name: 'Whiteboard',
        category: categoriesMap['Office Supplies'],
        price: 2190.00,
        quantity: 0,
        minimumStock: 2,
        supplier: 'ComfortSeat',
        description: 'Dry erase magnetic whiteboard with aluminum frame (3x2 ft)'
      }
    ];

    for (const prod of productsData) {
      await Product.create({
        ...prod,
        createdBy: adminUser._id
      });
    }

    console.log('Products successfully seeded!');
    console.log('Total seeded products:', productsData.length);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
