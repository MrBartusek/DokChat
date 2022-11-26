import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
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
				<Toaster toastOptions={{
					style: {
						backgroundColor: 'var(--bs-dark)',
						color: 'var(--bs-light)',
						borderRadius: 6
					}
				}}/>
				<Router />
			</ErrorBoundary>
		</React.StrictMode>
	);
}

export default App;
