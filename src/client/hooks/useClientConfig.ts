import * as DateFns from 'date-fns';
import { useEffect } from 'react';
import { ClientConfigResponse } from '../../types/endpoints';
import getAxios from '../helpers/axios';
import { useLocalStorage } from './useLocalStorage';

export type ClientConfig = {
	lastCached: number;
	googleClientId?: string;
	facebookClientId?: string;
	recaptchaSiteKey?: string;
	tenorApiKey?: string;
}

const axios = getAxios();

export function useClientConfig(): ClientConfig {
	const [ config, setConfig ] = useLocalStorage('clientConfig', { lastCached: 0 } as ClientConfig);

	useEffect(() => {
		axios.get('get-client-config')
			.then((res) => {
				const data: ClientConfigResponse = res.data.data;
				setConfig({
					lastCached: DateFns.getUnixTime(new Date()),
					...data
				});
			})
			.catch(() => {
				console.error(`Failed to update client config, using config from: ${config.lastCached}`);
			});
	}, [ ]);

	return config;
}
