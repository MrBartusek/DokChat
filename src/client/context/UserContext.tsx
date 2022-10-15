import { createContext } from 'react';
import { LocalUser } from '../types/User';

export const UserContext = createContext<[LocalUser, React.Dispatch<string>, React.Dispatch<void>]>(null as any);
