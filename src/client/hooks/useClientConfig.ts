import { useEffect, useState } from 'react';
import { ClientConfigResponse } from '../../types/endpoints';
import getAxios from '../helpers/axios';

const axios = getAxios();

export function useClientConfig(): ClientConfigResponse {
	const [ config, setConfig ] = useState<ClientConfigResponse>({});

	useEffect(() => {
		axios.get('get-client-config')
			.then((res) => {
				const data: ClientConfigResponse = res.data.data;
				setConfig(data);
			})
			.catch(() => {
				console.error('Failed to fetch client config');
			});
	}, [ ]);

	return config;
}
