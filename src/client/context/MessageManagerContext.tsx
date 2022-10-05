import { createContext } from 'react';
import { LocalChat } from '../types/chat';

export const MessageManagerContext = createContext<[
    boolean,
    LocalChat[],
    React.Dispatch<{chat: LocalChat, content: string}>,
    React.Dispatch<LocalChat[]>
]>(null as any);
