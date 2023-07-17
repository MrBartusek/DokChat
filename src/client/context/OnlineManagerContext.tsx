import { createContext } from 'react';

export const OnlineManagerContext = createContext<((userId: string) => [boolean, string | null])>(null as any);
