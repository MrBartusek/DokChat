import { Server, Socket } from 'socket.io';
import { Chat } from './common';
import { EndpointResponse } from './endpoints';

export type DokChatServer = Server<ClientToServerEvents, ServerToClientEvents>;
export type DokChatSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export interface ServerToClientEvents {
    message: (message: ServerMessage) => void;
  }

export interface ClientToServerEvents {
    message: (message: ClientMessage, callback: (response: EventAcknowledgement<{id: string, timestamp: string}>) => void) => void;
}

export interface ServerMessage {
    messageId: string,
    content: string,
    chat: Chat,
    author: {
        id: string,
        username: string,
        avatar: string,
        tag: string
    },
    timestamp: string
}

export interface ClientMessage {
    chatId: string,
    content: string
}

export interface EventAcknowledgement<T> extends EndpointResponse<T> { }
