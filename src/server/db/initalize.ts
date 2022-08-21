import db from './index';
import sql from 'sql-template-strings';
import * as DateFns from 'date-fns';

export function initializeDB() {
	db.query(sql`
        CREATE TABLE IF NOT EXISTS users (
            id varchar NOT NULL,
            password_hash varchar NOT NULL,
            username varchar(32) NOT NULL,
            tag varchar(4) NOT NULL,
            email varchar(255) NOT NULL,
            joined bigint NOT NULL,
            last_seen bigint NOT NULL,
            PRIMARY KEY (id)
        );
    `);
}
