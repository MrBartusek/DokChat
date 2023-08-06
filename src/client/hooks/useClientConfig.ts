import { useEffect, useRef, useState } from 'react';
import { ClientConfigResponse } from '../../types/endpoints';
import getAxios from '../helpers/axios';

const axios = getAxios();

export function useClientConfig(): ClientConfigResponse {
	const isCurrent = useRef(true);
	const [ config, setConfig ] = useState<ClientConfigResponse>({});

	useEffect(() => {
		return () => {
			isCurrent.current = false;
		};
	}, []);

	useEffect(() => {
		const abortController = new AbortController();

		axios.get('get-client-config', { signal: abortController.signal })
			.then((res) => {
				if(isCurrent) {
					const data: ClientConfigResponse = res.data.data;
					setConfig(data);
				}
			})
			.catch((error) => {
				if(error.name !== 'CanceledError') {
					console.error('Failed to fetch client config');
					console.error(error);
				}
			});

		return () => abortController.abort();
	}, [ ]);

	return config;
}
