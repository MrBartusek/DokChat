import React, { useLayoutEffect, useRef } from 'react';
import { BsChatSquareTextFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import HomeSection from '../components/HomeSection/HomeSection';
import InteractiveButton from '../components/InteractiveButton/InteractiveButton';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import Section from '../components/Section/Section';
import { usePageInfo } from '../hooks/usePageInfo';

export interface HomePageProps {
	scrollToAbout?: boolean;
}

function HomePage({ scrollToAbout }: HomePageProps) {
	const aboutRef = useRef<HTMLDivElement>(null!);

	usePageInfo({
		title: 'Connect with anyone',
		discordTitle: 'Browsing home page'
	});

	useLayoutEffect(() => {
		if (!scrollToAbout) return;
		aboutRef.current.scrollIntoView({ behavior: 'smooth' });
	}, [ scrollToAbout ]);

	return (
		<Layout zeroHeightNavbar={true}>
			{!scrollToAbout && <ScrollToTop />}
			<Header />
			<div ref={aboutRef}></div>
			<HomeSection
				img="./img/dokchat_tag.svg"
				title="Connect with anyone"
			>
				Crate and Share your own personalized tag with your friends or community.
				Reach with other people in seconds.
			</HomeSection>

			<HomeSection
				img="./img/undraw_group_chat.svg"
				title="Group up with anyone"
				variant
			>
				With DokChat you can create private groups for your friends and family
				or, create public chats for you community. With customization and moderation
				features you can menage your community with ease.
			</HomeSection>

			<HomeSection
				img="./img/undraw_settings.svg"
				title="Fully Customizable"
			>
				You can customize the experience that you have with DokChat. Change your username, avatar or create
				groups with distinct colors and names
			</HomeSection>

			<HomeSection
				img="./img/undraw_proud_coder.svg"
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

export default HomePage;
