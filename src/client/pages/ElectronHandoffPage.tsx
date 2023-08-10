import React, { useEffect, useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { DesktopLoginResponse, EndpointResponse } from '../../types/endpoints';
import FullFocusPage from '../components/FullFocusPage/FullFocusPage';
import Utils from '../helpers/utils';
import { useFetch } from '../hooks/useFetch';

function ElectronHandoffPage() {
	const [ status, setStatus ] = useState('Loading...');
	const [ loading, setLoading ] = useState(true);
	const [ authUrl, setAuthUrl ] = useState<string>(null);
	const tokenFetch = useFetch<EndpointResponse<DesktopLoginResponse>>('/auth/desktop-login', true);

	useEffect(() => {
		if(tokenFetch.loading) {
			setStatus('Checking your credentials...');
		}
		else if(tokenFetch.error) {
			setStatus('Failed to log you in to DokChat Desktop! Please try again later');
			setLoading(false);
		}
		else {
			const protocol = Utils.isDev() ? 'dokchat-dev' : 'dokchat';
			const authUrl = `${protocol}://auth/login?refreshToken=` +
				`${tokenFetch.res.data.refreshToken}&token=${tokenFetch.res.data.token}`;
			setAuthUrl(authUrl);
			window.location.href = authUrl;
			setStatus('Redirecting you to DokChat Desktop...');
		}

	}, [ tokenFetch ]);

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
				</> ): null}
			</div>
		</FullFocusPage>
	);
}

export default ElectronHandoffPage;
