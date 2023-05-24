const jwt = require('jsonwebtoken');
const config = require('../configs/indexConfig');
const User = require('../Models/userModel');
config.homeConfig();

const verifyAccount = async (req, res) => {
    const token = req.params.token;
  
  try {
   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email } = decoded;
    
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    
    user.verified = true;
    user.verificationToken = undefined;
    await user.save();
    
    
    res.status(200).json({ message: 'Account verified successfully',
    user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
    verifyAccount
}