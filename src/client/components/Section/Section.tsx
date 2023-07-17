import React from 'react';
import { Container } from 'react-bootstrap';
import './Section.scss';

interface SectionProps {
	variantBackground?: boolean,
	children: JSX.Element | JSX.Element[]
}

export default function Section({ variantBackground, children }: SectionProps) {
	return (
		<div className={'text-black ' + (variantBackground ? 'section-variant' : 'section')}>
			<Container className='py-5'>
				{children}
			</Container>
		</div>
	);
}
