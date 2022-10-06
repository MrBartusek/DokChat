import { Chat, Message } from './common';

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

/**
 * Response  for chat list
 */
export type ChatListResponse = Chat[]

/**
 * Response for messages list
 */
export type MessageListResponse = Message[];

