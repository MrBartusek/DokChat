//Stolen from: https://github.com/benawad/react-hooks-tutorial/blob/master/src/useForm.js

import { useLocalStorage } from '../hooks/useLocalStorage';

export enum Theme {
    DARK = 'dark',
    LIGHT = 'light',
    AUTO = 'auto'
}

export function useTheme(): [Theme, (theme: Theme) => void] {
	const [ theme, storeTheme ] = useLocalStorage('theme', Theme.LIGHT);

	function setTheme(theme: Theme): void {
		storeTheme(theme);
	}

	// Fallback for invalid theme
	if(![ Theme.DARK, Theme.LIGHT, Theme.AUTO ].includes(theme)) {
		return [ Theme.LIGHT, setTheme ];
	}

	return [ theme, setTheme ];
}
