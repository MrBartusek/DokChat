import db from './index';
import sql from 'sql-template-strings';

export async function initializeDB() {
	await db.query(sql`

        CREATE TABLE IF NOT EXISTS users (
            id varchar NOT NULL,
            password_hash varchar NOT NULL,
            username varchar(32) NOT NULL,
            tag varchar(4) NOT NULL,
            email varchar(255) NOT NULL,
            avatar varchar(32),
            last_seen bigint NOT NULL,
            created_at bigint NOT NULL,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS chats (
            id varchar NOT NULL,
            is_group boolean NOT NULL,
            name varchar(32),
            avatar varchar(255),
            creator_id varchar REFERENCES users ON DELETE CASCADE,
            created_at bigint NOT NULL,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id varchar NOT NULL,
            chat_id varchar REFERENCES chats ON DELETE CASCADE,
            author_id varchar REFERENCES users ON DELETE CASCADE,
            content text NOT NULL,
            created_at bigint NOT NULL,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS participants (
            id varchar NOT NULL,
            user_id varchar REFERENCES users ON DELETE CASCADE,
            chat_id varchar REFERENCES chats ON DELETE CASCADE,
            created_at bigint NOT NULL,
            is_hidden boolean DEFAULT FALSE,
            PRIMARY KEY (id)
        );
    `);
	await db.query(sql`
        INSERT INTO users
            (id, password_hash, username, tag, email, last_seen, created_at)
        VALUES
            (
                0,
                'x',
                'DokChat',
                '2115',
                'dokchat-admin@dokurno.dev',
                '0',
                '0'
            );

        INSERT INTO chats
            (id, creator_id, created_at, is_group)
        VALUES ( 0, 0, 0, 'true');
        
        INSERT INTO participants
			(id, user_id, chat_id, created_at)
		VALUES
			(0, 0, 0, 0)
        `).catch(() => console.error('Initial insert error'));
}
