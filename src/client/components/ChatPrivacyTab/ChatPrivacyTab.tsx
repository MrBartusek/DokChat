import React, { useContext, useMemo } from 'react';
import { Stack } from 'react-bootstrap';
import { BsBoxArrowLeft, BsEyeSlashFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ChatParticipant } from '../../../types/common';
import { UserContext } from '../../context/UserContext';
import { LocalChat } from '../../types/Chat';
import BlockUserCard from '../BlockUserCard/BlockUserCard';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export interface ChatPrivacyTabProps {
	currentChat: LocalChat,
	participants?: ChatParticipant[]
}

export default function ChatPrivacyTab({ currentChat, participants }: ChatPrivacyTabProps) {
	const [user] = useContext(UserContext);
	const navigate = useNavigate();
	const otherParticipant = useMemo(() => participants.find(x => x.userId != user.id), [participants]);

	return (
		<>
			<Stack gap={3}>
				<InteractiveCard
					title="Hide this conversation"
					description='Temporarily remove this chat from chats list'
					icon={BsEyeSlashFill}
					onClick={() => navigate(`/chat/${currentChat.id}/hide`)}
				/>
				{!currentChat.isGroup && otherParticipant && (
					<BlockUserCard userId={otherParticipant.userId} />
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
