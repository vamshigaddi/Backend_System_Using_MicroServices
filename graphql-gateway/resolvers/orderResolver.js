const axios = require('axios');

const orderResolver = {
  Query: {
    orders: async () => {
      try {
        const response = await axios.get('http://order-service:3002/api/orders');
        const orders = response.data.data;

        return orders.map(order => ({
          id: order._id,
          productId: order.productId,
          quantity: order.quantity,
          status :order.status,
          userId : order.userId
        }));
      } catch (error) {
        console.error("Error fetching orders:", error);
        throw new Error("Failed to fetch orders");
      }
    },
    order: async (_, { id }) => {
      try {
        const response = await axios.get(`http://order-service:3002/api/orders/${id}`);
      
        const orders = response.data.data; // Assuming 'data' contains the list of products
        return {
          id: orders._id,
          productId: orders.productId,
          quantity: orders.quantity,
          status :orders.status,
          userId : orders.userId
        };
      } catch (error) {
        console.error("Error fetching order:", error);
        throw new Error("Failed to fetch order");
      }
    },
  },
  Mutation: {
    createOrder: async (_, {quantity, productId }) => {
      try {
        const response = await axios.post('http://order-service:3002/api/orders/create', { quantity, productId });
  
        const orders = response.data.data;

        // Ensure the response has the necessary fields
        return {
          id: orders._id,
          productId: orders.productId,
          quantity:orders.quantity,
          status: orders.status,
        };
      } catch (error) {
        console.error("Error creating order:", error.response ? error.response.data : error.message);
        throw new Error("Failed to create order");
      }
    },
  },
};

module.exports = orderResolver;
