export interface ServerToClientEvents {
    message: (message: ServerMessage) => void;
  }

export interface ClientToServerEvents {
    message: (message: ClientMessage) => void;
}

export interface ServerMessage {
    messageId: string,
    content: string,
    chat: {
        id: string,
        name: string,
        avatar: string
    },
    author: {
        id: string,
        username: string,
        avatar: string
    },
    timestamp: string
}

export interface ClientMessage {
    chatId: string,
    content: string
}

