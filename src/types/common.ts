// This file have common classes for handling data in DokChat
// They are used internally by server, to communicate via api and
// stored in frontend.

export interface ChatColor {
    name: string,
    hex: string
}

export interface Chat {
    id: string,
    name: string,
    avatar: string,
    isGroup: boolean,
    creatorId: string,
    createdAt: string,
    color: ChatColor,
    lastMessage?: LastMessage
}

export interface User {
	id: string,
	username: string,
    tag: string,
	avatar: string
}

export interface LastMessage {
	author: string,
	content: string,
    timestamp: string,
}

export interface Message {
    id: string,
    author: User,
    content?: string,
    timestamp: string,
    attachment: boolean
}

export interface ChatParticipant extends User {
	userId: string
}

