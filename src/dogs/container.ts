import { ApolloServer } from 'apollo-server';
import oracledb from 'oracledb';
import { typeDefs } from './typedefs';
import { resolvers } from './resolvers';


const server = new ApolloServer({ typeDefs, resolvers });

async function closePoolAndExit() {
	console.log('\nTerminating');
	try {
		// Get the pool from the pool cache and close it when no
		// connections are in use, or force it closed after 10 seconds.
		// If this hangs, you may need DISABLE_OOB=ON in a sqlnet.ora file.
		// This setting should not be needed if both Oracle Client and Oracle
		// Database are 19c (or later).
		await oracledb.getPool().close(10);
		console.log('Pool closed');
		process.exit(0);
	} catch (err) {
		console.error(err.message);
		process.exit(1);
	}
}
process
	.once('SIGTERM', closePoolAndExit)
	.once('SIGINT', closePoolAndExit);


server.listen({ port: process.env.PORT || 8080 }).then(() => {
	oracledb.createPool({
		user: process.env.NODE_ORACLEDB_USER,
		password: process.env.NODE_ORACLEDB_PASSWORD,
		connectString: process.env.NODE_ORACLEDB_CONNECTIONSTRING,
		externalAuth: false
	});

	console.log('Server listening');
});
