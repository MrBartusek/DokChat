import { useEffect, useState } from 'react';
import { UserJWTData } from '../../types/jwt';
import * as jose from 'jose';
import { useCookies } from 'react-cookie';
import { User } from '../types/User';

/**
 * This hook handles the User object as well as storing access token in cookie
 */
export function useUser(): [User, React.Dispatch<string | User>, React.Dispatch<void>] {
	const [user, setUser] = useState(User.empty());
	const [cookies, setCookie, removeCookie] = useCookies(['token']);

	return [
		user,
		(token: string | User) => {
			const user = token instanceof User ? token : User.fromJWT(token);
			setCookie('token', user.token, { secure: false, sameSite: 'strict'});
			setUser(user);
		},
		() => {
			removeCookie('token');
			setUser(User.empty());
		}
	];
}
