import React from 'react';
import { Container } from 'react-bootstrap';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import LoginForm from '../components/LoginForm/LoginForm';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export function LoginPage() {
	return (
		<Layout>
			<ScrollToTop />
			<Container>
				<FormPage img='img/undraw_login.svg'>
					<h2 className='fw-normal mb-4 text-center'>Login to DokChat</h2>
					<LoginForm />
				</FormPage>
			</Container>
		</Layout>

	);
}
