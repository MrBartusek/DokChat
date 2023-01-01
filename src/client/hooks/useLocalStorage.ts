//From: https://usehooks.com/useLocalStorage/

import { useState } from 'react';

export function useLocalStorage<T = string>(key: string, initialValue: T): [ T, (value: T) => void] {
	const [ storedValue, setStoredValue ] = useState(() => {
		if (typeof window === 'undefined') {
			return initialValue;
		}
		try {
			const item = window.localStorage.getItem('dokchat_' + key);
			if(!item) {
				return initialValue;
			}
			else if(typeof initialValue == 'string') {
				return item as any as T;
			}
			else {
				return JSON.parse(item) as T;
			}
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
				let valueToStore: string = undefined;
				if(typeof value == 'string') {
					valueToStore = value;
				}
				else {
					valueToStore = JSON.stringify(value);
				}
				window.localStorage.setItem('dokchat_' + key, valueToStore);
			}
		}
		catch (error) {
			console.log(error);
		}
	};

	return [ storedValue, setValue ];
}
