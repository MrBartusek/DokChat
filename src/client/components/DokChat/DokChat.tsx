import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { SettingsContext } from '../../context/ThemeContext';
import { UserContext } from '../../context/UserContext';
import { DEFAULT_SETTINGS, useSettings } from '../../hooks/useSettings';
import { useUpdatingUser } from '../../hooks/useUpdatingUser';
import Router from '../Router/Router';
import ReactGA from 'react-ga4';
import './DokChatDark.scss';
import { useClientConfig } from '../../hooks/useClientConfig';

export default function DokChat() {
	const [isUserLoading, user, updateToken, setUser, callLogout] = useUpdatingUser();
	let [settings, setSettings] = useSettings();
	const clientConfig = useClientConfig();

	if (!user.isAuthenticated) {
		settings = DEFAULT_SETTINGS;
		setSettings = () => console.warn('Cannot set user settings, user is not authenticated');
	}

	useEffect(() => {
		ReactGA.initialize('G-DQPTM9KZYV');
	});

	if (isUserLoading) return <></>;

	return (
		<GoogleOAuthProvider clientId={clientConfig.googleClientId}>
			<SettingsContext.Provider value={[settings, setSettings]}>
				<UserContext.Provider value={[user, updateToken, setUser, callLogout]}>
					<div id='app' data-theme={settings.theme}>
						<Toaster toastOptions={{
							style: {
								backgroundColor: 'var(--bs-dark)',
								color: 'var(--bs-light)',
								borderRadius: 6
							}
						}} />
						<Router />
					</div>
				</UserContext.Provider>
			</SettingsContext.Provider>
		</GoogleOAuthProvider>
	);
}
