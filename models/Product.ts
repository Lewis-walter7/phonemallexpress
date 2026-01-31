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
        isDisabled: { type: Boolean, default: false }
    }],
    warrantyVariants: [{
        name: String,
        price: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        isDisabled: { type: Boolean, default: false }
    }],
    simVariants: [{
        name: String,
        price: { type: Number, default: 0 },
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

// Pre-save hook to generate slug
ProductSchema.pre('save', async function () {
    if (!this.isModified('name') && this.slug) {
        return;
    }

    if (!this.slug || this.isModified('name')) {
        // Simple slugify
        let slug = this.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Append ID to ensure uniqueness and match current URL pattern
        if (this._id) {
            slug = `${slug}-${this._id}`;
        }

        this.slug = slug;
    }
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
