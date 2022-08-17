import { createContext } from 'react';
import { UserJWTData } from '../types/jwt';

export interface User extends UserJWTData {
    isAuthenticated: boolean,
    logout: void
}

export const defaultUser: User = {
	isAuthenticated: false,
	id: null!,
	username: null!,
	tag: null!,
	email: null!,
	logout: null!
};

export const UserContext = createContext<[User, React.Dispatch<React.SetStateAction<User>>]>(null as any);

