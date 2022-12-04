//Stolen from: https://github.com/benawad/react-hooks-tutorial/blob/master/src/useForm.js

import { useLocalStorage } from './useLocalStorage';

export enum Theme {
    DARK = 'dark',
    LIGHT = 'light'
}

export interface Settings {
	theme: Theme,
	soundNotifications: boolean
}

export function useSettings(): [Settings, (settings: Settings) => void] {
	const [ settings, setSettings ] = useLocalStorage<Settings>('settings', {} as Settings);

	const settingsCopy: Settings = {
		soundNotifications: settings.soundNotifications ?? true,
		theme: settings.theme ?? Theme.LIGHT
	};

	return [ settingsCopy, setSettings ];
}
