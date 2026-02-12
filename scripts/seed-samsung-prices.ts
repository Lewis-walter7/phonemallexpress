import mongoose from 'mongoose';
import TradeInDevice from '../models/TradeInDevice';
import '@/lib/dns-patch'; // Fix connection issues

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable');
    process.exit(1);
}

const samsungDevices = [
    // Phones
    { name: 'Samsung Galaxy S25 Ultra', val: 100000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S25', val: 60000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S24 Ultra', val: 68000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S24 FE', val: 35500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S24', val: 48000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Trifold', val: 250000, cat: 'Smartphone' }, // Assuming Smartphone/Fold category fallback
    { name: 'Samsung Galaxy Z Fold 7', val: 150000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Z Fold 6', val: 88000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Z Fold 5', val: 50000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Z Fold 4', val: 40000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Z Fold 3', val: 30990, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S23 Ultra', val: 52000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S23 Plus', val: 35500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S23 FE', val: 45900, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S23', val: 34500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S22 Ultra', val: 38000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Z Flip 6', val: 49500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Z Flip 4', val: 24990, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Z Flip 3', val: 18800, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Note 20', val: 15500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Note 10 Plus', val: 20000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy Note 10', val: 14500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S21 Ultra', val: 24990, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S21 Plus', val: 15500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S21 FE', val: 23500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S21', val: 14990, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S20 Plus', val: 14500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S20 FE', val: 10000, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S20', val: 13500, cat: 'Smartphone' },
    { name: 'Samsung Galaxy S10 5G', val: 12500, cat: 'Smartphone' },

    // Tablets
    { name: 'Samsung Tab A9 8.7”', val: 11500, cat: 'Tablet' },
    { name: 'Samsung Tab A9+ 5G', val: 16500, cat: 'Tablet' },
    { name: 'Samsung Tab A11 8.7"', val: 9000, cat: 'Tablet' },
    { name: 'Samsung Tab A11+ 11" 5G', val: 16500, cat: 'Tablet' },
    { name: 'Samsung Tab S10+ 5G', val: 62500, cat: 'Tablet' },

    // Watches
    { name: 'Samsung Watch 7', val: 10000, cat: 'Watch' },
    { name: 'Samsung Watch 8', val: 15500, cat: 'Watch' },
    { name: 'Samsung Watch 8 Classic', val: 20000, cat: 'Watch' },
    { name: 'Samsung Watch Ultra', val: 28500, cat: 'Watch' },
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI as string);
        console.log('Connected to DB');

        // Optional: Remove existing Samsung devices to start fresh
        // await TradeInDevice.deleteMany({ brand: 'Samsung' });
        // console.log('Cleared existing Samsung devices');

        let updatedCount = 0;
        let createdCount = 0;

        for (const log of samsungDevices) {
            const update = {
                brand: 'Samsung',
                category: log.cat,
                maxCredit: log.val,
                image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=300', // Placeholder
                storageOptions: ['128GB', '256GB', '512GB'] // Default storage
            };

            const doc = await TradeInDevice.findOneAndUpdate(
                { name: log.name },
                update,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            if (doc.createdAt === doc.updatedAt) {
                createdCount++;
            } else {
                updatedCount++;
            }
        }

        console.log(`Sync Complete. Created: ${createdCount}, Updated: ${updatedCount}`);
        process.exit(0);
    } catch (error) {
        console.error('Seed Error:', error);
        process.exit(1);
    }
}

seed();
