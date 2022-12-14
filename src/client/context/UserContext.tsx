import { createContext } from 'react';
import { LocalUser } from '../types/User';

export const UserContext = createContext<[
    LocalUser,
    (refreshAvatar?: boolean) => Promise<void>,
    React.Dispatch<string>,
    () => Promise<void>]>(null as any);
