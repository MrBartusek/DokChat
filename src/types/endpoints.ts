import { Chat, ChatInvite, ChatParticipant, Message, User } from './common';

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

export interface DesktopLoginResponse {
    email: string,
    token: string,
    refreshToken: string
}

export type ChatListResponse = Chat[]

export type MessageListResponse = Message[];

export type UserGetResponse = User;

export type ChatCreateResponse = Chat;

export type ChatParticipantsRepose = ChatParticipant[];

export interface BlockStatusResponse {
    id: string,
    blocked: boolean
}

export type InviteResponse = {
    invite: ChatInvite;
    chat: Chat;
}

export type ClientConfigResponse = {
    googleClientId?: string;
    facebookClientId?: string;
    recaptchaSiteKey?: string;
    tenorApiKey?: string;
    gaMeasurementId?: string;
}

export type TwoFactorCodeResponse = {
    qr: string;
    uri: string;
}
