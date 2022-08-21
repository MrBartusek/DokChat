import React from 'react';
import { Col, Row, Image } from 'react-bootstrap';
import { BsPersonPlusFill } from 'react-icons/bs';

function ChatInfo() {
	return (
		<Row style={{height: 55}} className='p-2 border-bottom border-separator'>
			<Col xs='auto'>
				<Image roundedCircle src='/img/avatars/0.png' className='h-100' />
			</Col>
			<Col className='d-flex justify-content-left p-0 align-items-center'>
				<span className='fw-bold'>
					MrBartusek#2137
				</span>
			</Col>
			<Col xs='auto' className='d-flex align-items-center'>
				<BsPersonPlusFill size={20} color='var(--bs-primary)'/>
			</Col>
		</Row>
	);

}
export default ChatInfo;
