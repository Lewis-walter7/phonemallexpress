import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProductImage {
    url: string;
    alt: string;
}

export interface IVariant {
    name: string;
    price: number;
    salePrice?: number;
    stock: number;
}

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice?: number; // Aliased to salePrice in jelectronics
    salePrice?: number;
    isOnSpecialOffer: boolean;
    discountPercentage: number;
    imageUrl?: string; // Original field from jelectronics
    images: IProductImage[];
    category: string | mongoose.Types.ObjectId; // Support both string enum and ObjectId
    subCategory?: string | mongoose.Types.ObjectId;
    brand?: string | mongoose.Types.ObjectId;
    stock: number;
    sku?: string;
    variants: IVariant[];
    colors: string[];
    isFeatured: boolean;
    averageRating: number;
    reviewCount: number;
    status: 'published' | 'draft';
    specs?: Map<string, string>;
    features?: any;
    specifications?: any;
    bundledProducts: mongoose.Types.ObjectId[];
    bundleDiscount: number;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
    };
}

const ProductSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name for this product.'],
        maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    slug: { type: String, required: true, unique: true },
    description: {
        type: String,
        required: [true, 'Please provide a description for this product.'],
    },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    salePrice: { type: Number }, // Support jelectronics field
    isOnSpecialOffer: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0 },
    imageUrl: { type: String }, // Support jelectronics field
    images: {
        type: [{
            url: { type: String, required: true },
            alt: { type: String, required: true },
        }],
        default: []
    },
    category: { type: Schema.Types.Mixed, required: true }, // Support both string and ObjectId
    subCategory: { type: Schema.Types.Mixed },
    brand: { type: Schema.Types.Mixed },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, unique: true, sparse: true },
    variants: [{
        name: String,
        price: Number,
        salePrice: Number,
        stock: { type: Number, default: 0 }
    }],
    colors: {
        type: [String],
        default: []
    },
    isFeatured: { type: Boolean, default: false },
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
    specs: { type: Map, of: String },
    features: { type: Schema.Types.Mixed, default: {} },
    specifications: { type: Schema.Types.Mixed, default: {} },
    bundledProducts: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    bundleDiscount: {
        type: Number,
        default: 5
    },
    seo: {
        title: { type: String },
        description: { type: String },
        keywords: [{ type: String }],
    },
}, { timestamps: true });

// Helper to generate slug from name
function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '')     // Remove all non-word chars
        .replace(/--+/g, '-');        // Replace multiple - with single -
}

ProductSchema.pre('save', function () {
    const self = this as any;
    // Always ensure the slug ends with the ID for uniqueness, similar to jelectronics
    if (!self.slug || self.slug === 'undefined' || !self.slug.endsWith(self._id.toString())) {
        const baseSlug = slugify(self.name);
        self.slug = `${baseSlug}-${self._id.toString()}`;
    }
});

// Optimize for performance and search
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
