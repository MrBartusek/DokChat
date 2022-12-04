import { createContext } from 'react';
import { Settings } from '../hooks/useSettings';

export const SettingsContext = createContext<[
    Settings,
    (settings: Settings) => void]>({} as any);
