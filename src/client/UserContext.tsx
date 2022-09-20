import { createContext } from 'react';
import { UserJWTData } from '../types/jwt';
import { User } from './types/User';

export const UserContext = createContext<[User, React.Dispatch<string>, React.Dispatch<void>]>(null as any);
