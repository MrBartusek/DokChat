import { useEffect, useState } from 'react';
import { UserJWTData } from '../../types/jwt';
import * as jose from 'jose';
import { useCookies } from 'react-cookie';
import * as DateFns from 'date-fns';

import { User } from '../UserContext';
export const emptyUser: User = {
	isAuthenticated: false,
	id: null!,
	username: null!,
	tag: null!,
	email: null!
};

export function useUser(): [User, React.Dispatch<string>, React.Dispatch<void>] {
	const [user, setUser] = useState(emptyUser);
	const [cookies, setCookie, removeCookie] = useCookies(['token']);

	function userFromJwtData(jwt: string): User {
		const data = jose.decodeJwt(jwt) as UserJWTData;
		return {
			isAuthenticated: true,
			id: data.id,
			username: data.username,
			tag: data.tag,
			email: data.email
		};
	}

	return [
		user,
		(token: string) => {
			setCookie('token', token, { secure: false, sameSite: 'strict'});
			setUser(userFromJwtData(token));
		},
		() => {
			removeCookie('token');
			setUser(emptyUser);
		}
	];
}
