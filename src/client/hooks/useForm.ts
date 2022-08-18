//Stolen from: https://github.com/benawad/react-hooks-tutorial/blob/master/src/useForm.js

import { useState } from 'react';

export function useForm<T>(initialValues: T): [T, React.Dispatch<any>] {
	const [values, setValues] = useState(initialValues);

	return [
		values,
		e => {
			setValues({
				...values,
				[e.target.name]: e.target.value
			});
		}
	];
}
