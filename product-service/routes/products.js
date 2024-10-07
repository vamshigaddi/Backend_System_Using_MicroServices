// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Adjust the path if necessary
const { emitEvent } = require('../rabbitmq'); // Import the emitEvent function

// Create a new product
router.post('/create', async (req, res) => {
    const { name, description, price, inventory } = req.body;

    const newProduct = new Product({
        name,
        description,
        price,
        inventory,
    });

    try {
        await newProduct.save();

        // Emit "Product Created" event
        const productCreatedEvent = { event: "Product Created", data: { productId: newProduct.id } };
        await emitEvent('product-created', productCreatedEvent);

        res.status(201).json({ success: true, message: 'Product created successfully', data: newProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, message: 'Error creating product' });
    }
});

// Other product management routes (update, delete, etc.) can be added here


// Update inventory
router.put('/update-inventory/:productId', async (req, res) => {
    const { productId } = req.params;
    const { inventory } = req.body;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.inventory = inventory;
        await product.save();

        // Emit "Inventory Updated" event
        const inventoryUpdatedEvent = { event: "Inventory Updated", data: { productId: product._id, inventory: product.inventory } };
        await emitEvent('inventory-updated', inventoryUpdatedEvent);

        res.status(200).json({ success: true, message: 'Inventory updated successfully', product });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error updating inventory', error: err.message });
    }
});

// Delete a product
router.delete('/delete/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findByIdAndDelete(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const inventoryDeletedEvent = { event: "product deleted", data: { productId: product._id } };
        await emitEvent('product-deleted', inventoryDeletedEvent);
        
        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error deleting product', error: err.message });
    }
});


// Get all products
router.get('/', async (req, res) => {
    try {
        // Fetch all products from the database
        const products = await Product.find();

        // Return the list of products
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, message: 'Error fetching products' });
    }
});


// Get a product by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params; // Get the product ID from the route parameters

    try {
        // Fetch the product from the database by its ID
        const product = await Product.findById(id);

        // Check if the product exists
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Return the product details
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({ success: false, message: 'Error fetching product' });
    }
});



module.exports = router;

