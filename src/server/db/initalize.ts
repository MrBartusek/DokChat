import db from './index';
import sql from 'sql-template-strings';
import UserManager from '../managers/userManager';
import * as DateFns from 'date-fns';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';

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
            attachment varchar(64),
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
