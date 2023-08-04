import React, { useContext } from 'react';
import FullFocusPage from '../components/FullFocusPage/FullFocusPage';
import LoginForm from '../components/LoginForm/LoginForm';
import { Navigate } from 'react-router-dom';
import Utils from '../helpers/utils';
import { useUser } from '../hooks/useUser';
import { UserContext } from '../context/UserContext';

function ElectronLoginPage() {
	const [ user ] = useContext(UserContext);

	if(user.isAuthenticated) return ( <Navigate to='/handoff' /> );

	return (
		<FullFocusPage>
			<h2 className='fw-normal mb-4 text-center'>Login to DokChat Desktop App</h2>
			<LoginForm redirectUrl='/handoff' />
		</FullFocusPage>
	);
}

export default ElectronLoginPage;
