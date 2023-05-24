const fs = require('fs');
const mongoose = require('mongoose');


const {body,validationResult,param,query } = require('express-validator');


const productModel = require('../Models/productModel');



const addProduct = async (req, res) => {


    await body('name', 'Name must be a non-empty string').isString().notEmpty().run(req);
    await body('price', 'Price must be a non-empty number').isNumeric().notEmpty().run(req);
    await body('description', 'Description must be a non-empty string').isString().notEmpty().run(req);
    await body('category', 'Category must be a non-empty string').isString().notEmpty().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, description, category } = req.body;
    const image = await req.file.path;
    const product =  new productModel({
        name,
        price,
        description,
        category,
        image
    });
    try {
        const newProduct = await product.save();
        res.status(201).json({
            message: 'Product Added Successfully',
            newProduct
        })
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error
        })
    }
}


const updateProduct = async (req, res) => {
    const id = req.params.id;

    await param('id', 'ID must be a non-empty string of hexadecimal digits').isHexadecimal().notEmpty().run(req);
    await body('name', 'Name must be a non-empty string').isString().notEmpty().run(req);
    await body('price', 'Price must be a non-empty number').isNumeric().notEmpty().run(req);
    await body('description', 'Description must be a non-empty string').isString().notEmpty().run(req);
    await body('category', 'Category must be a non-empty string').isString().notEmpty().run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, price, description, category } = req.body;
    const image = await req.file.path;
    const updatedDate = new Date();

    const updatedFields = {
        name,
        price,
        stock,
        description,
        category,
        image,
        updatedAt: updatedDate
    };

    try {
        const updatedProduct = await productModel.findByIdAndUpdate(id, updatedFields, { new: true });
        res.status(200).json({
            message: 'Product Updated Successfully',
            updatedProduct
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
};


const deleteProduct = async (req, res) => {
   
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          message: 'Invalid ID provided',
          statusCode: 400   
        });
      }

    try {
        const deletedProduct = await productModel.findByIdAndDelete(id);
        // delete the image from the server
        fs.unlink(deletedProduct.image, (err) => {
            if (err) {
                console.log(err);
            }
        });
        res.status(200).json({
            message: 'Product Deleted Successfully',
            deletedProduct
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
};





const listProducts = async (req, res) => {
    
    await query('page')
        .isInt({ min: 1 })
        .withMessage('Page should be a positive integer')
        .toInt()
        .run(req);

    await query('limit')
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit should be a positive integer between 1 and 100')
        .toInt()
        .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};

    if (endIndex < await productModel.countDocuments().exec()) {
        results.next = {
            page: page + 1,
            limit: limit
        }
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        }
    }

    try {
        results.results = await productModel.find().limit(limit).skip(startIndex).exec();
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
}



const getProductById = async (req, res) => {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: 'Invalid ID provided',
            statusCode: 400
        });
    }

    try {
        const product = await productModel.findById(id);
        res.status(200).json(product);

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }

}

const buyProduct = async (req, res) => {
    const id = req.params.id;
    const quantity = req.body.quantity;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
            message: 'Invalid ID provided',
            statusCode: 400
        });
    }

    if (quantity <= 0) {
        return res.status(400).json({
            message: 'Quantity must be a positive integer',
            statusCode: 400
        });
    }

    try {
        const product = await productModel.findById(id);
        if (product.stock < quantity) {
            return res.status(400).json({
                message: 'Quantity is more than the available stock',
                statusCode: 400
            });
        }

        product.stock -= quantity;
        await product.save();
        res.status(200).json({
            message: 'Product bought successfully',
            updatedProduct: product
        });

    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error
        });
    }
}






const getBody = (req,res) => {
    res.send(req.body);
}

module.exports = {
    addProduct,
    updateProduct,
    deleteProduct,
    listProducts,
    getBody,
    getProductById,
    buyProduct
}