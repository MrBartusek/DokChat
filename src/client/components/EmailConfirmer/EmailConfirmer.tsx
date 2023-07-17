import React, { useContext, useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';

export default function EmailConfirmer() {
	const [ user, updateToken ] = useContext(UserContext);
	const { token } = useParams();
	const [ loading, setLoading ] = useState(true);
	const [ error, setError ] = useState<string | null>(null);

	useEffect(() => {
		const axios = getAxios();
		axios.post('/auth/email-confirm/confirm', { token: token })
			.then(() => {
				setLoading(false);
				if (user.isAuthenticated) updateToken();
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data as any;
				setError(resp?.message || 'Failed to confirm this account at this time. Please try again later.');
				setLoading(false);
			});
	}, [ token ]);

	return (
		<>
			<h2>Confirm e-mail address</h2>
			{loading && <SimpleLoading />}
			{error && <Alert variant='danger'>{error}</Alert>}
			{!loading && !error && (
				<>
					<p className='my-4'>
						You have successfully confirmed your DokChat account.
					</p>
					<Link to={user.isAuthenticated ? '/chat' : '/login'} className='text-decoration-none'>
						<div className='d-grid'>
							<Button variant='primary'>
								{user.isAuthenticated ? 'Open DokChat' : 'Log in'}
							</Button>
						</div>
					</Link>
				</>
			)}
		</>
	);
}
