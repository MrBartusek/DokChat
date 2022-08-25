import React from 'react';
import { Col, Row, Stack, Image } from 'react-bootstrap';

function MessagesWindow() {
	return (
		<Row className='d-flex flex-grow-1'>
			<Stack style={{'flexDirection': 'column-reverse'}} className='gap-1'>
				<Message message='dokchat' avatar='/img/avatars/1.png' />
				<Message message='me when' />
				<Message message='dokchat' isAuthor />
				<Message message='me when' isAuthor />
			</Stack>
		</Row>
	);
}

interface MessageProps {
	message: string,
	avatar?: string,
	isAuthor?: boolean
}

function Message({message, avatar, isAuthor}: MessageProps) {
	return (
		<Row className={`w-100 ${isAuthor ? 'flex-row-reverse' : 'flex-row'}`}>
			<MessageAvatar avatar={avatar} leaveSpace={!isAuthor} />
			<Col
				xs='auto'
				style={{'padding': '8px 12px', 'maxWidth': '70%'}}
				className={`rounded-4 ${isAuthor ? 'bg-primary text-light' : 'bg-gray-200'}`}
			>
				{message}
			</Col>
		</Row>
	);
}

interface MessageAvatarProps {
	avatar?: string
	leaveSpace?: boolean
}

function MessageAvatar({avatar, leaveSpace}: MessageAvatarProps) {
	if(!avatar && !leaveSpace) return (<></>);
	return (
		<Col xs='auto' className='d-flex align-items-end'>
			{avatar ? (
				<Image roundedCircle src={avatar} style={{height: 32, width: 32}} />
			) : (
				<div style={{height: 32, width: 32}}></div>
			)}
		</Col>
	);
}

export default MessagesWindow;
