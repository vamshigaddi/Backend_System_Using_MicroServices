const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { emitEvent } = require('../rabbitmq');


// Create a new order
router.post('/create', async (req, res) => {
    const { productId, quantity,  } = req.body; // Include userId

    const newOrder = new Order({
        productId: productId, 
        quantity: quantity,
        status: "Pending", // Set the initial status of the order
      });
  

    try {
        await newOrder.save();
        const orderPlacedEvent = { event: "Order Placed", data: { orderId: newOrder.id, productId, quantity } };
        await emitEvent('order-placed', orderPlacedEvent);
        res.status(201).json({ success: true, message: 'Order created successfully', data: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, message: 'Error creating order' });
    }
});


// Other routes for order management (update, delete, etc.) can be added here


// Get an order by ID
router.get('/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error('Error retrieving order:', error);
        res.status(500).json({ success: false, message: 'Error retrieving order' });
    }
});

// Ship an order
router.post('/ship/:orderId', async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        if (order.status !== 'Pending') {
            return res.status(400).json({ success: false, message: 'Only pending orders can be shipped' });
        }
        order.status = 'Shipped';
        await order.save();

        // Emit "Order Shipped" event
        const orderShippedEvent = { event: "Order Shipped", data: { orderId: order._id } };
        await emitEvent('order-shipped', orderShippedEvent);

        res.status(200).json({ success: true, message: 'Order shipped successfully', order });
    } catch (error) {
        console.error('Error shipping order:', error);
        res.status(500).json({ success: false, message: 'Error shipping order' });
    }
});

// Get all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find(); // Fetch all orders from the database
        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ success: false, message: 'Error retrieving orders' });
    }
});


module.exports = router;
