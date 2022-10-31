import React from 'react';
import { Col, Row, Image } from 'react-bootstrap';
import { Twemoji } from 'react-emoji-render';
import { BsPersonPlusFill, BsThreeDots } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

export interface ChatInfoProps {
	currentChat?: LocalChat
}

function ChatInfo({ currentChat }: ChatInfoProps) {
	const navigate = useNavigate();

	function handleNewGroupClick() {
		navigate('/chat/new?prefill=');
	}

	return (
		<Row className='p-2 border-bottom border-separator'>
			<Col xs='auto' className='pe-2'>
				<ProfilePicture src={currentChat && currentChat.avatar} />
			</Col>
			<Col className='d-flex justify-content-left p-0 align-items-center'>
				<span className='fw-bold text-truncate' style={{maxWidth: '400px'}}>
					<Twemoji text={currentChat?.name || 'No chat selected'} />
				</span>
			</Col>
			{currentChat && (
				<Col xs='auto' className='d-flex align-items-center'>
					<IconButton icon={BsPersonPlusFill} variant='primary' onClick={handleNewGroupClick} />
					<IconButton icon={BsThreeDots} variant='primary' />
				</Col>
			)}
		</Row>
	);

}
export default ChatInfo;
