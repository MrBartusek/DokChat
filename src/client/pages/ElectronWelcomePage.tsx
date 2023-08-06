import React, { useContext, useEffect, useState } from 'react';
import FullFocusPage from '../components/FullFocusPage/FullFocusPage';
import { UserContext } from '../context/UserContext';
import { Spinner } from 'react-bootstrap';
import Utils from '../helpers/utils';
import { Navigate, useNavigate } from 'react-router-dom';
import { useElectronConfig } from '../hooks/useElectronConfig';
import InteractiveButton from '../components/InteractiveButton/InteractiveButton';

function ElectronWelcomePage() {
	const [ user ] = useContext(UserContext);
	const browserUrl = Utils.getBaseUrl() + '/electron-login';
	const [ browserOpened, setBrowserOpened ] = useState(false);
	const navigate = useNavigate();
	const electronConfig = useElectronConfig();

	if(!Utils.isElectron()) return ( <Navigate to='/login' /> );

	useEffect(() => {
		if(electronConfig == null) return;
		if(user.isAuthenticated) navigate('/chat');

		if(!electronConfig.disableAutoLogin && !browserOpened) {
			openBrowser();
		}
	}, [ user, electronConfig ]);

	return (
		<FullFocusPage>
			<h2 className='fw-normal mb-4 text-center'>Welcome DokChat Desktop</h2>
			<div className='d-flex flex-column align-items-center pt-2'>
				{browserOpened ? (
					<>
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
					</>
				): (
					<>
						<span className='lead pb-3'>
							Continue using your web browser
						</span>
						<InteractiveButton onClick={openBrowser}>
							Login to DokChat Desktop
						</InteractiveButton>
					</>
				)}

			</div>
		</FullFocusPage>
	);

	function openBrowser() {
		setBrowserOpened(true);
		window.electron.openBrowser(browserUrl);
	}
}

export default ElectronWelcomePage;
