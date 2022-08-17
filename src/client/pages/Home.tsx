import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import Header from '../components/Header/Header';
import Layout from '../components/Layout/Layout';
import { UserContext } from '../UserContext';
import * as jose from 'jose';

export function Home() {
	const [ user, setUser ] = useContext(UserContext);

	async function handleLogin(e: any) {
		try {
			const res = await fetch('/api/user/login');
			const data = await res.json();
			const userData = jose.decodeJwt(data.token) as any;
			setUser({
				isAuthenticated: false,
				id: null!,
				username: userData.username,
				tag: null!,
				email: null!,
				logout: null!
			});
			console.log('g');
		}
		catch (error) {
			console.log(error);
		}
	}

	return (
		<Layout zeroHeightNavbar={true}>
			<Header />
			<h1>Hello {user.username}</h1>
			<Button onClick={handleLogin}>Login</Button>
		</Layout>
	);
}
