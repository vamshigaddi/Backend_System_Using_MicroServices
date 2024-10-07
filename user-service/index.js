const mongoose = require('mongoose');
const express = require('express'); // Make sure to import express here
const userRoutes = require('./routes/users'); // Adjust the path as necessary
const { connectRabbitMQ } = require('./rabbitmq');
const {listenForEvents} = require('./rabbitmq');

// Create an Express application
const app = express(); // Initialize app here
const PORT = 3000;
// Connect to MongoDB
mongoose.connect('mongodb+srv://MONGODB123:MONGODB123@cluster0.o17cq.mongodb.net/userDB?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

// Middleware to parse JSON requests
app.use(express.json());

// Use user routes
app.use('/api/users', userRoutes); // Use user routes here

// Basic route to check if server is running
app.get('/', (req, res) => {
    res.send('User Service is running!');
});

// Start the server
//const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});


// Call connectRabbitMQ to establish the connection
connectRabbitMQ().then(() => {
    listenForEvents();
});