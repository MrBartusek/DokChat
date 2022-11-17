import React, { useContext } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { BsChatSquareTextFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import HomeSection from '../components/HomeSection/HomeSection';
import InteractiveButton from '../components/InteractiveButton/InteractiveButton';
import Layout from '../components/Layout/Layout';
import Section from '../components/Section/Section';

export function HomePage() {
	return (
		<Layout zeroHeightNavbar={true}>
			<Header />
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
			<Section variantBackground>
				<div className='d-flex flex-column align-items-center py-5 mb-5'>
					<h2 className='fs-1 mb-5'>Ready to start using DokChat?</h2>
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
