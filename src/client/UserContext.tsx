import { Snowflake } from 'nodejs-snowflake';
import { createContext, Dispatch, SetStateAction } from 'react';

export interface User {
    isAuthenticated: boolean,
    snowflake: Snowflake,
    username: string,
    tag: string,
    email: string
    logout: void
}

export const defaultUser: User = {
    isAuthenticated: false,
    snowflake: null!,
    username: null!,
    tag: null!,
    email: null!,
    logout: null!
}

export const UserContext = createContext<[User, React.Dispatch<React.SetStateAction<User>>]>(null as any);

