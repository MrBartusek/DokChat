import React from 'react';
import { Twemoji } from 'react-emoji-render';
import { BsPersonPlusFill, BsThreeDots } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';
import ProfilePicture from '../ProfilePicture/ProfilePicture';

export interface ChatInfoProps {
	currentChat?: LocalChat
}

function ChatInfo({ currentChat }: ChatInfoProps) {
	return (
		<div className='d-flex px-3 py-2 border-bottom border-separator'>
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
					{!currentChat.isGroup && (
						<Link to={'/chat/new'}>
							<IconButton icon={BsPersonPlusFill} color={currentChat.color.hex} />
						</Link>
					)}
					<Link to={`/chat/${currentChat.id}/details`}>
						<IconButton icon={BsThreeDots} color={currentChat.color.hex} />
					</Link>
				</div>
			)}
		</div>
	);

}
export default ChatInfo;
