import { Chat, Message, User } from './common';

/**
 * Base class for all endpoint responses
 */
export interface EndpointResponse<T> {
    error: boolean,
    status: number,
    message?: string,
    data: T;
}

/**
 * Response for user login or register
 */
export interface UserLoginResponse {
    email: string,
    token: string
}

export type ChatListResponse = Chat[]

export type MessageListResponse = Message[];

export type UserGetResponse = User;

