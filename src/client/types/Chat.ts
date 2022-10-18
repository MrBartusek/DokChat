import { LastMessage, Message } from '../../types/common';
import * as DateFns from 'date-fns';

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
export class LocalChat {
	/**
	 * Is this chat initialized?
	 *
	 * Initialized chats haven't been opened and fetched and thus
	 * relay on last message and don't have a message list
	 */
	public isInitialized: boolean;
	private _messages: LocalMessage[] | LastMessage;
	private lastPendingIndex = 0;

	constructor(
        public id: string,
        public name: string,
        public avatar: string,
		public isGroup: boolean,
		lastMessage?: LastMessage
	) {
		this.isInitialized = false;
		this._messages = lastMessage || [];
	}

	/**
	 * Load messages list from API
	 */
	public addMessagesList(messages: Message[]): LocalChat {
		this._messages = messages;
		this.isInitialized = true;
		return this;
	}

	/**
	 * Add singular message to the chat
	 * @returns the message id, randomly generated if message is pending
	 */
	public addMessage(msg: LocalMessage): string {
		if(msg.isPending) {
			if(!this.isInitialized) throw new Error('Cannot send fresh message to uninitialized chat');
			msg.id = `PENDING-${this.id}-${this.lastPendingIndex}`;
			this.lastPendingIndex++;
		}
		// If chat is uninitialized save only a partial message
		// since it doesn't accept a regular message list
		if(this.isInitialized) {
			(this._messages as Message[]).push(msg);
		}
		else {
			this._messages = {
				author: msg.author.username,
				content: msg.content
			};
		}
		return msg.id;
	}

	/**
	 * Mark message with PENDING- id as accepted
	 */
	public ackMessage(pendingId: string, newId: string, timestamp: string): LocalMessage {
		if(!pendingId.startsWith('PENDING-')) throw new Error('Provided message id is not pending id');
		const msg = this.messages.find(m => m.id == pendingId);
		if(!msg) throw new Error(`Message with id ${pendingId} was not found`);

		msg.isPending = false;
		msg.id = newId;
		msg.timestamp = timestamp;

		return msg;
	}

	/**
	 * Mark message with PENDING- id as failed
	 */
	public ackErrorMessage(pendingId: string): LocalMessage {
		if(!pendingId.startsWith('PENDING-')) throw new Error('Provided message id is not pending id');
		const msg = this.messages.find(m => m.id == pendingId);
		if(!msg) throw new Error(`Message with id ${pendingId} was not found`);

		msg.id = msg.id.replace('PENDING', 'ERROR');
		msg.isPending = false;
		msg.isFailed = true;

		return msg;
	}

	get messages(): LocalMessage[]{
		if(!this.isInitialized) throw new Error('Cannot read messages of uninitialized chat');
		const msgs = this._messages as LocalMessage[];
		return msgs.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
	}

	get lastMessage(): LastMessage | null {
		if(!this.isInitialized) {
			return this._messages as LastMessage;
		}
		else {
			const msgs = (this._messages as Message[]);
			const lastMsg = msgs[0];
			if(!lastMsg) return null;
			return  {
				author: lastMsg.author.username,
				content: lastMsg.content
			};
		}
	}
}
