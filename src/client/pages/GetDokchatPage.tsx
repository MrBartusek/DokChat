import React, { useContext } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { BsCheck, BsDownload, BsGlobe } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import { UserContext } from '../context/UserContext';
import useBreakpoint from '../hooks/useBreakpoint';
import { usePageInfo } from '../hooks/usePageInfo';
import Section from '../components/Section/Section';

function GetDokchatPage() {
	const breakpoint = useBreakpoint();
	const [ user ] = useContext(UserContext);

	usePageInfo({
		title: 'Get DokChat'
	});

	return (
		<Layout>
			<ScrollToTop />
			<Section variantBackground>
				<h1 className='text-center pt-5 pb-2'>Start using DokChat</h1>
				<p className='lead m-auto text-center pb-4'>
					Select your desired platform
				</p>
			</Section>
			<Section>
				<Row className='pb-5'>
					<Col lg={6}>
						<div className='border border-grey-600 rounded-3 p-4 h-100'>
							<h2 className='text-center pb-4'>
								<BsGlobe className='me-3' color='var(--bs-primary)' />
								DokChat for Web
							</h2>
							<p className='text-center lead pb-3'>
								DokChat have been made with web in mind. You can just create account and
								start using DokChat straight away.
							</p>
							<p className='d-flex align-items-center'>
								<BsCheck size="1.8em" className='me-1' color='var(--bs-success)' />
								All DokChat features straight from your Web Browser
							</p>
							<p className='d-flex align-items-center'>
								<BsCheck size="1.8em" className='me-1' color='var(--bs-success)' />
								Perfect for most DokChat Users
							</p>
							<p className='d-flex align-items-center'>
								<BsCheck size="1.8em" className='me-1' color='var(--bs-success)' />
								No need to install anything
							</p>
							<div className='d-flex justify-content-center mb-4 mt-5'>
								<Link to={user.isAuthenticated ? '/chat' : '/login'}>
									<Button variant='primary' size='lg'>
										{[ 'xs', 'sm', 'md' ].includes(breakpoint) ? 'Open DokChat' : 'Open DokChat in your browser'}
									</Button>
								</Link>
							</div>
						</div>
					</Col>
					<Col lg={6}>
						<div className='border border-grey-600 rounded-3 p-4 h-100'>
							<h2 className='text-center pb-4'>
								<BsDownload className='me-3' color='var(--bs-primary)' />
								DokChat for Desktop
							</h2>
							<p className='text-center lead pb-3'>
								If you use DokChat everyday you can use our Desktop Application for better
								performance and additional features.
							</p>
							<p className='d-flex align-items-center'>
								<BsCheck size="1.8em" className='me-1' color='var(--bs-success)' />
								Access DokChat straight from your Desktop
							</p>
							<p className='d-flex align-items-center'>
								<BsCheck size="1.8em" className='me-1' color='var(--bs-success)' />
								Better performance and Desktop Notifications
							</p>
							<p className='d-flex align-items-center'>
								<BsCheck size="1.8em" className='me-1' color='var(--bs-success)' />
								Works on Windows and Mac
							</p>
							<div className='d-flex justify-content-center mb-4 mt-5'>
								<Link to='/download'>
									<Button variant='primary' size='lg'>
									Download DokChat
									</Button>
								</Link>
							</div>
						</div>
					</Col>
				</Row>
			</Section>
		</Layout>
	);
}

export default GetDokchatPage;
