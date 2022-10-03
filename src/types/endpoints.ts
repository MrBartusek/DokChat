export interface EndpointResponse<T> {
    error: boolean,
    status: number,
    message: string,
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
    lastMessage?: {
        content: string,
        author: string
    }
}

export type ChatListResponse = Chat[]

export interface Message {
    id: string,
    author: string,
    content: string,
    avatar: string,
    timestamp: string
}

export type MessageListResponse = Message[];
