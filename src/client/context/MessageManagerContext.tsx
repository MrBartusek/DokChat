import { createContext } from 'react';
import { LocalChat } from '../types/Chat';

export const MessageManagerContext = createContext<[
    LocalChat[],
    (chat: LocalChat, content?: string, attachment?: File) => Promise<void>,
    React.Dispatch<LocalChat[]>,
    (count?: number) => void,
    boolean,
    (chat: LocalChat) => void]>(null as any);
