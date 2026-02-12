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
    }]
}, { timestamps: true });

// Auto-generate slug from name before saving
TradeInDeviceSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    next();
});

export default mongoose.models.TradeInDevice || mongoose.model('TradeInDevice', TradeInDeviceSchema);
