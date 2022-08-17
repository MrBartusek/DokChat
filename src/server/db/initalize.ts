import db from './index';
import sql from 'sql-template-strings';

export function initializeDB() {
	db.query(sql`
    CREATE TABLE IF NOT EXISTS users (
        id VARCHAR NOT NULL,
        password_hash VARCHAR NOT NULL,
        username VARCHAR(32) NOT NULL,
        tag INTEGER NOT NULL,
        email VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
    );
`);
}
