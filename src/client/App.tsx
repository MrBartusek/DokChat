import  React, {useContext, useMemo, useState} from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { UserContext } from './context/UserContext';
import { ChatPage } from './pages/ChatPage';
import { useUpdatingUser } from './hooks/useUpdatingUser';
import { RegisterPage } from './pages/RegisterPage';
import Dialog from './components/Dialog/Dialog';

function App() {
	const [ isUserLoading, user, setUser, removeUser ] = useUpdatingUser();

	// Don't render anything when user is initializing
	if(isUserLoading) return <></>;

	return (
		<UserContext.Provider value={[ user, setUser, removeUser ]}>
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
						<Route path="new" element={<Dialog />} />
						<Route path="*" />
					</Route>
				</Routes>
			</BrowserRouter>
		</UserContext.Provider>
	);
}

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

export default App;
