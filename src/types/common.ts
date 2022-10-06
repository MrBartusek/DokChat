// This file have common classes for handling data in DokChat
// They are used internally by server, to communicate via api and
// stored in frontend.

export interface Chat {
    id: string,
    name: string,
    avatar: string,
    lastMessage?: LastMessage
}

export interface MessageAuthor {
	id: string,
	username: string,
	avatar: string
    tag: string,
}

export interface LastMessage {
	author: string,
	content: string,
}

export interface Message {
    id: string,
    author: MessageAuthor,
    content: string,
    timestamp: string
}

export interface ChatParticipant {
    id: string,
    userId: string,
    username: string,
    tag: string,
    avatar: string
}
