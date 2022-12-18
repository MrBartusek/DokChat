import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';

export function EmailConfirmPage() {
	return (
		<Layout>
			<ScrollToTop />
			<Container>
				<FormPage img='/img/undraw_order_confirmed.svg'>
					<Outlet />
				</FormPage>
			</Container>
		</Layout>

	);
}
