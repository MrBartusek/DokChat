import  React, {useContext, useMemo, useState} from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { User, UserContext } from './UserContext';
import { Chat } from './pages/Chat';
import { useUpdatingUser } from './hooks/useUpdatingUser';
import { Register } from './pages/Register';

function App() {
	const [user, setUser, removeUser] = useUpdatingUser();

	return (
		<UserContext.Provider value={[user, setUser, removeUser]}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/login" element={
						<PublicOnlyRoute>
							<Login />
						</PublicOnlyRoute>
					} />
					<Route path="/register" element={
						<PublicOnlyRoute>
							<Register />
						</PublicOnlyRoute>
					} />
					<Route path="/chat" element={
						<PrivateRoute>
							<Chat />
						</PrivateRoute>
					} />

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
