import React from 'react';
import { Container } from 'react-bootstrap';
import Layout from '../components/Layout/Layout';
import { useUser } from '../hooks/useUser';

export function Chat() {
	const [user] = useUser();

	return (
		<Layout>
			<h2>Hello {user.username}#{user.tag}</h2>
		</Layout>

	);
}
