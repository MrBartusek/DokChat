import { useEffect, useState } from 'react';
import { UserJWTData } from '../../types/jwt';
import * as jose from 'jose';
import { useCookies } from 'react-cookie';
import * as DateFns from 'date-fns';
import { EndpointResponse, UserLoginResponse } from '../../types/endpoints';
import { useUser } from './useUser';
import { LocalUser } from '../types/User';
import getAxios from '../helpers/axios';

/**
 * This is more advanced version of useUser hook
 * that have token refreshing built-in
 */
export function useUpdatingUser(): [boolean, LocalUser, React.Dispatch<string>, React.Dispatch<void>] {
	const [ isLoading, setLoading ] = useState(true);
	const [ user, cookies, setUser, removeUser ] = useUser();
	const [ isConfirmed, setConfirmed ] = useState(false);

	/**
	 * Set user decoded from JWT if there is any and fetch new token
	 */
	useEffect(() => {
		if(cookies.token) {
			const user = LocalUser.fromJWT(cookies.token);
			if(!user.expired) {
				console.log(`AUTH: Loaded user ${user.email} from local JWT`);
				setUser(cookies.token);
			}
		}
		setLoading(false);
		(async () => await refreshToken())();
	}, []);

	/**
	 * Refresh access token using refresh token periodically when
	 * user is logged in
	*/
	useEffect(() => {
		const interval = setInterval(async () => {
			if(user.isAuthenticated){
				const expireIn = DateFns.differenceInSeconds(user.expiryDate, new Date());
				if(expireIn <= 60) await refreshToken();
			}
		}, 10 * 1000);
		return () => clearInterval(interval);
	}, [ user ]);

	async function refreshToken() {
		const axios = getAxios();
		await axios.post('auth/refresh')
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				const user = LocalUser.fromJWT(resp.data.token);
				setUser(user);
				setConfirmed(true);
				console.log(`AUTH: Updated JWT to ${user.email} from server`);
			}).catch(() => {
				console.error('AUTH: Token refresh request failed.');
				// If user was never confirmed log them out
				if(!isConfirmed) {
					console.error('AUTH: Local user rejected by server! Logging out...');
					removeUser();
				}
				// If past tries to refresh user failed, just log out the user
				if(user.isAuthenticated && user.expireIn < 15) {
					console.error('AUTH: Log out after too many tries.');
					removeUser();
				}
			});
	}

	return [ isLoading, user, setUser, removeUser ];
}
