// routes/admin/productRoutes.js

const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const uploadImage = require('../../middlewares/upload');

// Validation middleware for creating or updating a product
const validateProduct = [
  check('name').trim().notEmpty().withMessage('Product name is required'),
  check('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required'),
  check('category').isMongoId().withMessage('Invalid category ID'),
  check('price.regular')
    .isFloat({ min: 0 })
    .withMessage('Regular price must be a positive number'),
  check('price.distributor')
    .isFloat({ min: 0 })
    .withMessage('Distributor price must be a positive number'),
  check('price.dealer').isFloat({ min: 0 }).withMessage('Dealer price must be a positive number'),
  check('price.contractor')
    .isFloat({ min: 0 })
    .withMessage('Contractor price must be a positive number'),
  check('discount.distributor')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Distributor discount must be between 0 and 100'),
  check('discount.dealer')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Dealer discount must be between 0 and 100'),
  check('discount.contractor')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Contractor discount must be between 0 and 100'),
  check('salesTax.distributor')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Distributor sales tax must be between 0 and 100'),
  check('salesTax.dealer')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Dealer sales tax must be between 0 and 100'),
  check('salesTax.contractor')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Contractor sales tax must be between 0 and 100'),
  check('shippingCost')
    .isFloat({ min: 0 })
    .withMessage('Shipping cost must be a positive number'),
];

// Create new product route with validation and image upload
router.post('/', validateProduct, uploadImage.array('images'), productController.createProduct);

// Update product route with validation and image upload
router.put('/:productId', validateProduct, uploadImage.array('images'), productController.updateProduct);

// Get all products route
router.get('/', productController.getAllProducts);

// Get a single product route
router.get('/:productId', productController.getProductById);

// Delete product route
router.delete('/:productId', productController.deleteProduct);

module.exports = router;
