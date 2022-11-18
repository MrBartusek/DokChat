import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import EmailConfirmer from '../components/EmailConfirmer/EmailConfirmer';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import PasswordResetForm from '../components/PasswordResetForm/PasswordResetForm';

export function EmailConfirmPage() {
	return (
		<Layout>
			<Container>
				<FormPage img='/img/undraw_order_confirmed.svg'>
					<Outlet />
				</FormPage>
			</Container>
		</Layout>

	);
}
