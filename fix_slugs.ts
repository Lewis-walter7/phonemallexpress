import mongoose from 'mongoose';
import dbConnect from './lib/db';
import Product from './models/Product';

async function fix() {
    await dbConnect();
    const products = await Product.find({});
    console.log(`Checking ${products.length} products...`);

    for (const prod of products) {
        // Force slug regeneration by setting it to undefined
        console.log(`Updating slug for: ${prod.name}`);
        (prod as any).slug = undefined;
        await prod.save();
        console.log(`New slug: ${prod.slug}`);
    }

    console.log('Fixed all products.');
    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
