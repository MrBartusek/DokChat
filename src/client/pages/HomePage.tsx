import React from 'react';
import { BsChatSquareTextFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import HomeSection from '../components/HomeSection/HomeSection';
import InteractiveButton from '../components/InteractiveButton/InteractiveButton';
import Layout from '../components/Layout/Layout';
import Section from '../components/Section/Section';
import { Row, Col, Badge } from 'react-bootstrap';
import DokChatLogo from '../components/DokChatLogo/DokChatLogo';
import Countdown from 'react-countdown';
import * as DateFns from 'date-fns';

export function HomePage() {
	return (
		<Layout zeroHeightNavbar={true}>
			<Header />

			<Row className='align-items-center justify-content-center bg-dark text-light'>
				<Col xs={12} className="px-5 d-flex justify-content-center flex-column text-center text-md-start p-5">
					<div className='fs-2 d-flex flex-row align-items-center justify-content-center'>
						<DokChatLogo variant='white' height={75} />
						<span>
							<Badge bg='light' className='text-dark'>
							1.0
							</Badge>
						</span>
					</div>
					<div className='text-muted text-center mt-2'>
						<div className='lead fs-3'>The full release</div>
						<div className='mt-4'>Social logins using Facebook & Google</div>
						<div className='mt-1'>GIF support via Tenor</div>
						<div className='mt-1'>Infinite chats & messages scrolling</div>
						<div className='mt-1'>Link-based group invites</div>
						<div className='mt-1'>No more account resets</div>
						<div className='mt-1'>Polished experience and QOL changes</div>
						<div className='mt-1'>+ Secret customization option</div>
					</div>

					<h2 className='text-center mt-5'>
						Coming January 1st 2023 *
					</h2>

					<Countdown
						date={DateFns.fromUnixTime(1672592400)}
						renderer={({ days, hours, minutes, seconds, completed }: any) => {
							if (!completed) {
								return (
									<h2 className='text-center mt-3 lead display-3'>
										{days.toString().padStart(2, '0')}:
										{hours.toString().padStart(2, '0')}:
										{minutes.toString().padStart(2, '0')}:
										{seconds.toString().padStart(2, '0')}
									</h2>
								);
							}
						}}
					/>

					<div className='text-muted text-center mt-3'>
						<a href="https://www.google.com/calendar/render?action=TEMPLATE&text=DokChat+1.0&location=https%3A%2F%2Fdokchat.dokurno.dev&dates=20230101T170000Z%2F20230101T180000Z">
							+ Add to Google Calendar
						</a>
					</div>

					<div className='text-muted text-center mt-3'>
						* release date may be changed, check {' '}
						<a href="https://github.com/MrBartusek/DokChat/milestone/1" className='link-secondary'>current progress</a> {' '}
						for reference
					</div>
				</Col>
			</Row>

			<div id='features'></div>
			<HomeSection
				img="/img/undraw_ask_me_anything.svg"
				title="Connect with anyone"
			>
				Share your own personalized tag with your friends or on your community profile on
				other social platforms. Communicate with other people in seconds.
			</HomeSection>

			<HomeSection
				img="/img/undraw_group_chat.svg"
				title="Group up with anyone"
				variant
			>
				With DokChat you can create private groups for your friends and family
				or, create public chats for you community. With customization and moderation
				features you can menage your community with ease.
			</HomeSection>

			<HomeSection
				img="/img/undraw_settings.svg"
				title="Fully Customizable"
			>
				You can customize the experience that you have with DokChat. Change your username, avatar or create
				groups with distinct colors and names
			</HomeSection>

			<HomeSection
				img="/img/undraw_proud_coder.svg"
				title="Open Source"
				variant
			>
				<>
					DokChat is free and Open Source. You are free to review frontend and server code right on
					our <a href="https://github.com/MrBartusek/DokChat">Github&nbsp;Repository</a>. We are open to any
					changes to the project. Pull requests, issues and feature requests are welcome.
				</>
			</HomeSection>

			<Section variantBackground>
				<div className='d-flex flex-column align-items-center py-5 mb-5'>
					<h2 className='fs-1 mb-5 text-center'>Ready to start using DokChat?</h2>
					<Link to='/register'>
						<InteractiveButton size='lg' icon={BsChatSquareTextFill}>
						Create Account
						</InteractiveButton>
					</Link>
				</div>
			</Section>
		</Layout>
	);
}
