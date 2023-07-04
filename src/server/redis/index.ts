import { createClient } from 'redis';

const host = process.env.REDIS_HOST;
const password = process.env.REDIS_PASS;
const port = process.env.REDIS_PORT as unknown as number;

const client = createClient({
	password: password,
	socket: {
		port: port,
		host: host
	}
});

client.on('error', err => console.log('Redis Client Error', err));

export default client;
