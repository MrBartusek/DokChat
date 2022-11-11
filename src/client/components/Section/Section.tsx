import React from 'react';
import { Container } from 'react-bootstrap';

interface SectionProps {
    variantBackground?: boolean,
    children: JSX.Element | JSX.Element[]
}

export default function Section({ variantBackground, children }: SectionProps) {
	return (
		<div className={variantBackground ? 'bg-light' : ''}>
			<Container className='py-5'>
				{children}
			</Container>
		</div>
	);
}
