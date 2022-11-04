import { Pool, PoolConfig } from 'pg';

let poolConfig: PoolConfig = {};

export const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const host = process.env.DB_HOST;
const database = process.env.DB_NAME;
const port = process.env.DB_PORT as unknown as number;

poolConfig = {
	user: user || 'postgres',
	password: password || 'postgres',
	host: host || 'localhost',
	database: database || 'dokchat',
	port: port || 5432
};

const pool = new Pool(poolConfig);

export default pool;
