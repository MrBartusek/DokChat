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
	const [ url, setUrl ] = useState(initialUrl);
	const [ state, setState ] = useState<useFetchState<T>>({ res: undefined, loading: true, setUrl: setUrl });
	const [ user, updateToken, setUser, callLogout, isConfirmed  ] = useContext(UserContext);
	const [ waitingForUser, setWaitingForUser ] = useState(true);

	useEffect(() => {
		return () => {
			isCurrent.current = false;
		};
	}, []);

	useEffect(() => {
		if(!useAuth) setWaitingForUser(false);
		if(user.isAuthenticated && isConfirmed) {
			setWaitingForUser(false);
		}
	}, []);

	useEffect(() => {
		const abortController = new AbortController();

		const axios = getAxios(useAuth ? user : undefined, { signal: abortController.signal });
		setState(state => ({ res: state.res, loading: true, setUrl: setUrl }));

		// Fix for fetch hooks made before user was properly loaded
		if(waitingForUser) return;

		// Don't fetch if no url provided
		{if (url == null) return setState({ loading: false, setUrl: setUrl });}

		axios.get(url)
			.then(res => {
				if (isCurrent.current) {
					setState({ res: res.data, loading: false, setUrl: setUrl });
				}
			})
			.catch((error: AxiosError) => {
				if (isCurrent.current) {
					setState({
						res: error.response?.data as T,
						loading: false,
						error: true,
						setUrl: setUrl
					});
				}
			});

		return () =>{
			abortController.abort();
		};
	}, [ url, waitingForUser ]);

	return state;
}
