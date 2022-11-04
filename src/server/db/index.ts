import { Pool, PoolConfig } from 'pg';

let poolConfig: PoolConfig = {};

if(process.env.NODE_ENV === 'production') {
	poolConfig = {
		connectionString: process.env.DATABASE_URL,
		ssl: {
			rejectUnauthorized: false
		}
	};
}
else {
	poolConfig = {
		user: 'postgres',
		password: 'postgres',
		host: 'localhost',
		database: 'dokchat',
		port: 5432
	};

}

const pool = new Pool(poolConfig);

export default pool;
