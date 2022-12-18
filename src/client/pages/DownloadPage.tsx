import React from 'react';
import { BsChatSquareTextFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import DownloadHeader from '../components/DownloadHeader/DownloadHeader';
import Header from '../components/Header/Header';
import HomeSection from '../components/HomeSection/HomeSection';
import InteractiveButton from '../components/InteractiveButton/InteractiveButton';
import Layout from '../components/Layout/Layout';
import ScrollToTop from '../components/ScrollToTop/ScrollToTop';
import Section from '../components/Section/Section';

export function DownloadPage() {
	return (
		<Layout zeroHeightNavbar>
			<ScrollToTop />
			<DownloadHeader />
		</Layout>
	);
}
