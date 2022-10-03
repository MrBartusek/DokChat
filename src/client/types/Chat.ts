export interface MessageAuthor {
	id: string,
	username: string,
	avatar: string
}

export interface Message {
    author: MessageAuthor,
	content: string
}

export interface LastMessage {
	author: string,
	content: string,
}

export class Chat {
	/**
	 * Is this chat initialized?
	 *
	 * Initialized chats haven't been opened and fetched and thus
	 * relay on last message and don't have a message list
	 */
	public isInitialized: boolean;
	private _messages: Message[] | LastMessage;

	constructor(
        public id: string,
        public name: string,
        public avatar: string,
        lastMessage?: LastMessage
	) {
		this.isInitialized = false;
		this._messages = lastMessage || [];
	}

	public addMessagesList(messages: Message[]): Chat {
		this._messages = messages;
		this.isInitialized = true;
		return this;
	}

	public addMessage(msg: Message) {
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

	}

	get messages(): Message[]{
		if(this.isInitialized) throw new Error('Cannot read messages of uninitialized chat');
		return this._messages as Message[];
	}

	get lastMessage(): LastMessage {
		if(!this.isInitialized) {
			return this._messages as LastMessage;
		}
		else {
			const msgs = (this._messages as Message[]);
			const lastMsg = msgs[msgs.length - 1];
			return  {
				author: lastMsg.author.username,
				content: lastMsg.content
			};
		}
	}
}
