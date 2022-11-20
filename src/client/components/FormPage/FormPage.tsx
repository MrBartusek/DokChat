import React from 'react';
import { Col, Image, Row } from 'react-bootstrap';

interface Props {
    img: string,
    children: JSX.Element | JSX.Element[],
}

function FormPage({img, children}: Props) {
	return (
		<Row className='my-5 py-5 align-items-center'>
			<Col md={6}  className='d-flex justify-content-center d-md-flex d-none' style={{'height': 500}}>
				<Image src={img} style={{'maxWidth': '100%', 'maxHeight': '100%'}}/>
			</Col>
			<Col xs={12} md={6} className='px-5'>
				{children}
			</Col>
		</Row>
	);
}

export default FormPage;
