import React, { useContext } from 'react';
import { Col, Row, Image } from 'react-bootstrap';
import { BsPersonPlusFill, BsThreeDots } from 'react-icons/bs';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';

export interface ChatInfoProps {
	currentChat: LocalChat
}

function ChatInfo({ currentChat }: ChatInfoProps) {
	const [ chats ] = useContext(MessageManagerContext);

	return (
		<Row style={{height: 55, gap: 12}} className='p-2 border-bottom border-separator'>
			<Col xs='auto' className='pe-1'>
				<Image roundedCircle src={currentChat.avatar} className='h-100' />
			</Col>
			<Col className='d-flex justify-content-left p-0 align-items-center'>
				<span className='fw-bold'>
					{currentChat.name}
				</span>
			</Col>
			<Col xs='auto' className='d-flex align-items-center'>
				<IconButton icon={BsPersonPlusFill} variant='primary' />
				<IconButton icon={BsThreeDots} variant='primary' />
			</Col>
		</Row>
	);

}
export default ChatInfo;
