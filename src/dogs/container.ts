import { ApolloServer } from 'apollo-server';

import { typeDefs } from './typedefs.js';
import { resolvers } from './resolvers.js';

const server = new ApolloServer({ typeDefs, resolvers });
server.listen({ port: process.env.PORT || 8080 }).then(() => console.log('Server listening'));
