import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import DokChat from './components/DokChat/DokChat';
import ErrorPage from './components/ErrorPage/ErrorPage';

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
