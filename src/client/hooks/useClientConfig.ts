import { useEffect } from 'react';
import { ClientConfigResponse, EndpointResponse } from '../../types/endpoints';
import { useFetch } from './useFetch';
import { useLocalStorage } from './useLocalStorage';
import * as DateFns from 'date-fns';
import getAxios from '../helpers/axios';

export type ClientConfig = {
	lastCached: number;
	googleClientId?: string;
	facebookClientId?: string;
	recaptchaSiteKey?: string;
	tenorApiKey?: string;
}

const axios = getAxios();

export function useClientConfig(): ClientConfig {
	const [config, setConfig] = useLocalStorage('clientConfig', { lastCached: 0 } as ClientConfig);

	useEffect(() => {
		const lastCached = DateFns.fromUnixTime(config.lastCached);
		const shouldRevalidate = DateFns.differenceInHours(new Date(), lastCached) > 12;
		if (shouldRevalidate) {
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
		}
	});

	return config;
}
