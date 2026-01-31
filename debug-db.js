const mongoose = require('mongoose');
const dns = require('node:dns');

// DNS Patch
dns.setServers(['8.8.8.8', '8.8.4.4']);
const originalLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }
    if (options && typeof options === 'object') options.family = 4;
    return originalLookup(hostname, options, callback);
};

const MONGODB_URI = process.env.MONGODB_URI;

async function debug() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const products = await db.collection('products').find({
            name: /iPhone 16/i
        }).toArray();

        console.log(`Matching Products:`);
        products.forEach(p => {
            console.log(`ID: ${p._id} | Name: ${p.name}`);
            console.log(`- Storage: ${p.storageVariants?.length || 0} | Warranty: ${p.warrantyVariants?.length || 0} | SIM: ${p.simVariants?.length || 0} | Legacy: ${p.variants?.length || 0}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
