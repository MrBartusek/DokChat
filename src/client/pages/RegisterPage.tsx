import React from 'react';
import { Container } from 'react-bootstrap';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import RegisterForm from '../components/RegisterForm/RegisterForm';

export function RegisterPage() {
	return (
		<Layout>
			<Container>
				<FormPage img='img/undraw_chat.svg'>
					<h2 className='fw-normal mb-5 text-center'>Sing up to DokChat</h2>
					<RegisterForm />
				</FormPage>
			</Container>
		</Layout>

	);
}
