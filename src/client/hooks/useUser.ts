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

	useEffect(() => {
		if(!cookies.token) return;
		const data = jose.decodeJwt(cookies.token) as UserJWTData;
		const expired = DateFns.isPast(DateFns.fromUnixTime(data.exp!));
		if(expired) return;
		setUser(userFromJwtData(data));
	}, []);

	return [
		user,
		(token: string) => {
			if(token) {
				const data = jose.decodeJwt(token) as UserJWTData;
				setCookie('token', token, {
					secure: false,
					sameSite: 'strict'
				});
				setUser(userFromJwtData(data));
			}
		},
		() => {
			removeCookie('token');
			setUser(emptyUser);
		}
	];
}

function userFromJwtData(data: UserJWTData): User {
	return {
		isAuthenticated: true,
		id: data.id,
		username: data.username,
		tag: data.tag,
		email: data.email
	};
}
