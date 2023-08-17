import React, { useContext } from 'react';
import { Alert, Button, Col, Container, Row } from 'react-bootstrap';
import { BsApple, BsChatSquareTextFill, BsCheck, BsDownload, BsGlobe, BsWindows } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import { UserContext } from '../context/UserContext';
import useBreakpoint from '../hooks/useBreakpoint';
import { usePageInfo } from '../hooks/usePageInfo';
import Section from '../components/Section/Section';
import { version } from '../../../package.json';
import InteractiveButton from '../components/InteractiveButton/InteractiveButton';

function DownloadPage() {
	usePageInfo({
		title: 'Get DokChat'
	});

	const downloadLink = `https://github.com/MrBartusek/DokChat/releases/download/v${version}`;

	return (
		<Layout>
			<ScrollToTop />
			<Section variantBackground>
				<h1 className='text-center pt-5 pb-2'>Download DokChat Desktop</h1>
				<p className='lead m-auto text-center pb-4'>
					Download our new Desktop Application for better performance and more features
				</p>
			</Section>
			<Section>
				<Row className='py-4 gx-5' id='select'>
					<Col lg={6}>
						<div className='border border-grey-600 rounded-3 p-4 h-100'>
							<h2 className='text-center pb-2'>
								<BsWindows className='me-3' color='var(--bs-primary)' />
								Windows
							</h2>
							<p className='text-center lead'>
								Windows 7 or newer
							</p>
							<div className='text-center text-muted my-3'>
								DokChat Windows v{version}
							</div>
							<div className='d-flex justify-content-center'>
								<a href={downloadLink + '/dokchat-desktop-windows-setup.exe'}>
									<Button variant='primary' size='lg'>
										Download
									</Button>
								</a>
							</div>
						</div>
					</Col>
					<Col lg={6}>
						<div className='border border-grey-600 rounded-3 p-4 h-100'>
							<h2 className='text-center pb-2'>
								<BsApple className='me-3' color='var(--bs-primary)' />
								MacOS
							</h2>
							<p className='text-center lead'>
								OS X 10.9 or newer
							</p>
							<div className='text-center text-muted my-3'>
								DokChat MacOS v{version}
							</div>
							<div className='d-flex justify-content-center'>
								<a href={downloadLink + `/DokChat-darwin-x64-${version}.zip`}>
									<Button variant='primary' size='lg'>
										Download
									</Button>
								</a>
							</div>
						</div>
					</Col>
				</Row>
				<div className='d-flex justify-content-center'>
					<a
						className='text-center lead pb-3 mt-2'
						href={`https://github.com/MrBartusek/DokChat/releases/tag/v${version}`}
						target='_blank' rel='noreferrer'
					>
						See other installation options
					</a>
				</div>
			</Section>
			<Section variantBackground>
				<h1 className='text-center'>Why DokChat Desktop?</h1>
				<div className='d-flex justify-content-center align-items-center my-4'>
					<img src="./img/desktop-promo.png" className='w-100' style={{maxWidth: 800}} alt="DokChat Desktop" />
				</div>
				<p className='lead m-auto text-center' style={{maxWidth: 800}}>
					DokChat Desktop is fully-fledged desktop client for DokChat. We support Windows, MacOS and
					Linux. Desktop provided you with various improvements like Desktop Notifications, Discord
					Rich Presence and Automatic Login! App has auto-updater built in so you won&apos;t miss out on
					new releases.
				</p>
			</Section>
			<Section>
				<div className='d-flex flex-column align-items-center py-5 mb-5'>
					<h2 className='fs-1 mb-5 text-center'>Ready to start using Desktop?</h2>
					<Link to='#' reloadDocument>
						<InteractiveButton size='lg' icon={BsChatSquareTextFill}>
							Download Desktop Today
						</InteractiveButton>
					</Link>
				</div>
			</Section>
		</Layout>
	);
}

export default DownloadPage;
