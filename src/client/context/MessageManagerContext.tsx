import { createContext } from 'react';
import { Attachment } from '../../types/websocket';
import { LocalChat } from '../types/Chat';

export const MessageManagerContext = createContext<[
    LocalChat[],
    (chat: LocalChat, content?: string, attachment?: File) => Promise<void>,
    React.Dispatch<LocalChat[]>]>(null as any);
