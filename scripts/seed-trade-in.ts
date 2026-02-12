
import mongoose from 'mongoose';
import TradeInDevice from '../models/TradeInDevice';
import '../lib/dns-patch'; // patching DNS for Bun environment

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env');
    process.exit(1);
}

const devices = [
    // iPhones
    { name: 'iPhone 16 Pro Max', brand: 'Apple', category: 'Smartphone', maxCredit: 110000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg' },
    { name: 'iPhone 16 Pro', brand: 'Apple', category: 'Smartphone', maxCredit: 100000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg' },
    { name: 'iPhone 16 Plus', brand: 'Apple', category: 'Smartphone', maxCredit: 90000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-plus.jpg' },
    { name: 'iPhone 16', brand: 'Apple', category: 'Smartphone', maxCredit: 85000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg' },
    { name: 'iPhone 15 Pro Max', brand: 'Apple', category: 'Smartphone', maxCredit: 85000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro-max.jpg' },
    { name: 'iPhone 15 Pro', brand: 'Apple', category: 'Smartphone', maxCredit: 75000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-pro.jpg' },
    { name: 'iPhone 15 Plus', brand: 'Apple', category: 'Smartphone', maxCredit: 55000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15-plus.jpg' },
    { name: 'iPhone 15', brand: 'Apple', category: 'Smartphone', maxCredit: 50000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg' },
    { name: 'iPhone 14 Pro Max', brand: 'Apple', category: 'Smartphone', maxCredit: 65000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro-max.jpg' },
    { name: 'iPhone 14 Pro', brand: 'Apple', category: 'Smartphone', maxCredit: 55000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-pro.jpg' },
    { name: 'iPhone 14 Plus', brand: 'Apple', category: 'Smartphone', maxCredit: 50000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14-plus.jpg' },
    { name: 'iPhone 14', brand: 'Apple', category: 'Smartphone', maxCredit: 45000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-14.jpg' },
    { name: 'iPhone 13 Pro Max', brand: 'Apple', category: 'Smartphone', maxCredit: 55000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro-max.jpg' },
    { name: 'iPhone 13 Pro', brand: 'Apple', category: 'Smartphone', maxCredit: 50000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-pro.jpg' },
    { name: 'iPhone 13', brand: 'Apple', category: 'Smartphone', maxCredit: 35000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13.jpg' },
    { name: 'iPhone 13 Mini', brand: 'Apple', category: 'Smartphone', maxCredit: 25000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-13-mini.jpg' },

    // iPads
    { name: '13" iPad Pro (M4)', brand: 'Apple', category: 'Tablet', maxCredit: 90000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-13-2024.jpg' },
    { name: '11" iPad Pro (M4)', brand: 'Apple', category: 'Tablet', maxCredit: 80000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-11-2024.jpg' },
    { name: '12.9" iPad Pro 6th Gen (M2)', brand: 'Apple', category: 'Tablet', maxCredit: 65000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-129-2022.jpg' },
    { name: '11" iPad Pro 4th Gen (M2)', brand: 'Apple', category: 'Tablet', maxCredit: 50000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-pro-11-2022.jpg' },
    { name: 'iPad Air (M2)', brand: 'Apple', category: 'Tablet', maxCredit: 60000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-air-13-2024.jpg' },
    { name: 'iPad Mini (A17 Pro)', brand: 'Apple', category: 'Tablet', maxCredit: 40000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-ipad-mini-2021.jpg' },

    // Macs
    { name: 'MacBook Pro M3 (16-inch)', brand: 'Apple', category: 'Laptop', maxCredit: 95000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-macbook-pro-16-2023.jpg' },
    { name: 'MacBook Pro M3 (14-inch)', brand: 'Apple', category: 'Laptop', maxCredit: 90000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-macbook-pro-14-2023.jpg' },
    { name: 'MacBook Air M3', brand: 'Apple', category: 'Laptop', maxCredit: 70000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-macbook-air-15-2024.jpg' },
    { name: 'MacBook Air M2', brand: 'Apple', category: 'Laptop', maxCredit: 65000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-macbook-air-2022.jpg' },
    { name: 'MacBook Air M1', brand: 'Apple', category: 'Laptop', maxCredit: 45000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-macbook-air-2020.jpg' },

    // Apple Watch
    { name: 'Apple Watch Ultra 2', brand: 'Apple', category: 'Watch', maxCredit: 55000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-watch-ultra-2.jpg' },
    { name: 'Apple Watch Ultra', brand: 'Apple', category: 'Watch', maxCredit: 40000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-watch-ultra.jpg' },
    { name: 'Apple Watch Series 10', brand: 'Apple', category: 'Watch', maxCredit: 25000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-watch-series-9.jpg' }, // S10 placeholder img
    { name: 'Apple Watch Series 9', brand: 'Apple', category: 'Watch', maxCredit: 20000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-watch-series-9.jpg' },
    { name: 'Apple Watch Series 8', brand: 'Apple', category: 'Watch', maxCredit: 15000, image: 'https://fdn2.gsmarena.com/vv/bigpic/apple-watch-series-8.jpg' },

    // Samsung (Added for completeness per user previous request)
    { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Smartphone', maxCredit: 85000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-ultra-5g-sm-s928.jpg' },
    { name: 'Samsung Galaxy S24 Plus', brand: 'Samsung', category: 'Smartphone', maxCredit: 65000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-plus-5g-sm-s926.jpg' },
    { name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Smartphone', maxCredit: 55000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-5g-sm-s921.jpg' },
    { name: 'Samsung Galaxy S23 Ultra', brand: 'Samsung', category: 'Smartphone', maxCredit: 60000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s23-ultra-5g.jpg' },
    { name: 'Samsung Galaxy Z Fold 6', brand: 'Samsung', category: 'Smartphone', maxCredit: 100000, image: 'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-z-fold6.jpg' },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to MongoDB');

        // Clear existing
        await TradeInDevice.deleteMany({});
        console.log('Cleared existing trade-in devices');

        // Insert new
        const docs = await TradeInDevice.insertMany(devices);
        console.log(`Inserted ${docs.length} devices`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

seed();
