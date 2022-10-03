import React, { useContext } from 'react';
import Header from '../components/Header/Header';
import Layout from '../components/Layout/Layout';

export function HomePage() {
	return (
		<Layout zeroHeightNavbar={true}>
			<Header />
			<h1>Home</h1>
		</Layout>
	);
}
