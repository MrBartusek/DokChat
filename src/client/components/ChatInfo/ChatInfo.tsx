import React from 'react';
import { Col, Row } from 'react-bootstrap';
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
		<div className='d-flex p-2 border-bottom border-separator'>
			<div className='d-flex pe-2'>
				<ProfilePicture src={currentChat && currentChat.avatar} />
			</div>
			<div className='d-flex flex-fill justify-content-left p-0 align-items-center'>
				<Twemoji
					className='fw-bold text-truncate'
					text={currentChat?.name || 'No chat selected'}
				/>
			</div>
			{currentChat && (
				<div className='d-flex align-items-center'>
					<IconButton icon={BsPersonPlusFill} variant='primary' onClick={handleNewGroupClick} />
					<IconButton icon={BsThreeDots} variant='primary' />
				</div>
			)}
		</div>
	);

}
export default ChatInfo;
