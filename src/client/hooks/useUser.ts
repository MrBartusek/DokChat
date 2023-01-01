import { useState } from 'react';
import { useCookies } from 'react-cookie';
import { LocalUser } from '../types/User';

/**
 * This hook handles the User object as well as storing access token in cookie
 */
export function useUser(): [LocalUser, {token?: any }, React.Dispatch<string | LocalUser>, React.Dispatch<void>] {
	const [ user, setUser ] = useState(LocalUser.empty());
	const [ cookies, setCookie, removeCookie ] = useCookies([ 'token' ]);

	const isDevelopment = location.hostname == 'localhost';

	return [
		user,
		cookies,
		(token: string | LocalUser) => {
			const user = token instanceof LocalUser ? token : LocalUser.fromJWT(token);
			setCookie('token', user.token, { secure: !isDevelopment, sameSite: 'strict'});
			setUser(user);
		},
		() => {
			removeCookie('token');
			setUser(LocalUser.empty());
		}
	];
}
