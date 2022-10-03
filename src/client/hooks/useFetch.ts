// Stolen from https://github.com/benawad/react-hooks-tutorial/blob/7_useContext/src/useFetch.js

import axios, { AxiosRequestHeaders } from 'axios';
import { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '../context/UserContext';

type useFetchState<T> = { res?: T, loading: boolean};

export function useFetch<T>(url: string, useAuth = false): useFetchState<T> {
	const isCurrent = useRef(true);
	const [state, setState] = useState<useFetchState<T>>({ res: undefined, loading: true });
	const [user] = useContext(UserContext);

	useEffect(() => {
		return () => {
			isCurrent.current = false;
		};
	}, []);

	useEffect(() => {
		let headers: AxiosRequestHeaders = {};
		if(useAuth) headers = user.getAuthHeader();

		setState(state => ({ res: state.res, loading: true }));
		axios.get(url, {
			baseURL: 'api',
			headers: headers
		})
			.then(res => {
				if (isCurrent.current) {
					setState({ res: res.data, loading: false });
				}
			});
	}, [url, setState]);

	return state;
}
