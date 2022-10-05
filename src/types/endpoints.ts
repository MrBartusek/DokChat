export interface EndpointResponse<T> {
    error: boolean,
    status: number,
    message?: string,
    data: T;
}

export interface UserLoginResponse {
    email: string,
    token: string
}

export interface Chat {
    id: string,
    name: string,
    avatar: string,
    lastMessage?: LastMessage
}

export type ChatListResponse = Chat[]

export interface MessageAuthor {
	id: string,
	username: string,
	avatar: string
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

export type MessageListResponse = Message[];
