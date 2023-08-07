import React from 'react';
import { Container } from 'react-bootstrap';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import RegisterForm from '../components/RegisterForm/RegisterForm';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import { usePageInfo } from '../hooks/usePageInfo';

function RegisterPage() {

	usePageInfo({
		title: 'Register'
	});

	return (
		<Layout>
			<ScrollToTop />
			<Container>
				<FormPage img='img/undraw_chat.svg'>
					<h2 className='fw-normal mb-4 text-center'>Sing up to DokChat</h2>
					<RegisterForm />
				</FormPage>
			</Container>
		</Layout>

	);
}

export default RegisterPage;
