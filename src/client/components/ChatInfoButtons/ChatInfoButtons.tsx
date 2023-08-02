import React, { useContext } from 'react';
import { BsPersonPlus, BsPersonPlusFill, BsThreeDots } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';

export interface ChatInfoButtonsProps {
	currentChat: LocalChat
}

function ChatInfoButtons({ currentChat }: ChatInfoButtonsProps) {
	const [ user ] = useContext(UserContext);

	const otherParticipantId = currentChat.participants.find(p => p.userId != user.id).userId;

	return (
		<div className='d-flex align-items-center'>

			<Link to={
				currentChat.isGroup
					? `/chat/${currentChat.id}/details?tab=invite`
					: `/chat/new?prefill=${otherParticipantId}`}>
				<IconButton icon={BsPersonPlusFill} color={currentChat.color.hex} />
			</Link>

			<Link to={`/chat/${currentChat.id}/details`}>
				<IconButton icon={BsThreeDots} color={currentChat.color.hex} />
			</Link>

		</div>
	);

}
export default ChatInfoButtons;
