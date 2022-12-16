import React, { useContext } from 'react';
import { Stack } from 'react-bootstrap';
import { BsBoxArrowLeft, BsEyeSlashFill, BsSlashCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ChatParticipant } from '../../../types/common';
import { UserContext } from '../../context/UserContext';
import { LocalChat } from '../../types/Chat';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export interface ChatPrivacyTabProps {
	currentChat: LocalChat,
	participants?: ChatParticipant[]
}

export default function ChatPrivacyTab({ currentChat, participants }: ChatPrivacyTabProps) {
	const [ user ] = useContext(UserContext);
	const navigate = useNavigate();

	function handleBlock() {
		if(!participants) return;
		const otherParticipants = participants.find(x => x.userId != user.id);
		if(!otherParticipants) return;
		navigate(`/chat/user/${otherParticipants.userId}/block`);
	}

	return (
		<>
			<Stack gap={3}>
				<InteractiveCard
					title="Hide this conversation"
					description='Temporarily remove this chat from chats list'
					icon={BsEyeSlashFill}
					onClick={() => navigate(`/chat/${currentChat.id}/hide`)}
				/>
				{!currentChat.isGroup && (
					<InteractiveCard
						title="Block"
						description='Block this user'
						icon={BsSlashCircle}
						onClick={handleBlock}
					/>
				)}
				{currentChat.isGroup && (
					<InteractiveCard
						title="Leave group"
						description='Leave this group'
						icon={BsBoxArrowLeft}
						onClick={() => navigate(`/chat/${currentChat.id}/leave`)}
					/>
				)}
			</Stack>
		</>
	);
}
