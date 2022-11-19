import React from 'react';
import { Col, Row } from 'react-bootstrap';
import Section from '../Section/Section';

interface SectionProps {
	img: string,
	title: string,
	children: string | JSX.Element | JSX.Element[],
	variant?: boolean
}

export default function HomeSection({ img, title, children, variant }: SectionProps) {
	return (
		<Section variantBackground={variant}>
			<Row className={`align-items-center justify-content-center ${variant ? 'flex-row-reverse' : ''}`}>
				<Col sm={7} className="p-5 d-flex align-items-center justify-content-center">
					<img
						src={img}
						alt={title}
						className='w-100'
						style={{maxWidth: '450'}}
					/>
				</Col>
				<Col md={5} className="px-5 d-flex justify-content-center flex-column">
					<h2 className='fs-1 mb-4'>
						{title}
					</h2>
					<p className='lead'>
						{children}
					</p>
				</Col>
			</Row>
		</Section>
	);
}
