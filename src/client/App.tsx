import  React, {useContext, useMemo, useState} from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { User, UserContext } from './UserContext';
import { useUser } from './hooks/useUser';
import { Chat } from './pages/Chat';

function App() {
	const [user, setUser, removeUser] = useUser();

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
