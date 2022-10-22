import  React from 'react';
import Router from './components/Router/Router';
import { ErrorBoundary } from 'react-error-boundary';
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
				<Router />
			</ErrorBoundary>
		</React.StrictMode>
	);
}

export default App;
