import React from 'react';
import { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import Navbar from './Navbar';

interface Props {
    children?: ReactNode
	zeroWidthNavbar?: boolean
}

export default function Layout({ children, zeroWidthNavbar }: Props) {
	return (
		<>
			<Navbar zeroWidth={zeroWidthNavbar}/>
			<Container>
				{children}
			</Container>
		</>
	);
}
