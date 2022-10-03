import db from './index';
import sql from 'sql-template-strings';

export function initializeDB() {
	db.query(sql`
        CREATE TABLE IF NOT EXISTS users (
            id varchar NOT NULL,
            password_hash varchar NOT NULL,
            username varchar(32) NOT NULL,
            tag varchar(4) NOT NULL,
            email varchar(255) NOT NULL,
            avatar varchar(255),
            last_seen bigint NOT NULL,
            created_at bigint NOT NULL,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS conversations (
            id varchar NOT NULL,
            name varchar(32),
            avatar varchar(255),
            creator_id varchar REFERENCES users,
            created_at bigint NOT NULL,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id varchar NOT NULL,
            conversation_id varchar REFERENCES conversations,
            author_id varchar REFERENCES users,
            content text NOT NULL,
            created_at bigint NOT NULL,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS participants (
            id varchar NOT NULL,
            user_id varchar REFERENCES users,
            conversation_id varchar REFERENCES conversations,
            created_at bigint NOT NULL,
            PRIMARY KEY (id)
        );
    `);
}
