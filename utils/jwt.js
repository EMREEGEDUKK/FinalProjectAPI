const jwt = require('jsonwebtoken');
const config = require('../configs/indexConfig');
config.homeConfig();
const JWT_SECRET = process.env.JWT_SECRET;






 const createToken = (data) => {
     return jwt.sign({data},JWT_SECRET);
 }

module.exports = {
    createToken
}
