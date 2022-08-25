import React from 'react';
import { Col, Row, Stack, Image } from 'react-bootstrap';

function MessagesWindow() {
	return (
		<Row className='d-flex flex-grow-1'>
			<Stack className='gap-3 flex-column-reverse'>
				<Stack className='gap-1 flex-grow-0 flex-column-reverse'>
					<Message message='Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate vitae veritatis saepe ipsam laudantium a, tempore beatae incidunt? Quisquam consequuntur voluptatem enim officia commodi laudantium harum nostrum eius neque repellat.' avatar='/img/avatars/1.png' />
					<Message message='Lorem ipsum dolor' />
				</Stack>
				<Stack className='gap-1 flex-grow-0 flex-column-reverse'>
					<Message message='Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate vitae veritatis saepe ipsam laudantium a, tempore beatae incidunt? Quisquam consequuntur voluptatem enim officia commodi laudantium harum nostrum eius neque repellat.' isAuthor />
					<Message message='Lorem ipsum dolor' isAuthor />
				</Stack>
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
				style={{'padding': '8px 12px', 'maxWidth': 'min(700px, 80%)', 'borderRadius': '1.2rem'}}
				className={`${isAuthor ? 'bg-primary text-light' : 'bg-gray-200'}`}
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
