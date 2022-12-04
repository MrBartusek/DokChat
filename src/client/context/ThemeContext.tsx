import { createContext } from 'react';
import { Theme } from '../hooks/useTheme';
import { LocalUser } from '../types/User';

export const ThemeContext = createContext<[
    Theme,
    (theme: Theme) => void]>(null as any);
