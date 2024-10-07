

// // rabbitmq.js
// const amqp = require('amqplib');

// let connection, channel;

// async function connectRabbitMQ() {
//     try {
//         connection = await amqp.connect('amqp://localhost');
//         channel = await connection.createChannel();
//         console.log("RabbitMQ connection established");
//     } catch (err) {
//         console.error("RabbitMQ connection failed", err);
//     }
// }

// async function emitEvent(queueName, event) {
//     try {
//         await channel.assertQueue(queueName, { durable: true });
//         channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)), { persistent: true });
//         console.log(`Event emitted to queue ${queueName}:`, event);
//     } catch (err) {
//         console.error("Failed to emit event", err);
//     }
// }


//     // Listen for "User Registered" events
//     channel.assertQueue('user-registered', { durable: true });
//     channel.consume('user-registered', (msg) => {
//         const event = JSON.parse(msg.content.toString());
//         console.log('Received User Registered event:', event);
//         // Update your state based on the user registration, if necessary
//         channel.ack(msg); // Acknowledge message
//     });



// module.exports = { connectRabbitMQ, emitEvent,listenForUserRegisteredEvents };


// const amqp = require('amqplib');

// let connection, channel;

// async function connectRabbitMQ() {
//     try {
//         connection = await amqp.connect('amqp://localhost'); // Connect to RabbitMQ server
//         channel = await connection.createChannel(); // Create a channel to communicate
//         console.log("RabbitMQ connection established");

//         // Set up the event listener after the connection is established
//         await listenForUserRegisteredEvents(); // Call the listener function here
//     } catch (err) {
//         console.error("RabbitMQ connection failed", err);
//     }
// }

// async function emitEvent(queueName, event) {
//     try {
//         await channel.assertQueue(queueName, { durable: true });
//         channel.sendToQueue(queueName, Buffer.from(JSON.stringify(event)), { persistent: true });
//         console.log(`Event emitted to queue ${queueName}:`, event);
//     } catch (err) {
//         console.error("Failed to emit event", err);
//     }
// }

// // Listen for "User Registered" events
// async function listenForUserRegisteredEvents() {
//     try {
//         await channel.assertQueue('user-registered', { durable: true });
//         channel.consume('user-registered', (msg) => {
//             const event = JSON.parse(msg.content.toString());
//             console.log('Received User Registered event:', event);
//             // Update your state based on the user registration, if necessary
//             channel.ack(msg); // Acknowledge the message
//         });
//     } catch (err) {
//         console.error("Failed to listen for User Registered events", err);
//     }
// }

// module.exports = { connectRabbitMQ, emitEvent, listenForUserRegisteredEvents };




const amqp = require('amqplib');

let connection, channel;

async function connectRabbitMQ() {
    try {
        // Connect to RabbitMQ server
        //connection = await amqp.connect('amqp://localhost');
        connection = await amqp.connect('amqp://rabbitmq_service:5672');
        //connection = await amqp.connect('amqp://172.17.0.2:5672');
        // Create a channel to communicate
        channel = await connection.createChannel();
        console.log("RabbitMQ connection established");

        // Set up event listeners after the connection is established
        await listenForInventoryUpdatedEvents(); // Call the listener for inventory-updated event
        await listenForProductCreatedEvents();   // Example: listen for product created events, if needed
        await listenForUserRegisteredEvents(); // Call the listener function here
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
async function listenForUserRegisteredEvents() {
    try {
        await channel.assertQueue('user-registered', { durable: true });
        channel.consume('user-registered', (msg) => {
            const event = JSON.parse(msg.content.toString());
            console.log('Received User Registered event:', event);
            // Update your state based on the user registration, if necessary
            channel.ack(msg); // Acknowledge the message
        });
    } catch (err) {
        console.error("Failed to listen for User Registered events", err);
    }
}


// Listen for "Inventory Updated" events
async function listenForInventoryUpdatedEvents() {
    try {
        await channel.assertQueue('inventory-updated', { durable: true });
        channel.consume('inventory-updated', (msg) => {
            const event = JSON.parse(msg.content.toString());
            console.log('Received Inventory Updated event:', event);

            // Update the local catalog with new inventory details
            updateProductInventory(event.productId, event.newInventory);
            
            channel.ack(msg); // Acknowledge the message
        });
    } catch (err) {
        console.error("Failed to listen for Inventory Updated events", err);
    }
}

// Function to update the local product catalog in the Order Service
async function updateProductInventory(productId, newInventory) {
    try {
        // Find the product in the Order Service's product catalog (e.g., from database)
        const product = await Product.findById(productId); // Assuming you have a Product model
        if (product) {
            product.inventory = newInventory; // Update the inventory
            await product.save(); // Save changes to the database
            console.log(`Product inventory updated in Order Service for Product ID: ${productId}, New Inventory: ${newInventory}`);
        } else {
            console.log(`Product with ID: ${productId} not found in Order Service`);
        }
    } catch (error) {
        console.error(`Error updating product inventory in Order Service for Product ID: ${productId}`, error);
    }
}

// Optional: Listen for other events, like "Product Created"
async function listenForProductCreatedEvents() {
    try {
        await channel.assertQueue('product-created', { durable: true });
        channel.consume('product-created', (msg) => {
            const event = JSON.parse(msg.content.toString());
            console.log('Received Product Created event:', event);
            // Handle the product creation event, such as adding to the local catalog
            channel.ack(msg); // Acknowledge the message
        });
    } catch (err) {
        console.error("Failed to listen for Product Created events", err);
    }
}

module.exports = { connectRabbitMQ, emitEvent,listenForUserRegisteredEvents, listenForInventoryUpdatedEvents };
