import React from 'react';
import { Col, Row, Image } from 'react-bootstrap';
import { BsPersonPlusFill, BsThreeDots } from 'react-icons/bs';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

export interface ChatInfoProps {
	currentChat: LocalChat
}

function ChatInfo({ currentChat }: ChatInfoProps) {
	return (
		<Row className='p-2 border-bottom border-separator'>
			<Col xs='auto' className='pe-2'>
				<ProfilePicture src={currentChat.avatar} />
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
