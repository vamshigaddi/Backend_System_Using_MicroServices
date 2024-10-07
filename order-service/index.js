// index.js
const mongoose = require('mongoose');
const express = require('express');
const orderRoutes = require('./routes/order');
const { connectRabbitMQ } = require('./rabbitmq');
//const {listenForOrderPlacedEvents} = require('./rabbitmq')

// Create an Express application
const app = express();
const PORT = 3002; // Use a different port than the user service

// Connect to MongoDB
mongoose.connect('mongodb+srv://Username:password@cluster0.o17cq.mongodb.net/orderDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));


// Middleware to parse JSON requests
app.use(express.json());

// Use product routes
app.use('/api/orders', orderRoutes);

// Basic route to check if the server is running
app.get('/', (req, res) => {
    res.send('Product Service is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});

// Call connectRabbitMQ to establish the connection
connectRabbitMQ()


