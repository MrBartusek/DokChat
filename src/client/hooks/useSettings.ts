//Stolen from: https://github.com/benawad/react-hooks-tutorial/blob/master/src/useForm.js

import { useLocalStorage } from './useLocalStorage';

export enum Theme {
	AUTO = 'auto',
    DARK = 'dark',
    LIGHT = 'light'
}

export interface Settings {
	theme: Theme,
	themeRaw: Theme,
	soundNotifications: boolean
}

export const DEFAULT_SETTINGS: Settings = {
	soundNotifications: true,
	theme: Theme.AUTO,
	themeRaw: Theme.AUTO
};

export function useSettings(): [Settings, (settings: Settings) => void] {
	const [ settings, setSettings ] = useLocalStorage<Settings>('settings2', {} as Settings);

	const settingsCopy: Settings = {
		soundNotifications: settings.soundNotifications ?? DEFAULT_SETTINGS.soundNotifications,
		themeRaw: settings.themeRaw ?? DEFAULT_SETTINGS.themeRaw,
		theme: praseTheme(settings.themeRaw ?? DEFAULT_SETTINGS.themeRaw)
	};

	return [ settingsCopy, setSettings ];
}

function praseTheme(theme: Theme) {
	if(theme == Theme.AUTO) {
		const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
		return darkThemeMq.matches ? Theme.DARK : Theme.LIGHT;
	}
	return theme;
}
