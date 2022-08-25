import React from 'react';
import { Col, Row, Image } from 'react-bootstrap';
import { BsGear } from 'react-icons/bs';
import IconButton from '../IconButton/IconButton';

function UserInfo() {
	return (
		<Row style={{height: 55}} className='p-2 border-bottom border-separator'>
			<Col xs='auto'>
				<Image roundedCircle src={`/img/avatars/${Math.floor(Math.random() * (4 - 0 + 1) + 0)}.png`} className='h-100' />
			</Col>
			<Col className='d-flex justify-content-center align-items-center'>
				<span className='fw-bold'>
					DokChat
				</span>
			</Col>
			<Col xs='auto' className='d-flex align-items-center'>
				<IconButton icon={BsGear} />
			</Col>
		</Row>
	);

}
export default UserInfo;
