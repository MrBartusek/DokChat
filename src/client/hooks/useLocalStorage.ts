//From: https://usehooks.com/useLocalStorage/

import { useState } from 'react';

export function useLocalStorage<T = string>(key: string, initialValue: T): [ T, (value: T) => void] {
	const [ storedValue, setStoredValue ] = useState(() => {
		if (typeof window === 'undefined') {
			return initialValue;
		}
		try {
			const item = window.localStorage.getItem('dokchat_' + key) as any;
			return item ? item as T : initialValue;
		}
		catch (error) {
			console.log(error);
			return initialValue;
		}
	});

	const setValue = (value: T) => {
		try {
			setStoredValue(value);
			if (typeof window !== 'undefined') {
				window.localStorage.setItem('dokchat_' + key, value as any);
			}
		}
		catch (error) {
			console.log(error);
		}
	};

	return [ storedValue, setValue ];
}
