import React from 'react';
import { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import Footer from '../Footer/Footer';
import Navbar from '../Navbar/Navbar';

interface Props {
    children?: ReactNode | ReactNode[],
	zeroHeightNavbar?: boolean
}

export default function Layout({ children, zeroHeightNavbar }: Props) {
	return (
		<>
			<Navbar zeroHeight={zeroHeightNavbar}/>
			<div style={{minHeight: 'calc(100vh - 116px)'}}>
				{children}
			</div>
			<Footer />
		</>
	);
}
