import { createContext } from 'react';
import { Attachment } from '../../types/websocket';
import { LocalChat } from '../types/Chat';

export const MessageManagerContext = createContext<[
    LocalChat[],
    React.Dispatch<{chat: LocalChat, content?: string, attachment?: Attachment}>,
    React.Dispatch<LocalChat[]>
]>(null as any);
