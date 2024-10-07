// models/Product.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending', // e.g., Pending, Completed, Canceled
    },
    shippingDetails: { 
        type: String,    // Optional: could include tracking information
    }, 
});
module.exports = mongoose.model('Order', orderSchema);


