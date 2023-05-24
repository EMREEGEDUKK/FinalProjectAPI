const mongoose = require('mongoose');
const config = require('../configs/indexConfig');
config.homeConfig();
const MONGO_URI = process.env.MONGO_URI;


mongoose.connect(MONGO_URI, {   
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4
 })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


module.exports = mongoose;
    