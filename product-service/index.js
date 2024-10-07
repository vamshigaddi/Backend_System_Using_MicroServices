// index.js
const mongoose = require('mongoose');
const express = require('express');
const productRoutes = require('./routes/products');
const { connectRabbitMQ } = require('./rabbitmq');
const {listenForOrderPlacedEvents} = require('./rabbitmq')

// Create an Express application
const app = express();
const PORT = 3001; // Use a different port than the user service

// Connect to MongoDB
mongoose.connect('mongodb+srv://Username:password@cluster0.o17cq.mongodb.net/productDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));


// Middleware to parse JSON requests
app.use(express.json());

// Use product routes
app.use('/api/products', productRoutes);

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
// Start listening for events after RabbitMQ connection

// connectRabbitMQ().then(() => {
//     listenForOrderPlacedEvents();
// });

