//Stolen from: https://github.com/benawad/react-hooks-tutorial/blob/master/src/useForm.js

import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import Utils from '../helpers/utils';

export enum Theme {
	AUTO = 'auto',
	DARK = 'dark',
	LIGHT = 'light'
}

export interface Settings {
	theme: Omit<Theme, Theme.AUTO>,
	themeRaw: Theme,
	soundNotifications: boolean,
	openOnStartup: boolean,
	startMinimized: boolean,
	minimizeToTray: boolean
}

export const DEFAULT_SETTINGS: Settings = {
	soundNotifications: true,
	theme: Theme.LIGHT,
	themeRaw: Theme.AUTO,
	openOnStartup: true,
	startMinimized: false,
	minimizeToTray: true
};

export function useSettings(): [Settings, (settings: Settings) => void] {
	const [ settings, setSettings ] = useLocalStorage<Settings>('settings_V3', {} as Settings);

	const settingsCopy: Settings = {
		soundNotifications: settings.soundNotifications ?? DEFAULT_SETTINGS.soundNotifications,
		themeRaw: settings.themeRaw ?? DEFAULT_SETTINGS.themeRaw,
		theme: praseTheme(settings.themeRaw ?? DEFAULT_SETTINGS.themeRaw),
		openOnStartup: settings.openOnStartup ?? DEFAULT_SETTINGS.openOnStartup,
		startMinimized: settings.startMinimized ?? DEFAULT_SETTINGS.startMinimized,
		minimizeToTray: settings.minimizeToTray ?? DEFAULT_SETTINGS.minimizeToTray
	};

	useEffect(() => {
		if(Utils.isElectron()) {
			window.electron.updateSettings(settingsCopy);
		}
	}, [ settings ]);

	return [ settingsCopy, setSettings ];
}

function praseTheme(theme: Theme) {
	if (theme == Theme.AUTO) {
		const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
		return darkThemeMq.matches ? Theme.DARK : Theme.LIGHT;
	}
	return theme;
}
