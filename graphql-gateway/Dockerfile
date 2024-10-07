# Use Node.js official image as a base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose port 4000 for GraphQL server
EXPOSE 4000

# Run the application
CMD ["npm", "start"]
