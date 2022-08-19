import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import InteractiveButton from '../components/InteractiveButton/InteractiveButton';
import Layout from '../components/Layout/Layout';
import { useUser } from '../hooks/useUser';

export function Chat() {
	const [user] = useUser();
	const [loading, setLoading] = useState(false);

	return (
		<Layout>
			<h2>Hello {user.username}#{user.tag}</h2>

			<InteractiveButton onClick={handleClick} loading={loading}>
				Log out
			</InteractiveButton>
		</Layout>

	);

	function handleClick(e: any) {
		setLoading(true);
		setTimeout(() => {
			window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
		}, 2000);
	}
}
