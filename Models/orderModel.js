const mongoose = require('../DB/connect');



// create a order schema and one order can have many products and one product can have many orders and orders must have a one adress,user
const orderSchema = new mongoose.Schema({
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now

    }
});


module.exports = mongoose.model('Order', orderSchema);