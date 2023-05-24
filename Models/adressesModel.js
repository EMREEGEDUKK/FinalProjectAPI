const mongoose = require('../DB/connect');


const addressSchema = new mongoose.Schema({
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  });


module.exports = mongoose.model('Address', addressSchema);

