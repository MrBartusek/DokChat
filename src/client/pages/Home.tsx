import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import Header from '../components/Header/Header';
import Layout from '../components/layout/Layout';
import { UserContext } from '../UserContext';

export function Home() {
	const [ user, setUser ] = useContext(UserContext);
	return (
		<Layout zeroHeightNavbar={true}>
			<Header />
			<h1>Hello {user.username}</h1>
			<Button onClick={() => setUser({
			isAuthenticated: false,
			snowflake: null!,
			username: "MrBartusek",
			tag: null!,
			email: null!,
			logout: null!
		})}>Login</Button>
		</Layout>
	);
}
