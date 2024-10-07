



const Product = require('./models/Product'); // Import the Product model
const amqp = require('amqplib');

let connection, channel;

// Connect to RabbitMQ
async function connectRabbitMQ() {
    try {
        //connection = await amqp.connect('amqp://172.17.0.2:5672');
        // connection = await amqp.connect('amqp://localhost'); 
        connection = await amqp.connect('amqp://rabbitmq_service:5672');
        channel = await connection.createChannel();
        console.log("RabbitMQ connection established");
        isRabbitMQConnected = true;  // Mark connection as successful
    } catch (err) {
        console.error("RabbitMQ connection failed", err);
        // Retry mechanism if RabbitMQ connection fails
        setTimeout(connectRabbitMQ, 5000);  // Retry connection every 5 seconds
    }
}

async function emitEvent(queueName, event, retryCount = 5, delay = 1000) {
    try {
        if (!channel) {
            console.error("RabbitMQ channel is not ready, retrying...");
            if (retryCount === 0) {
                throw new Error("Failed to emit event after multiple retries");
            }
            // Wait for a short time before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            return emitEvent(queueName, event, retryCount - 1, delay);
        }
        
        await channel.assertQueue(queueName, { durable: true });
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)), { persistent: true });
        console.log(`Event emitted to queue ${queueName}:`, event);
    } catch (err) {
        console.error("Failed to emit event", err);
    }
}

// Listen for "User Registered" events
function listenForUserRegisteredEvents() {
    if (!channel) {
        console.error("RabbitMQ channel is not ready");
        return;
    }

    channel.assertQueue('user-registered', { durable: true });
    channel.consume('user-registered', (msg) => {
        const event = JSON.parse(msg.content.toString());
        console.log('Received User Registered event:', event);
        channel.ack(msg); // Acknowledge message
    });
}

// Listen for "Product Created" events
function listenForProductCreatedEvents() {
    if (!channel) {
        console.error("RabbitMQ channel is not ready");
        return;
    }

    channel.assertQueue('product-created', { durable: true });
    channel.consume('product-created', (msg) => {
        const event = JSON.parse(msg.content.toString());
        console.log('Received Product Created event:', event);
        channel.ack(msg); // Acknowledge message
    });
}

// Listen for "Order Placed" events
function listenForOrderPlacedEvents() {
    if (!channel) {
        console.error("RabbitMQ channel is not ready");
        return;
    }

    channel.assertQueue('order-placed', { durable: true });
    channel.consume('order-placed', (msg) => {
        const event = JSON.parse(msg.content.toString());
        console.log('Received Order Placed event:', event);

        // Update inventory based on ordered products
        updateInventory(event.products);

        channel.ack(msg); // Acknowledge message
    });
}

// Function to update inventory based on ordered products
async function updateInventory(products) {
    for (const { productId, quantity } of products) {
        try {
            const product = await Product.findById(productId);
            if (product) {
                if (product.inventory >= quantity) {
                    product.inventory -= quantity;
                    await product.save();
                    console.log(`Inventory updated for Product ID: ${productId}, New Inventory: ${product.inventory}`);
                } else {
                    console.log(`Insufficient inventory for Product ID: ${productId}`);
                }
            } else {
                console.log(`Product with ID: ${productId} not found`);
            }
        } catch (error) {
            console.error(`Error updating inventory for Product ID: ${productId}`, error);
        }
    }
}

module.exports = { connectRabbitMQ, emitEvent, listenForUserRegisteredEvents, listenForOrderPlacedEvents, listenForProductCreatedEvents };
