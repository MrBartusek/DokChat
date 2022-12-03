import React from 'react';
import { Toaster } from 'react-hot-toast';
import { UserContext } from '../../context/UserContext';
import { useUpdatingUser } from '../../hooks/useUpdatingUser';
import Router from '../Router/Router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../../config';

export default function DokChat() {
	const [ isUserLoading, user, updateToken, setUser, callLogout ] = useUpdatingUser();

	if(isUserLoading) return <></>;

	return (
		<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
			<UserContext.Provider value={[ user, updateToken, setUser, callLogout ]}>
				<Toaster toastOptions={{
					style: {
						backgroundColor: 'var(--bs-dark)',
						color: 'var(--bs-light)',
						borderRadius: 6
					}
				}}/>
				<Router />
			</UserContext.Provider>
		</GoogleOAuthProvider>
	);
}
