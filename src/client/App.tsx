import * as React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { About } from './pages/About';
import { Login } from './pages/Login';
import { Home } from './pages/Home';

interface AppProps {}

const App = (props: AppProps) => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="about" element={<About />} />
				<Route path="login" element={<Login />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
