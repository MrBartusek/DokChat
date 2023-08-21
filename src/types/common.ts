// This file have common classes for handling data in DokChat
// They are used internally by server, to communicate via api and
// stored in frontend.

export interface ChatColor {
    name: string,
    hex: string
}

export interface SimpleChatParticipant {
    id: string,
    userId: string,
    avatar: string,
    username: string,
    tag: string,
    lastRead: string | null
}

export interface Chat {
    id: string,
    name: string | null,
    avatar: string | null,
    isGroup: boolean,
    creatorId: string,
    createdAt: string,
    color: ChatColor,
    lastMessage?: LastMessage
    participants: SimpleChatParticipant[]
}

export interface User {
    id: string,
    username: string,
    tag: string,
    avatar: string
}

export interface LastMessage {
    id: string,
    author: string,
    content: string,
    timestamp: string,
}

export interface MessageAttachment {
    hasAttachment: boolean,
    height?: number,
    width?: number,
    mimeType?: string
}

export interface Message {
    id: string,
    author: User,
    isSystem: boolean;
    content?: string,
    timestamp: string,
    attachment: MessageAttachment
}

export interface ChatParticipant extends User {
    userId: string
}

export interface ChatInvite {
    id: string,
    chatId: string,
    invite: string,
    createdAt: string
    expireAt: string
}

