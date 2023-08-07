import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import { usePageInfo } from '../hooks/usePageInfo';

export function PasswordResetPage() {

	usePageInfo({
		title: 'Forgot Password'
	});

	return (
		<Layout>
			<ScrollToTop />
			<Container>
				<FormPage img='/img/undraw_forgot_password.svg'>
					<Outlet />
				</FormPage>
			</Container>
		</Layout>

	);
}

export default PasswordResetPage;
