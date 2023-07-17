import sql from 'sql-template-strings';
import { UserJWTData } from '../../types/jwt';
import db from '../db';

export default class PermissionsManager {
	public static async hasChatAccess(auth: UserJWTData, chatId: string) {
		const permissionsQuery = await db.query(sql`
            SELECT EXISTS(SELECT 1 FROM participants WHERE user_id = $1 AND chat_id=$2)
        `, [auth.id, chatId]);
		return permissionsQuery.rows[0].exists;
	}
}
