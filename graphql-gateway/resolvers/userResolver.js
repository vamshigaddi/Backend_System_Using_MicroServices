const axios = require('axios');

const userResolver = {
  Query: {
    users: async () => {
      try {
        const response = await axios.get('http://user-service:3000/api/users');
        console.log("Response from user service:", response.data);

        const users = response.data; // Assuming response.data is an array

        // Log each user to check for undefined or null usernames
        // users.forEach(user => {
        //   console.log("User:", user);
        //   if (!user.username) {
        //     console.warn("User has no username:", user);
        //   }
        // });

        // Map through users to return the correct structure
        return users.map(user => ({
          id: user._id,
          username: user.username || "Unknown", // Default value if username is null or undefined
          email: user.email || "No email",  // Default value if email is null or undefined
        }));
      } catch (error) {
        console.error("Error fetching users:", error);
        throw new Error("Failed to fetch users");
      }
    },

    user: async (_, { id }) => {
      try {
        const response = await axios.get(`http://user-service:3000/api/users/${id}`);
        const user = response.data;

        return {
          id: user._id,
          username: user.username,
          email: user.email,
        };
      } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
      }
    },
  },

  Mutation: {
    createUser: async (_, { username, email, password }) => {
        try {
            // Send a request to the User Service to register the user
            const response = await axios.post('http://user-service:3000/api/users/register', { username, email, password });
            //console.log("creating user:", response); // Log the entire response object
            // Return the newly created user data
            const createdUser = response.data.data;

            // Ensure the response has username, email, and id
            return {
              id: createdUser.userId, // Access the userId from the response
              username: createdUser.username, // Ensure username is returned from the response
              email: createdUser.email // Ensure email is returned from the response
            };
        } catch (error) {
            // Handle errors, e.g., user already exists or other errors from User Service
            if (error.response) {
                // If the user service responded with an error
                throw new Error(error.response.data.message || "Failed to create user");
            } else {
                // If there was a network error or something else
                console.error("Error creating user:", error.message);
                throw new Error("Error creating user. Please try again.");
            }
        }
    }
}
};

module.exports = userResolver;

