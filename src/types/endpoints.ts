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

export interface ChatListResponse {
    chats: {
        id: string,
        title: string,
        avatar: string,
        last_message: {
            content: string,
            author: string
        }
    }[]
}

export interface MessageListResponse {
    messages: {
        id: string,
        author: string,
        content: string,
        avatar: string,
        timestamp: string,
    }[]
}
