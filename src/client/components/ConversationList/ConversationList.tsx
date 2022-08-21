import React from 'react';
import { Col, Row, Stack, Image } from 'react-bootstrap';
import UserInfo from '../UserInfo/UserInfo';

function ConversationList() {
	return (
		<Row className='h-100'>
			<Stack gap={1}>
				<Conversation />
				<Conversation />
				<Conversation />
			</Stack>
		</Row>
	);
}

function Conversation() {
	return (
		<Row style={{height: 65}} className='p-2 flex-row'>
			<Col xs='auto'>
				<Image roundedCircle src={`/img/avatars/${Math.floor(Math.random() * (4 - 0 + 1) + 0)}.png`} className='h-100' />
			</Col>
			<Col xs='9' className='d-flex justify-content-center flex-column py-0 px-1'>
				<div className='fw-bold'>MrBartusek#2137</div>
				<div className='text-muted text-truncate' style={{'fontSize': '0.85em'}}>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi debitis numquam voluptate quas praesentium eaque iste eius possimus est sapiente, vero nemo rem dignissimos pariatur, recusandae culpa distinctio voluptas temporibus.
				</div>
			</Col>
		</Row>
	);
}

export default ConversationList;
