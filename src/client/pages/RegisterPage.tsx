import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import RegisterForm from '../components/RegisterForm/RegisterForm';

export function RegisterPage() {
	return (
		<Layout>
			<FormPage img='img/undraw_chat.svg'>
				<RegisterForm />
			</FormPage>
		</Layout>

	);
}
