const router = require('express').Router();
const {productController,userController,verifyController} = require('../Controllers/indexController');

const upload = require('../middlewares/uploads');

const {isAdmin,isUser} = require('../middlewares/authentication');




router.post('/add-product',isAdmin,upload.single('image'),productController.addProduct);

router.put('/update-product/:id',isAdmin,upload.single('image'),productController.updateProduct);

router.delete('/delete-product/:id',isAdmin,productController.deleteProduct);

router.get('/list-product/',isAdmin,productController.listProducts);

router.get('/get-product/:id',isAdmin,productController.getProductById);

router.get('/list-all-users/',isAdmin,userController.listAllUsers);





router.get('/get-body/',productController.getBody);

router.post('/register/',userController.register);


router.get('/verify/:token',verifyController.verifyAccount);

router.post('/login/',userController.login);

router.post('/logout/',userController.logout);

router.post('/forgot-password/',userController.forgotPassword);

router.get('/reset-password/:token',userController.resetPassword);

router.post('/reset-password/',userController.resetPasswordPost);

router.get('/get-user/',userController.getProfile);

router.post('/add-address/',userController.addAddress);

router.delete('/delete-address/:id',userController.deleteAddress);

router.put('/update-address/:id',userController.updateAddress);

router.get('/list-address/:id',userController.getAddress);

router.post('/create-order/:id',userController.createOrder);

router.get('/list-orders/',userController.listOrders);
















module.exports = router;