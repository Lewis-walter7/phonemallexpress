import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this product.'],
        maxlength: [200, 'Name cannot be more than 200 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description for this product.'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide a price.'],
    },
    isOnSpecialOffer: {
        type: Boolean,
        default: false,
    },
    salePrice: {
        type: Number,
        default: null,
    },
    discountPercentage: {
        type: Number,
        default: 0,
    },
    minPrice: {
        type: Number,
        default: 0,
    },
    maxPrice: {
        type: Number,
        default: 0,
    },
    brand: {
        type: String,
        required: false,
        default: null,
    },
    category: {
        type: String,
        enum: ['Phones', 'Tablets', 'Laptops', 'Audio', 'Gaming', 'Smartwatches', 'Accessories', 'TVs', 'Computers', 'Cameras', 'Networking', 'Storage', 'Refrigerators', 'Washing Machines', 'Kitchen ware', 'Other'],
        required: [true, 'Please specify a category.'],
    },
    subcategory: {
        type: String,
        default: null,
    },
    variants: [{
        name: String,
        price: Number,
        salePrice: Number,
        stock: { type: Number, default: 0 }
    }],
    storageVariants: [{
        name: String,
        price: Number,
        salePrice: Number,
        stock: { type: Number, default: 0 },
        isDisabled: { type: Boolean, default: false },
        availableForConnectivity: [String]  // Array of connectivity variant names this storage is available for
    }],
    warrantyVariants: [{
        name: String,
        price: { type: Number, default: 0 },
        salePrice: { type: Number, default: null },
        stock: { type: Number, default: 0 },
        isDisabled: { type: Boolean, default: false }
    }],
    simVariants: [{
        name: String,
        price: { type: Number, default: 0 },
        salePrice: { type: Number, default: null },
        stock: { type: Number, default: 0 },
        isDisabled: { type: Boolean, default: false }
    }],
    connectivityVariants: [{
        name: String,
        price: { type: Number, default: 0 },
        salePrice: { type: Number, default: null },
        stock: { type: Number, default: 0 },
        isDisabled: { type: Boolean, default: false }
    }],
    youtubeVideoUrl: {
        type: String,
        default: null,
    },
    colors: {
        type: [String], // e.g., ["Black", "White"]
        default: []
    },
    imageUrl: {
        type: String,
        required: false,
    },
    images: {
        type: [String],
        default: [],
    },
    stock: {
        type: Number,
        default: 0,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['published', 'draft'],
        default: 'published',
    },
    features: {
        type: Object, // Changed from Map to Object for flexibility
        default: {}
    },
    specifications: {
        type: Object,
        default: {}
    },
    bundledProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    frequentlyBoughtTogether: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    bundleDiscount: {
        type: Number,
        default: 5
    },
    slug: {
        type: String,
        unique: true,
        sparse: true
    }
}, { timestamps: true });

// Pre-save hook to generate slug and calculate min/max prices
ProductSchema.pre('save', async function () {
    // 1. Slug generation
    if (!this.slug || this.isModified('name')) {
        let slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        if (this._id) {
            slug = `${slug}-${this._id}`;
        }
        this.slug = slug;
    }

    // 2. Min/Max Price Calculation based on Dynamic Logic
    // Logic: Max(StoragePrice, WarrantyPrice, basePrice) + SIM
    const basePrice = (this as any).price || 0;

    // Get all possible storage prices (include basePrice as a fallback if no storage variants)
    const storagePrices = (this as any).storageVariants && (this as any).storageVariants.length > 0
        ? (this as any).storageVariants.filter((v: any) => !v.isDisabled).map((v: any) => (v.salePrice && v.salePrice > 0) ? v.salePrice : (v.price || 0))
        : [basePrice];

    // Get all possible warranty prices (include basePrice as a fallback)
    const warrantyPrices = (this as any).warrantyVariants && (this as any).warrantyVariants.length > 0
        ? (this as any).warrantyVariants.filter((v: any) => !v.isDisabled).map((v: any) => (v.salePrice && v.salePrice > 0) ? v.salePrice : (v.price || 0))
        : [basePrice];

    // Get all possible SIM additions (0 if none)
    const simAddons = (this as any).simVariants && (this as any).simVariants.length > 0
        ? (this as any).simVariants.filter((v: any) => !v.isDisabled).map((v: any) => (v.salePrice && v.salePrice > 0) ? v.salePrice : (v.price || 0))
        : [0];

    // Calculate all possible combined base prices (Max of Storage vs Warranty)
    const combinedBases: number[] = [];
    storagePrices.forEach((s: number) => {
        warrantyPrices.forEach((w: number) => {
            // Take the max of storage and warranty prices. 
            // Also compare with basePrice to be safe if variants are small increments (though they seem absolute)
            combinedBases.push(Math.max(s, w, basePrice));
        });
    });

    // Calculate all possible final totals
    const allTotals: number[] = [];
    combinedBases.forEach(cb => {
        simAddons.forEach((sim: number) => {
            allTotals.push(cb + sim);
        });
    });

    if (allTotals.length > 0) {
        (this as any).minPrice = Math.min(...allTotals);
        (this as any).maxPrice = Math.max(...allTotals);
    } else {
        (this as any).minPrice = basePrice;
        (this as any).maxPrice = basePrice;
    }
});

// Prevent Mongoose overwrite warning in dev by deleting model if it exists
if (process.env.NODE_ENV !== 'production' && mongoose.models && mongoose.models.Product) {
    delete mongoose.models.Product;
}

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
