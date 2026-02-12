import mongoose from 'mongoose';

const TradeInDeviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide device name'],
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    },
    brand: {
        type: String,
        required: [true, 'Please provide brand'],
        enum: ['Apple', 'Samsung'] // Can be expanded later
    },
    category: {
        type: String, // Smartphone, Tablet, Watch, Laptop
        required: [true, 'Please provide category'],
    },
    image: {
        type: String,
        required: [true, 'Please provide device image URL']
    },
    maxCredit: {
        type: Number,
        required: [true, 'Please provide maximum estimated credit']
    },
    storageOptions: [{
        type: String
    }],
    priceList: [{
        excellent: { type: Number, default: 0 },
        good: { type: Number, default: 0 },
        fair: { type: Number, default: 0 },
        broken: { type: Number, default: 0 }
    }]
}, { timestamps: true });

// Auto-generate slug from name before saving
TradeInDeviceSchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
});

export default mongoose.models.TradeInDevice || mongoose.model('TradeInDevice', TradeInDeviceSchema);
