import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import Header from '../components/Header/Header';
import Layout from '../components/Layout/Layout';
import { UserContext } from '../UserContext';
import * as jose from 'jose';

export function Home() {
	return (
		<Layout zeroHeightNavbar={true}>
			<Header />
			<h1>Home</h1>
		</Layout>
	);
}
