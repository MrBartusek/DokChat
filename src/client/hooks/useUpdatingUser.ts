import { googleLogout } from '@react-oauth/google';
import * as DateFns from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EndpointResponse, UserLoginResponse } from '../../types/endpoints';
import getAxios from '../helpers/axios';
import { LocalUser } from '../types/LocalUser';
import { useUser } from './useUser';
import Utils from '../helpers/utils';
import { useElectronConfig } from './useElectronConfig';
import { AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';

/**
 * This is more advanced version of useUser hook
 * that have token refreshing built-in
 */
export function useUpdatingUser(): [
	boolean,
	LocalUser,
	() => Promise<void>,
	React.Dispatch<string>,
	() => Promise<void>,
	boolean
	] {
	const [ isLoading, setLoading ] = useState(true);
	const [ user, cookies, setUser, removeUser ] = useUser();
	const [ isConfirmed, setConfirmed ] = useState(false);
	const electronConfig = useElectronConfig();

	/**
	 * Set user decoded from JWT if there is any and fetch new token
	 */
	useEffect(() => {
		const isElectron = Utils.isElectron();
		if((isElectron && !electronConfig)) return;

		const token = isElectron ? electronConfig?.token : cookies.token;

		if (token) {
			const user = LocalUser.fromJWT(token);
			if (!user.expired) {
				const method = isElectron ? 'electron-store' : 'cookie';
				console.log(`AUTH: Loaded user ${user.email} from local JWT (${method})`);
				setUser(token);
				setLoading(false);
			}
			(async () => await refreshToken(true).then(() => setLoading(false)))();
		}
		else {
			setLoading(false);
		}
	}, [ electronConfig ]);

	/**
	 * Refresh access token using refresh token periodically when
	 * user is logged in
	*/
	useEffect(() => {
		const interval = setInterval(async () => {
			if (user.isAuthenticated) {
				const expireIn = DateFns.differenceInSeconds(user.expiryDate, new Date());
				if (expireIn <= 60) await refreshToken();
			}
		}, 10 * 1000);
		return () => clearInterval(interval);
	}, [ user ]);

	async function refreshToken(refreshAvatar = false) {
		// Electron doesn't allow for any type of cookies so desktop app
		// uses special refresh token i Authorization header
		const config: AxiosRequestConfig<any> = {};
		if(Utils.isElectron()) config.headers = generateElectronRefreshHeaders();

		const axios = getAxios(null, config);
		return await axios.post('auth/refresh')
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				const user = LocalUser.fromJWT(resp.data.token);
				if (refreshAvatar) user.refreshAvatar();
				setUser(user);
				setConfirmed(true);
				console.log(`AUTH: Updated JWT to ${user.email} from server`);
			}).catch(() => {
				console.error('AUTH: Token refresh request failed.');
				// If user was never confirmed log them out
				if (!isConfirmed) {
					console.error('AUTH: Local user rejected by server! Logging out...');
					callLogout(true);
				}
				// If past tries to refresh user failed, just log out the user
				if (user.isAuthenticated && user.expireIn < 15) {
					console.error('AUTH: Log out after too many tries.');
					callLogout();
				}
			});
	}

	async function callLogout(hideToast = false) {
		try {
			const axios = getAxios(user);
			await axios.post('/auth/logout');
		}
		catch {
			console.error('Failed to post /auth/logout');
		}
		googleLogout();
		removeUser();
		if (!hideToast) toast('You have successfully been logged out');
	}

	async function setUserWrapper(newUser: string | LocalUser) {
		if (!user.isAuthenticated) {
			toast('You have successfully signed in');
		}
		setUser(newUser);
	}

	/**
	 * Generate refresh auth header for Desktop App
	 */
	function generateElectronRefreshHeaders(): RawAxiosRequestHeaders {
		return {
			'Authorization': `Bearer ${electronConfig.refreshToken}`
		};
	}

	return [ isLoading, user, (refreshAvatar?: boolean) => refreshToken(refreshAvatar), setUserWrapper, callLogout, isConfirmed ];
}
