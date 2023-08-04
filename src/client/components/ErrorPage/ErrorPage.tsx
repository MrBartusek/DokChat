import React from 'react';
import FullPageContainer from '../FullPageContainer/FullPageContainer';
import './ErrorPage.scss';

interface ErrorPageProps {
	title?: string
	message?: string;
	displayRefresh?: boolean;
}

function ErrorPage({ title = 'Oh no!', message = 'Something went wrong', displayRefresh }: ErrorPageProps) {
	return (
		<FullPageContainer className='bg-white text-black d-flex flex-column align-items-center justify-content-center'>
			<h1 className='errorTitle' data-text={title}>
				{title}
			</h1>
			<span className='mt-2'>
				{message}
			</span>
			{displayRefresh
				? <a href="#" className='link-secondary' onClick={() => location.reload()}>Refresh</a>
				: <a href="#" className='link-secondary' onClick={() => history.back()}>Go Back</a>}

		</FullPageContainer>
	);
}

export default ErrorPage;
