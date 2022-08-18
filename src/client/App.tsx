import  React, {useMemo, useState} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { defaultUser, UserContext } from './UserContext';

interface AppProps {}

const App = (props: AppProps) => {
	const [user, setUser] = useState(defaultUser);

	return (
		<UserContext.Provider value={[user, setUser]}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/login" element={<Login />} />
				</Routes>
			</BrowserRouter>
		</UserContext.Provider>
	);
};

export default App;
