const mongoose = require('mongoose');
const {body,validationResult,param,query, cookie } = require('express-validator');
const userModel = require('../Models/userModel');
const addressModel = require('../Models/adressesModel');
const productModel = require('../Models/productModel');
const {ObjectId} = require('mongodb');
const orderModel = require('../Models/orderModel');
const nodeMailer = require('nodemailer');
const crypto = require('crypto');




const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const { verifyAccount } = require('./verifyController');




const register = async (req,res) => {
    try {
       
        
        await body('name', 'Name must be a non-empty string').isString().notEmpty().run(req);
        await body('email', 'Email must be a non-empty string').isEmail().notEmpty().run(req);
        await body('password', 'Password must be a non-empty string').isString().notEmpty().run(req);


        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const {name,email,password} = req.body;
        console.log(name,email,password);

        const hashedPassword = await bcrypt.hash(password,12);

        const findUser = await userModel.findOne({email:email});
        if(findUser){
            return res.status(400).json({
                status: 'fail',
                message: 'User already exists'
            });
            
        }
       

        const token = jwt.sign({ name, email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            secure: true,
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
    }});
    
        const message = {
            from: process.env.SMTP_EMAIL,
            to: email,
            subject: 'Account Verification',
            html: `<p>Hi ${name},</p><p>Please click <a href="http://localhost:5000/verify/${token}">here</a> to verify your account.</p>`
        };
    
         transporter.sendMail(message,(err,info) => {
            if(err){
                console.log(err);
                } else {
                    console.log(info);
            }});

        

         

        const user = await userModel.create({
            name,
            email,
            password:hashedPassword
        });

        user.verificationToken = token;
        await user.save();

        res.status(200).json({ message: 'Verification email sent' });

        
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });


}
}


const login = async (req,res) => {
    try {
        await body('email', 'Email must be a non-empty string').isEmail().notEmpty().run(req);
        await body('password', 'Password must be a non-empty string').isString().notEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const {email,password} = req.body;

        

        const findUser = await userModel.findOne({email:email});

        if(!findUser){
            return res.status(400).json({
                status: 'fail',
                message: 'User does not exist'
            });

        }

        const isMatch = await bcrypt.compare(password,findUser.password);

        if(!isMatch){
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign({ email: email , name : findUser.name}, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            token
        });


    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}

const logout = async (req,res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({
            status: 'success',
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}


const forgotPassword = async (req,res) => {
    try {
        await body('email', 'Email must be a non-empty string').isEmail().notEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const email = req.body.email;
    
    const user = await userModel.findOne({ email: email });
    if (!user) {
        res.status(400).json({
            status: 'fail',
            message: 'User does not exist'
        });
    }
    
    const token = crypto.randomBytes(20).toString('hex');
    
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();
    
    const transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    });


    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Reset Password request',
      text: 'Click on the link below to reset your password: ' +
            'http://' + req.headers.host + '/reset-password/' + token + '\n\n' +
            'link one hour to expire'
    };


    await transporter.sendMail(mailOptions);


    res.status(200).json({ message: 'Password reset link sent to your email address' });

  } catch (error) {
    res.status(500).json({
        status: 'fail',
        message: error.message
    });
}
};

const resetPassword = async (req,res) => {
    try {
        
        const user = await userModel.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
          res.status(400).json({ message: 'Password reset link is invalid or expired' });
        }
        
        res.status(200).json({ 
            message: 'token is valid',
            user 
            });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred, please try again' });
      }
    };


const resetPasswordPost = async (req,res) => {
    try {
        
        const user = await userModel.findOne({resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } });
        if (!user) {
          return  res.status(400).json({
                status: 'fail',
                message: 'User does not exist'
            });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
        
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();


        res.status(200).json({ message: 'Your password has been successfully reset' });
        } catch (error) {
        res.status(500).json({ 
                    message: 'An error occurred, please try again',
                    error 
                });
        }
        };

const getProfile = async (req,res) => {
    try {
        const cookie = req.cookies.token;
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}

const addAddress = async (req,res) => {
    try {
        
        const cookie = req.cookies.token;
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});
        console.log(user);
        const { street, city, country, zip } = req.body;

        const address = new addressModel({
            street,
            city,
            country,
            zip,
            user: user._id
          });
            
    
          await address.save();
          user.addresses.push(address._id);
          await user.save();
      
          res.status(201).json(address);


        } catch (error) {
            res.status(500).json({
                status: 'fail',
                message: error.message
            });
        }    
   }

   


