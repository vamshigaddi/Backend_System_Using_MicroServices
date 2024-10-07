const axios = require('axios');

const productResolver = {
  Query: {
    products: async () => {
      try {
        // Fetch products from the Product Service API
        const response = await axios.get('http://product-service:3001/api/products');
        
        // Ensure the response is an array of products
        const products = response.data.data; // Assuming 'data' contains the list of products
        //console.log("products:", products);
        
        // Return the array of products
    
        return products.map(product => ({
          id: product._id,
          name: product.name,
          description: product.description,
          price :product.price,
          inventory : product.inventory
        }));
      } catch (error) {
        console.error("Error fetching products:", error.response ? error.response.data : error.message);
        throw new Error("Failed to fetch products");
      }
    },
    
    product: async (_, { id }) => {
      try {
        const response = await axios.get(`http://product-service:3001/api/products/${id}`);
        const products = response.data.data; // Assuming 'data' contains the list of products
        return {
          id: products._id,
          name: products.name,
          description: products.description,
          price :products.price,
          inventory : products.inventory
        };
      } catch (error) {
        console.error("Error fetching product:", error);
        throw new Error("Failed to fetch product");
      }
    },
  },

  Mutation: {
    createProduct: async (_, { name, description, price, inventory }) => {
      try {
        const response = await axios.post('http://product-service:3001/api/products/create', { 
          name, 
          description, 
          price, 
          inventory 
        });
        
        const createdProduct = response.data.data;

        // Ensure the response has the necessary fields
        return {
          id: createdProduct._id,
          name: createdProduct.name,
          description: createdProduct.description,
          price: createdProduct.price,
          inventory: createdProduct.inventory,
        };
      } catch (error) {
        console.error("Error creating product:", error.response ? error.response.data : error.message);
        throw new Error("Failed to create product");
      }
    },
  },
};

module.exports = productResolver;
