import { googleLogout } from '@react-oauth/google';
import * as DateFns from 'date-fns';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { EndpointResponse, UserLoginResponse } from '../../types/endpoints';
import getAxios from '../helpers/axios';
import { LocalUser } from '../types/User';
import { useUser } from './useUser';

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

	/**
	 * Set user decoded from JWT if there is any and fetch new token
	 */
	useEffect(() => {
		if (cookies.token) {
			const user = LocalUser.fromJWT(cookies.token);
			if (!user.expired) {
				console.log(`AUTH: Loaded user ${user.email} from local JWT`);
				setUser(cookies.token);
				setLoading(false);
			}
			(async () => await refreshToken(true).then(() => setLoading(false)))();
		}
		else {
			setLoading(false);
		}
	}, []);

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
		const axios = getAxios();
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

	return [ isLoading, user, (refreshAvatar?: boolean) => refreshToken(refreshAvatar), setUserWrapper, callLogout, isConfirmed ];
}
