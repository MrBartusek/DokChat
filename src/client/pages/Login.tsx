import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import Layout from '../components/Layout/Layout';
import LoginForm from '../components/LoginForm/Login';

export function Login() {
	return (
		<Layout>
			<Row className='my-5 py-5'>
				<Col className='d-flex justify-content-center' style={{'height': 500}}>
					<Image src="./img/undraw_login.svg" />
				</Col>
				<Col>
					<LoginForm />
				</Col>
			</Row>
		</Layout>

	);
}
