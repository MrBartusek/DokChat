import { createContext } from 'react';
import { UserJWTData } from '../types/jwt';

export interface User extends UserJWTData {
    isAuthenticated: boolean
}

export const UserContext = createContext<[User, React.Dispatch<string>, React.Dispatch<void>]>(null as any);
