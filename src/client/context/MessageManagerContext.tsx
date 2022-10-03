import { createContext } from 'react';
import { Chat } from '../types/chat';

export const MessageManagerContext = createContext<[boolean, Chat[], React.Dispatch<{chat: Chat, content: string}>]>(null as any);
