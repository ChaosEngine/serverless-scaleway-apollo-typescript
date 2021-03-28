import { ApolloServer } from 'apollo-server-lambda';

import { typeDefs } from './typedefs.js';
import { resolvers } from './resolvers.js';

const server = new ApolloServer({ typeDefs, resolvers });
exports.handler = server.createHandler();
