import * as express from 'express';
import { body, validationResult } from 'express-validator';
import * as multer from 'multer';
import sql from 'sql-template-strings';
import { CHAT_COLORS } from '../../../types/colors';
import { ApiResponse } from '../../apiResponse';
import s3Client from '../../aws/s3';
import db from '../../db';
import { systemMessageHandler } from '../../handlers/systemMessageHandler';
import ChatManager from '../../managers/chatManager';
import PermissionsManager from '../../managers/permissionsManager';
import allowedMethods from '../../middlewares/allowedMethods';
import ensureAuthenticated from '../../middlewares/ensureAuthenticated';
import { isValidColor } from '../../validators/isValidColor';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.all('/update',
	ensureAuthenticated(),
	allowedMethods('PUT'),
	upload.single('avatar'),
	body('id').isString(),
	body('name').optional().isLength({max: 32, min: 2}),
	body('color').optional().custom(isValidColor),
	async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return new ApiResponse(res).validationError(errors);

		const id: string = req.body.id;
		const name: string = req.body.name;
		const color: string = req.body.color;
		const avatar = req.file;

		if(!(await PermissionsManager.hasChatAccess(req.auth, id))) {
			return new ApiResponse(res).forbidden();
		}

		const isGroup = await ChatManager.isGroup(id);

		if(!isGroup && (avatar || name)) {
			return new ApiResponse(res).badRequest('This chat is not a group');
		}

		// Upload avatar to S3
		if(avatar) {
			const oldAvatar = await getChatAvatar(id);
			if(oldAvatar) await s3Client.deleteFile(oldAvatar);
			const fileName = await s3Client.uploadAvatar(avatar);
			await db.query(sql`UPDATE chats SET avatar = $1 WHERE id=$2`, [ fileName, id ]);
		}

		if(name) {
			await db.query(sql`
				UPDATE chats SET name = $1 WHERE id=$2`,
			[ name, id ]);
		}

		if(color) {
			await db.query(sql`
				UPDATE chats SET color = $1 WHERE id=$2`,
			[ CHAT_COLORS.find(c => c.hex == color).id, id ]);
		}

		systemMessageHandler.sendChatUpdated(
			id,
			req.auth,
			name != undefined,
			avatar != undefined,
			color != undefined
		);
		return new ApiResponse(res).success();
	});

async function getChatAvatar(chatId: string): Promise<string | null> {
	const avatarQuery = await db.query(sql`SELECT avatar FROM chats WHERE id=$1`, [ chatId ]);
	if(avatarQuery.rowCount != 1) throw new Error('Invalid chat id provided to getChatAvatar');
	return avatarQuery.rows[0].avatar;
}

export default router;
