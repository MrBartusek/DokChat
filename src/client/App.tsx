import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import DokChat from './components/DokChat/DokChat';
import ErrorPage from './components/ErrorPage/ErrorPage';
import Router from './components/Router/Router';

function App() {
	return (
		<React.StrictMode>
			<ErrorBoundary fallbackRender={({error, resetErrorBoundary}) => (
				<ErrorPage
					displayRefresh
					message='Failed to render this page at this time'
				/>
			)}>
				<DokChat />
			</ErrorBoundary>
		</React.StrictMode>
	);
}

export default App;
