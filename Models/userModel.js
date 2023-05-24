const mongoose = require('../DB/connect');
const adressSchema = require('./adressesModel');


const userSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    admin: {
      type: Boolean,
      default: false
    },
    purchasedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product'
    }],
    addresses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now 
    },
    verified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  });
  
  module.exports = mongoose.model('User', userSchema);