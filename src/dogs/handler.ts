import { ApolloServer } from '@apollo/server';
import {
	startServerAndCreateLambdaHandler,
	handlers,
  } from '@as-integrations/aws-lambda';
  
import { typeDefs } from './typedefs';
import { resolvers } from './resolvers';

const server = new ApolloServer({ typeDefs, resolvers });
const graphqlHandler = startServerAndCreateLambdaHandler(
	server,
	// We will be using the Proxy V2 handler
	handlers.createAPIGatewayProxyEventV2RequestHandler()
  );
exports.handler = graphqlHandler;
