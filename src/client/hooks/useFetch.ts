// Stolen from https://github.com/benawad/react-hooks-tutorial/blob/7_useContext/src/useFetch.js

import { AxiosError } from 'axios';
import { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from '../context/UserContext';
import getAxios from '../helpers/axios';

type useFetchState<T> = {
	res?: T,
	error?: boolean,
	loading: boolean,
	setUrl: React.Dispatch<React.SetStateAction<string>>
};

export function useFetch<T>(initialUrl: string | null, useAuth = false): useFetchState<T> {
	const isCurrent = useRef(true);
	const [ url, setUrl ]= useState(initialUrl);
	const [ state, setState ] = useState<useFetchState<T>>({ res: undefined, loading: true, setUrl: setUrl });
	const [ user ] = useContext(UserContext);

	useEffect(() => {
		return () => {
			isCurrent.current = false;
		};
	}, []);

	useEffect(() => {
		const axios = getAxios(useAuth ? user : undefined);
		setState(state => ({ res: state.res, loading: true, setUrl: setUrl }));

		// Don't fetch if no url provided
		if(url == null) return setState({ loading: false, setUrl: setUrl });

		axios.get(url)
			.then(res => {
				if (isCurrent.current) {
					setState({ res: res.data, loading: false, setUrl: setUrl });
				}
			})
			.catch((error: AxiosError) => {
				setState({
					res: error.response?.data as T,
					loading: false,
					error: true,
					setUrl: setUrl
				});
			});
	}, [ url, setState ]);

	return state;
}
