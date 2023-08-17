import { createContext } from 'react';
import { LocalUser } from '../types/LocalUser';

export const UserContext = createContext<[
    LocalUser,
    (refreshAvatar?: boolean) => Promise<void>,
    React.Dispatch<string>,
    (hideToast?: boolean) => Promise<void>,
    boolean]>(null as any);
