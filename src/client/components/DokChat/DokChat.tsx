import React from 'react';
import { Toaster } from 'react-hot-toast';
import { UserContext } from '../../context/UserContext';
import { useUpdatingUser } from '../../hooks/useUpdatingUser';
import Router from '../Router/Router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GOOGLE_CLIENT_ID } from '../../config';
import { ThemeContext } from '../../context/ThemeContext';
import { useTheme } from '../../hooks/useTheme';
import './DokChat.scss';

export default function DokChat() {
	const [ isUserLoading, user, updateToken, setUser, callLogout ] = useUpdatingUser();
	const [ theme, setTheme ] = useTheme();

	if(isUserLoading) return <></>;

	return (
		<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
			<ThemeContext.Provider value={[ theme, setTheme ]}>
				<UserContext.Provider value={[ user, updateToken, setUser, callLogout ]}>
					<div id='app' data-theme={theme}>
						<Toaster toastOptions={{
							style: {
								backgroundColor: 'var(--bs-dark)',
								color: 'var(--bs-light)',
								borderRadius: 6
							}
						}}/>
						<Router />
					</div>
				</UserContext.Provider>
			</ThemeContext.Provider>
		</GoogleOAuthProvider>
	);
}