const updateAddress = async (req,res) => {
    try {
        const cookie = req.cookies.token;
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});
        const address = await addressModel.findById(req.params.id);
        if(!address){
            return res.status(404).json({
                status: 'fail',
                message: 'Address not found'
            });
        }
        if(address.user.toString() !== user._id.toString()){
            return res.status(401).json({
                status: 'fail',
                message: 'Not authorized'
            });
        }
        const { street, city, country, zip } = req.body;
        address.street = street;
        address.city = city;
        address.country = country;
        address.zip = zip;
        await address.save();
        res.status(200).json({
            status: 'success',
            message: 'Address updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}


const deleteAddress = async (req,res) => {
    try {
        const cookie = req.cookies.token;
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});
        const address = await addressModel.findById(req.params.id);
        if(!address){
            return res.status(404).json({
                status: 'fail',
                message: 'Address not found'
            });
        }
        if(address.user.toString() !== user._id.toString()){
            return res.status(401).json({
                status: 'fail',
                message: 'Not authorized'
            });
        }
        await addressModel.findByIdAndDelete(req.params.id);
        await userModel.findByIdAndUpdate(user._id, {
            $pull: { addresses: req.params.id }
        });


        res.status(200).json({
            status: 'success',
            message: 'Address deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}


const getAddress = async (req,res) => {
    try {
        const cookie = req.cookies.token;
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});
        const address = await addressModel.findById(req.params.id);
        if(!address){
            return res.status(404).json({
                status: 'fail',
                message: 'Address not found'
            });
        }
        if(address.user.toString() !== user._id.toString()){
            return res.status(401).json({
                status: 'fail',
                message: 'Not authorized'
            });
        }
        res.status(200).json(address);
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}


const createOrder = async (req,res) => {
    try {
        const cookie = req.cookies.token;
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});
        const address = await addressModel.findById(req.params.id);
        if(!address){
            return res.status(404).json({
                status: 'fail',
                message: 'Address not found'
            });
        }
        if(address.user.toString() !== user._id.toString()){
            return res.status(401).json({
                status: 'fail',
                message: 'Not authorized'
            });

        }


        const products = await productModel.find({
            _id: { $in: req.body.products }
        });

        const convertToObjectId = (str) => {
            return new ObjectId(str);
          }
          
          
        const productIds = products.map(convertToObjectId);


         

        const productQuantities = req.body.products.reduce((acc, product) => {
            acc[product] = (acc[product] || 0) + 1;
            return acc;
            }, {});

        console.log(productQuantities);


        const checkStock = products.every((product) => {
            return product.stock >= productQuantities[product._id.toString()];

        });

        if(!checkStock){


            const outOfStock = products.filter((product) => {
                return product.stock < productQuantities[product._id.toString()];
            }
            );

            return res.status(400).json({
                status: 'fail',
                message: `Out of stock: ${outOfStock.map((product) => {
                    return `product_id :${product._id.toString()}, product_stock: ${product.stock} `  
                } 
                )}`
            });
        
        }

        products.forEach(async (product) => {
            product.stock -= productQuantities[product._id.toString()];
            await product.save();

        });

        const totalPrice = products.reduce((acc, product) => {
            return acc + product.price * productQuantities[product._id.toString()];
        }, 0);


        const order = new orderModel({
            user: user._id,
            adress: address._id,
            products: productIds,
            totalPrice: totalPrice 
        });

        await order.save();

     

        const orderAddress = await addressModel.findById(order.adress);





        const transporter = nodeMailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Order confirmation',
            text: `Your order has been placed successfully. 
            Your total is ${order.totalPrice} and your products are ${products.map((product) => {
                return `product_id :${product._id.toString()}, product_stock: ${productQuantities[product._id.toString()]}`
            })}
            your address is  ${orderAddress.street}, ${orderAddress.city}, ${orderAddress.country}, ${orderAddress.zip}
             `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if(error){
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });


        
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}


const listOrders = async (req,res) => {
    try {
        const cookie = req.cookies.token;
        const decoded = jwt.verify(cookie, process.env.JWT_SECRET);
        const user = await userModel.findOne({email: decoded.email});
        const orders = await orderModel.find({user: user._id});
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}

const geturl = async (req,res) => {
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;
    res.status(200).json({
        status: 'success',
        url: url
    });
}


const listAllUsers = async (req,res) => {
    try {
        const users = await userModel.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({
            status: 'fail',
            message: error.message
        });
    }
}














module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    resetPasswordPost,
    getProfile,
    addAddress,
    updateAddress,
    deleteAddress,
    getAddress,
    createOrder,
    listOrders,
    geturl,
    listAllUsers
}






