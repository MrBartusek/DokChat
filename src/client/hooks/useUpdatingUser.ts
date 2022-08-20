import { useEffect, useState } from 'react';
import { UserJWTData } from '../../types/jwt';
import * as jose from 'jose';
import { useCookies } from 'react-cookie';
import * as DateFns from 'date-fns';
import { User } from '../UserContext';
import axios from 'axios';
import { EndpointResponse, UserLoginResponse } from '../../types/endpoints';
import { useUser } from './useUser';

export function useUpdatingUser(): [User, React.Dispatch<string>, React.Dispatch<void>] {
	const [user, setUser, removeUser] = useUser();
	const [cookies] = useCookies(['token']);
	const [loggedIn, setLoggedIn] = useState(false);
	const [expire, setExpire] = useState(new Date());

	// Get initial user from cookies on mount
	useEffect(() => {
		if(cookies.token) {
			const data = jose.decodeJwt(cookies.token) as UserJWTData;
			const expire = DateFns.fromUnixTime(data.exp!);
			const expired = DateFns.isPast(expire);
			if(!expired) {
				console.log(`Recovered user ${data.email} from local JWT`);
				setUser(cookies.token);
			}
			setExpire(expire);
		}
		(async () => await refreshToken())();
	}, []);

	// Refresh token
	useEffect(() => {
		const interval = setInterval(async () => {
			if(loggedIn){
				const expireIn = DateFns.differenceInSeconds(expire, new Date());
				if(expireIn <= 60) await refreshToken();
			}
		}, 20 * 1000);

		return () => clearInterval(interval);
	}, [loggedIn, expire]);

	async function refreshToken() {
		await axios.post('/api/auth/refresh')
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				const data = jose.decodeJwt(resp.data.token) as UserJWTData;
				const expire = DateFns.fromUnixTime(data.exp!);
				setUser(resp.data.token);
				setLoggedIn(true);
				setExpire(expire);
				console.log(`Updated JWT to ${data.email} from server`);
			}).catch(() => {
				// Leave user logged in till jwt is valid
				if(DateFns.isPast(expire)) {
					setLoggedIn(false);
					removeUser();
				}
			});
	}

	return [user, setUser, removeUser];
}
