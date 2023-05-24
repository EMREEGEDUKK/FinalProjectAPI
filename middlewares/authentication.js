const jwt = require('jsonwebtoken');
const userModel = require('../Models/userModel');


const isAdmin = async (req, res, next) => {
    
    const cookie = req.cookies.token;
    const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
    const user = await userModel.findOne({email: decoded.email});

    if (!user) {
        return res.status(403).json({
            message: 'You are not allowed to perform this action'
        });
    }
    if (user.admin === false) {
        return res.status(403).json({
            message: 'You are not allowed to perform this action'
        });
    }

    next();
}

const isUser = (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({
            message: 'You are not allowed to perform this action'
        });
    }
    next();
}


module.exports = {
    isAdmin,
    isUser
}