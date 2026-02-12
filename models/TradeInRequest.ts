import mongoose from 'mongoose';

const TradeInRequestSchema = new mongoose.Schema({
    device: {
        type: String,
        required: [true, 'Device name is required']
    },
    brand: {
        type: String,
        required: [true, 'Brand is required']
    },
    storage: {
        type: String,
        default: 'N/A'
    },
    condition: {
        type: String,
        required: [true, 'Condition is required'],
        enum: ['Excellent', 'Good', 'Fair', 'Broken']
    },
    estimatedValue: {
        type: Number,
        default: 0
    },
    customerName: {
        type: String,
        required: [true, 'Customer name is required']
    },
    customerEmail: {
        type: String,
        required: [true, 'Customer email is required']
    },
    customerPhone: {
        type: String,
        required: [true, 'Customer phone is required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    adminNotes: {
        type: String
    }
}, { timestamps: true });

export default mongoose.models.TradeInRequest || mongoose.model('TradeInRequest', TradeInRequestSchema);
