import React from 'react';
import { Container } from 'react-bootstrap';
import DemoForm from '../components/DemoForm/DemoForm';
import FormPage from '../components/FormPage/FormPage';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import { usePageInfo } from '../hooks/usePageInfo';

function DemoPage() {

	usePageInfo({
		title: 'Demo'
	});

	return (
		<Layout>
			<ScrollToTop />
			<Container>
				<FormPage img='img/undraw_press_play.svg'>
					<h2 className='fw-normal mb-4 text-center'>Create demo account</h2>
					<DemoForm />
				</FormPage>
			</Container>
		</Layout>
	);
}

export default DemoPage;
