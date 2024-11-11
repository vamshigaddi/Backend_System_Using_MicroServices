const amqp = require('amqplib');

let connection, channel;
let isRabbitMQConnected = false;  // This flag will ensure we only try to emit events after RabbitMQ is ready

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

// Listen for events from RabbitMQ
async function listenForEvents(queueName, callback) {
    try {
        await channel.assertQueue(queueName, { durable: true });
        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                console.log(`Event received from queue ${queueName}:`, msg.content.toString());
                callback(JSON.parse(msg.content.toString()));
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error("Failed to listen for events", err);
    }
}

module.exports = { connectRabbitMQ, emitEvent, listenForEvents };
