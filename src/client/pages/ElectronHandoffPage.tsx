import React, { useContext, useEffect, useState } from 'react';
import FullFocusPage from '../components/FullFocusPage/FullFocusPage';
import { UserContext } from '../context/UserContext';
import { Spinner } from 'react-bootstrap';
import Utils from '../helpers/utils';
import { useNavigate } from 'react-router-dom';

function ElectronHandoffPage() {
	const [ user ] = useContext(UserContext);
	const [ status, setStatus ] = useState('Checking your credentials...');
	const [ loading, setLoading ] = useState(true);
	const [ authUrl, setAuthUrl ] = useState<string>(null);

	useEffect(() => {
		if(!user.isAuthenticated) {
			setLoading(false);
			setStatus('Error: You are not logged in, please try again');
		}
		setStatus('Redirecting you to DokChat Desktop...');

		const authUrl = `${Utils.isDev() ? 'dokchat-dev' : 'dokchat'}://auth/login?token=NO_TOKEN`;
		setAuthUrl(authUrl);
	}, []);

	//if(!Utils.isElectron()) return ( <Navigate to='/login' /> );

	return (
		<FullFocusPage>
			<h2 className='fw-normal mb-4 text-center'>Login to DokChat Desktop App</h2>
			<div className='d-flex flex-column align-items-center pt-3'>
				{loading && <Spinner variant='dark' animation='border' />}
				<span className='lead pt-3'>
					{status}
				</span>
				{authUrl ? ( <>
					<a className='link-primary' href={authUrl}>Open DokChat Desktop</a>
					<div className='d-none'>
						<iframe src={authUrl}></iframe>
					</div>
				</> ): null}
			</div>
		</FullFocusPage>
	);
}

export default ElectronHandoffPage;
