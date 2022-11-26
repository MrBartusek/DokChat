import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';

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
