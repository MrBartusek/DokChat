import sql from 'sql-template-strings';
import db from '../db';
import { snowflakeGenerator } from '../utils/snowflakeGenerator';

export default class EmailBlacklistManager {
	public static async blacklistEmail(email: string): Promise<string> {
		if (await this.isEmailBlacklisted(email)) return;

		const id = snowflakeGenerator.getUniqueID().toString();
		await db.query(sql`INSERT INTO email_blacklist (id, email) VALUES ($1, $2)`, [ id, email ]);
		return id;
	}

	public static async isEmailBlacklisted(email: string): Promise<boolean> {
		const existQuery = await db.query(sql`SELECT EXISTS(SELECT 1 FROM email_blacklist WHERE email = $1);`, [ email ]);
		return existQuery.rows[0].exists;
	}
}
