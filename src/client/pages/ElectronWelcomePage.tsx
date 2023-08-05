import React, { useContext, useEffect, useState } from 'react';
import FullFocusPage from '../components/FullFocusPage/FullFocusPage';
import { UserContext } from '../context/UserContext';
import { Spinner } from 'react-bootstrap';
import Utils from '../helpers/utils';
import { Navigate, useNavigate } from 'react-router-dom';

function ElectronWelcomePage() {
	const [ user ] = useContext(UserContext);
	const browserUrl = Utils.getBaseUrl() + '/electron-login';
	const [ browserOpened, setBrowserOpened ] = useState(false);

	if(!Utils.isElectron()) return ( <Navigate to='/login' /> );

	useEffect(() => {
		if(!browserOpened) openBrowser();
		setBrowserOpened(true);
	}, []);

	return (
		<FullFocusPage>
			<h2 className='fw-normal mb-4 text-center'>Welcome DokChat Desktop</h2>
			<div className='d-flex flex-column align-items-center pt-3'>
				<span className='lead'>
					Please login using a web browser
				</span>
				<a
					className='link-primary'
					onClick={openBrowser}
					href="#"
				>
					Browser didn&apos;t open? Click here!
				</a>
			</div>
		</FullFocusPage>
	);

	function openBrowser() {
		window.electronAPI.openBrowser(browserUrl);
	}
}

export default ElectronWelcomePage;
