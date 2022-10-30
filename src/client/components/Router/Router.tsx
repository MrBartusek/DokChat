import React, { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { useUpdatingUser } from '../../hooks/useUpdatingUser';
import { AboutPage } from '../../pages/AboutPage';
import { ChatPage } from '../../pages/ChatPage';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import ErrorPage from '../ErrorPage/ErrorPage';
import NewChatPopup from '../NewChatPopup/NewChatPopup';
import SettingsPopup from '../SettingsPopup/SettingsPopup';

function Router() {
	const [ isUserLoading, user, updateToken, setUser, removeUser ] = useUpdatingUser();

	if(isUserLoading) return <></>;

	return (
		<UserContext.Provider value={[ user, updateToken, setUser, removeUser ]}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="about" element={<AboutPage />} />
					<Route path="login" element={
						<PublicOnlyRoute>
							<LoginPage />
						</PublicOnlyRoute>
					} />
					<Route path="register" element={
						<PublicOnlyRoute>
							<RegisterPage />
						</PublicOnlyRoute>
					} />
					<Route path="chat" element={
						<PrivateRoute>
							<ChatPage />
						</PrivateRoute>
					}>
						<Route path=":chatId" element={null} />
						<Route path="new" element={<NewChatPopup />} />
						<Route path="profile" element={<SettingsPopup />} />
					</Route>

					{/* 404 */}
					<Route path="*" element={<ErrorPage title="404" message="This page was not found" />} />
				</Routes>
			</BrowserRouter>
		</UserContext.Provider>
	);
}

export default Router;

interface SpecialRouteProps {
	children: JSX.Element
}

const PrivateRoute = ({ children }: SpecialRouteProps) => {
	const [ user ] = useContext(UserContext);
	return user.isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicOnlyRoute = ({ children }: SpecialRouteProps) => {
	const [ user ] = useContext(UserContext);
	return !user.isAuthenticated ? children : <Navigate to="/chat" />;
};
