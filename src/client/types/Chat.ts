import * as DateFns from 'date-fns';
import { Chat, ChatColor, LastMessage, Message, SimpleChatParticipant } from '../../types/common';
import { UserJWTData } from '../../types/jwt';
import Utils from '../helpers/utils';
import { LocalUser } from './LocalUser';

/**
 * Local client version of message with additional properties
 * for handling sending lifecycle
 */
export interface LocalMessage extends Message {
	isPending?: boolean;
	isFailed?: boolean;
}

/**
 * Local client version of chat object that handles initialization
 * and adding messages
 */
export class LocalChat implements Chat {
	/**
	 * Is this chat initialized?
	 *
	 * Initialized chats haven't been opened and fetched and thus
	 * relay on last message and don't have a message list
	 */
	public isInitialized: boolean;
	private _user: LocalUser;
	private _messages: LocalMessage[] | LastMessage;
	private lastPendingIndex = 0;
	public id: string;
	private _name: string | null;
	private _avatar: string | null;
	public isGroup: boolean;
	public createdAt: string;
	public creatorId: string;
	public color: ChatColor;
	public participants: SimpleChatParticipant[];
	private _lastRead: string;

	constructor(chat: Chat, user: LocalUser) {
		this.isInitialized = false;
		this._user = user;
		this.id = chat.id;
		this._name = chat.name;
		this._avatar = chat.avatar;
		this.color = chat.color;
		this.isGroup = chat.isGroup;
		this.createdAt = chat.createdAt;
		this.creatorId = chat.creatorId;
		this._messages = chat.lastMessage || [];
		this.participants = chat.participants;

		const me = this.participants.find(p => p.userId == this._user.id);
		this._lastRead = me.lastRead;
	}

	/**
	 * Name and avatar for DMs are different for each user and are
	 * generated on frontend
	 */

	get name(): string {
		if(this._name) return this._name;
		if(this.isGroup) {
			return this.participants.map(p => p.username).join(', ');
		}
		else {
			const otherParticipant = this.participants.find(p => p.userId != this._user.id);
			return otherParticipant?.username ?? this._user.username;
		}
	}

	set name(name: string | null) {
		this._name = name;
	}

	get avatar(): string {
		if(this.isGroup) {
			return this._avatar;
		}
		else {
			const otherParticipant = this.participants.find(p => p.userId != this._user.id);
			return otherParticipant?.avatar ?? this._user.avatar;
		}
	}

	set avatar(avatar: string | null) {
		this._avatar = avatar;
	}

	get hasUnread(): boolean {
		if(!this.lastMessage) return false;
		return this._lastRead == null || this._lastRead != this.lastMessage?.id;
	}

	set hasUnread(status: boolean) {
		if(status == true) throw new Error('Cannot set hasUnread to true');
		this._lastRead = this.lastMessage?.id;
	}

	/**
	 * Load messages list from API
	 */
	public addMessagesList(messages: Message[]): LocalChat {
		if (!Array.isArray(this._messages)) {
			this._messages = [];
		}
		(this._messages as Message[]).push(...messages);
		this.isInitialized = true;
		return this;
	}

	/**
	 * Add singular message to the chat
	 * @returns the message id, randomly generated if message is pending
	 */
	public addMessage(msg: LocalMessage): string {
		if (msg.isPending) {
			if (!this.isInitialized) throw new Error('Cannot send fresh message to uninitialized chat');
			msg.id = `PENDING-${this.id}-${this.lastPendingIndex}`;
			this.lastPendingIndex++;
		}
		// If chat is uninitialized save only a partial message
		// since it doesn't accept a regular message list
		if (this.isInitialized) {
			const msgs = (this._messages as Message[]);
			if (msgs.find(m => m.id == msg.id)) {
				console.warn('Ignoring duplicate message', msg);
			}
			msgs.push(msg);
		}
		else {
			this._messages = {
				id: msg.id,
				author: msg.author.username,
				content: msg.content,
				timestamp: DateFns.getUnixTime(new Date()).toString()
			};
		}
		return msg.id;
	}

	/**
	 * Mark message with PENDING- id as accepted
	 */
	public ackMessage(pendingId: string, newId: string, timestamp: string): LocalMessage {
		if (!pendingId.startsWith('PENDING-')) throw new Error('Provided message id is not pending id');
		const msg = this.messages.find(m => m.id == pendingId);
		if (!msg) throw new Error(`Message with id ${pendingId} was not found`);

		msg.isPending = false;
		msg.id = newId;
		msg.timestamp = timestamp;

		return msg;
	}

	/**
	 * Mark message with PENDING- id as failed
	 */
	public ackErrorMessage(pendingId: string): LocalMessage {
		if (!pendingId.startsWith('PENDING-')) throw new Error('Provided message id is not pending id');
		const msg = this.messages.find(m => m.id == pendingId);
		if (!msg) throw new Error(`Message with id ${pendingId} was not found`);

		msg.id = msg.id.replace('PENDING', 'ERROR');
		msg.isPending = false;
		msg.isFailed = true;

		return msg;
	}

	get messages(): LocalMessage[] {
		if (!this.isInitialized) return [];
		const msgs = this._messages as LocalMessage[];
		return msgs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
	}

	get lastMessage(): LastMessage | null {
		if (!this.isInitialized) {
			if (Array.isArray(this._messages) && this._messages.length == 0) {
				return null;
			}
			return this._messages as LastMessage;
		}
		else {
			const lastMsg = this.messages[0];
			if (!lastMsg) return null;
			return {
				id: lastMsg.id,
				author: lastMsg.author.username,
				content: lastMsg.content,
				timestamp: lastMsg.timestamp
			};
		}
	}
}
