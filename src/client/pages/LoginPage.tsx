import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import LoginForm from '../components/LoginForm/LoginForm';

export function LoginPage() {
	return (
		<Layout>
			<FormPage img='img/undraw_login.svg'>
				<LoginForm />
			</FormPage>
		</Layout>

	);
}
