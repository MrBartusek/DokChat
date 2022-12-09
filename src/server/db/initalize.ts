import * as DateFns from 'date-fns';
import sql from 'sql-template-strings';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';
import db from './index';

export async function initializeDB() {
	await db.query(sql`
        CREATE TABLE IF NOT EXISTS users (
            id varchar NOT NULL,
            password_hash varchar NOT NULL,
            username varchar(32) NOT NULL,
            tag varchar(4) NOT NULL,
            email varchar(255) NOT NULL UNIQUE,
            avatar varchar(64),
            last_seen bigint NOT NULL,
            created_at bigint NOT NULL,

            is_system boolean NOT NULL DEFAULT FALSE,
            is_admin boolean NOT NULL DEFAULT FALSE,
            is_banned boolean NOT NULL DEFAULT FALSE,
            is_email_confirmed boolean NOT NULL DEFAULT FALSE,
            
            last_email_confirm_attempt bigint,
            last_pass_reset_attempt bigint,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS chats (
            id varchar NOT NULL,
            is_group boolean NOT NULL,
            name varchar(32),
            avatar varchar(64),
            color SMALLINT DEFAULT 0,
            creator_id varchar REFERENCES users ON DELETE CASCADE,
            created_at bigint NOT NULL,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS messages (
            id varchar NOT NULL,
            chat_id varchar REFERENCES chats ON DELETE CASCADE,
            author_id varchar REFERENCES users ON DELETE CASCADE,
            content text,
            created_at bigint NOT NULL,
            attachment varchar(64),
            attachment_type varchar(16),
            attachment_height smallint,
            is_system boolean NOT NULL DEFAULT FALSE,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS participants (
            id varchar NOT NULL,
            user_id varchar REFERENCES users ON DELETE CASCADE,
            chat_id varchar REFERENCES chats ON DELETE CASCADE,
            created_at bigint NOT NULL,
            is_hidden boolean NOT NULL DEFAULT FALSE,
            PRIMARY KEY (id)
        );

        CREATE TABLE IF NOT EXISTS email_blacklist (
            id varchar NOT NULL,
            email varchar(255) NOT NULL UNIQUE,
            PRIMARY KEY (id)
        );
    `);

	const existQuery = await db.query(sql`SELECT EXISTS(SELECT 1 FROM users WHERE is_system = 'true')`);
	if(!existQuery.rows[0].exists) {
		const systemUserId = snowflakeGenerator.getUniqueID().toString();
		const chatID = snowflakeGenerator.getUniqueID().toString();
		const timestamp = DateFns.getUnixTime(new Date());
		await db.query(sql`
            INSERT INTO users
                (id, password_hash, username, tag, email, last_seen, created_at, is_system)
            VALUES
                (
                    $1, 'x', 'DokChat', '0001', 'dokchat-admin@dokurno.dev', $2, $2, 'true'
                );
         `, [ systemUserId, timestamp ]);

		await db.query(sql`
            INSERT INTO chats
                (id, name, creator_id, created_at, is_group)
            VALUES
                ($3, 'DokChat General', $1, $2, 'true');
        `, [ systemUserId, timestamp, chatID ]);

		await db.query(sql`
            INSERT INTO participants
                (id, user_id, chat_id, created_at)
            VALUES
                ($3, $1, $3, $2);
        `, [ systemUserId, timestamp, chatID ]);
	}
}
