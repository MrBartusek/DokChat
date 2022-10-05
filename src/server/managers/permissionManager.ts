import { Request } from 'express';
import db from '../db';
import sql from 'sql-template-strings';

export default class PermissionManager {
	public static async hasChatAccess(req: Request, chatId: string) {
		const permissionsQuery = await db.query(sql`
            SELECT EXISTS(SELECT 1 FROM participants WHERE user_id = $1 AND conversation_id=$2)
        `, [req.auth.id, chatId]);
		return permissionsQuery.rows[0].exists;
	}
}
