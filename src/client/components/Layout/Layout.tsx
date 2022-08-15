import React from 'react';
import { ReactNode } from 'react';
import { Container } from 'react-bootstrap';
import Navbar from '../Navbar/Navbar';

interface Props {
    children?: ReactNode
	zeroHeightNavbar?: boolean
}

export default function Layout({ children, zeroHeightNavbar }: Props) {
	return (
		<>
			<Navbar zeroHeight={zeroHeightNavbar}/>
			<Container>
				{children}
			</Container>
		</>
	);
}
