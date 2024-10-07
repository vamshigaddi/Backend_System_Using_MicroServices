const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const userResolver = require('./resolvers/userResolver');
const productResolver = require('./resolvers/productResolver');
const orderResolver = require('./resolvers/orderResolver');

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers: [
    userResolver,
    productResolver,
    orderResolver,
  ],
  formatError: (err) => {
    console.error('GraphQL Error:', err);
    return {
      message: err.message,
      locations: err.locations,
      path: err.path,
    };
  },
});


const startServer = async () => {
  try {
    // Start the Apollo Server
    await server.start();

    // Apply middleware to the Express app
    server.applyMiddleware({ app });

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`GraphQL Gateway running at http://localhost:${PORT}${server.graphqlPath}`);
    });
  } catch (err) {
    console.error('Error starting the server:', err);
  }
};

// Call the startServer function to kick things off
startServer();



