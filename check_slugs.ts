const mongoose = require('mongoose');

async function check() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({}, { strict: false }));

        const products = await Product.find({}).limit(5).lean();
        console.log('Products found:', products.length);
        products.forEach(p => {
            console.log(`Name: ${p.name}, Slug: ${p.slug}, Category: ${p.category}`);
        });
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

check();
