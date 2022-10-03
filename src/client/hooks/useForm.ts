//Stolen from: https://github.com/benawad/react-hooks-tutorial/blob/master/src/useForm.js

import { useState } from 'react';

export function useForm<T>(initialValues: T): [T, React.Dispatch<any>, React.Dispatch<void>] {
	const [values, setValues] = useState(initialValues);

	return [
		values,
		e => {
			const isCheckbox = e.target.type == 'checkbox';
			setValues({
				...values,
				[e.target.name]: isCheckbox ? e.target.checked : e.target.value
			});
		},
		() => {
			setValues(initialValues);
		}
	];
}
