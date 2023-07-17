import * as DateFns from 'date-fns';
import { Chat, ChatColor, LastMessage, Message, SimpleChatParticipant } from '../../types/common';

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
	private _messages: LocalMessage[] | LastMessage;
	private lastPendingIndex = 0;
	public id: string;
	public name: string;
	public avatar: string;
	public isGroup: boolean;
	public createdAt: string;
	public creatorId: string;
	public color: ChatColor;
	public participants: SimpleChatParticipant[];

	constructor(chat: Chat) {
		this.isInitialized = false;
		this.id = chat.id;
		this.name = chat.name;
		this.avatar = chat.avatar;
		this.color = chat.color;
		this.isGroup = chat.isGroup;
		this.createdAt = chat.createdAt;
		this.creatorId = chat.creatorId;
		this._messages = chat.lastMessage || [];
		this.participants = chat.participants;
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
		if (!this.isInitialized) throw new Error('Cannot read messages of uninitialized chat');
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
			const msgs = (this._messages as Message[]);
			const lastMsg = msgs[0];
			if (!lastMsg) return null;
			return {
				author: lastMsg.author.username,
				content: lastMsg.content,
				timestamp: lastMsg.timestamp
			};
		}
	}
}
