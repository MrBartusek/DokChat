import validator from 'validator';
import { SimpleChatParticipant, User } from '../../types/common';
import { UserJWTData } from '../../types/jwt';
import { IncomingMessage } from 'http';
import { InternalChatParticipant } from '../types/common';

export default class Utils {
	public static apiUrl() {
		return (process.env.SERVER_BASE_URL ?? 'http://localhost:3000/') + 'api/';
	}

	public static avatarUrl(id: string) {
		return Utils.apiUrl() + `avatar/${id}.png`;
	}

	public static attachmentUrl(id: string) {
		return Utils.apiUrl() + `attachment?id=${id}`;
	}

	public static userDiscriminator(user: UserJWTData | User) {
		return `${user.username}#${user.tag}`;
	}

	public static emailToUsername(email: string): string {
		// eslint-disable-next-line
		const invalidCharacters = /[^0-9a-zA-Z_.\-]+/g;

		const normalized = validator.normalizeEmail(email);
		if (normalized == false) throw new Error('Invalid e-mail passed for emailToUsername');
		const inbox = normalized.split('@')[0];
		let username = inbox.replace(invalidCharacters, '');

		// Add random numbers at the end of username
		while (username.length < 5) {
			username += Math.floor(Math.random() * 10);
		}

		return username.substring(0, 32);
	}

	public static requestedFromElectron(req: Express.Request | IncomingMessage): boolean {
		const userAgent = (req as any).headers['user-agent'] as string;
		return userAgent.toLowerCase().indexOf(' electron/') > -1;
	}

	public static isDev(): boolean {
		return process.env.NODE_ENV != 'production';
	}

	public static convertParticipantsToSimple(participants: InternalChatParticipant[]): SimpleChatParticipant[] {
		return participants.map(p => ({
			id: p.id,
			userId: p.userId,
			avatar: p.avatar,
			username: p.username,
			tag: p.tag
		}));
	}
}
