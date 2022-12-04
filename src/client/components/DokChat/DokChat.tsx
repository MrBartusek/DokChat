import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { GOOGLE_CLIENT_ID } from '../../config';
import { SettingsContext } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import { useSettings } from '../../hooks/useSettings';
import { useUpdatingUser } from '../../hooks/useUpdatingUser';
import Router from '../Router/Router';
import './DokChat.scss';

export default function DokChat() {
	const [ isUserLoading, user, updateToken, setUser, callLogout ] = useUpdatingUser();
	const [ settings, setSettings ] = useSettings();

	if(isUserLoading) return <></>;

	return (
		<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
			<SettingsContext.Provider value={[ settings, setSettings ]}>
				<UserContext.Provider value={[ user, updateToken, setUser, callLogout ]}>
					<div id='app' data-theme={settings.theme}>
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
			</SettingsContext.Provider>
		</GoogleOAuthProvider>
	);
}
