
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
  }


  type Product {
    id: ID!
    name: String!
    description: String
    price: Float!
    inventory: Float!
  }

  type Order {
    id: ID!
    productId: ID!
    quantity: Int!
    status: String!
    userId: ID
  }

  type Query {
    users: [User]
    user(id: ID!): User
    products: [Product]
    product(id: ID!): Product
    orders: [Order]
    order(id: ID!): Order
  }

  type Mutation {
    createUser(username: String, email: String!, password: String!): User
    createProduct(name: String,description:String, price:Float!,inventory:Float!): Product
    createOrder(quantity:Float!, productId: [ID!]!): Order
  }
`;

module.exports = typeDefs;
