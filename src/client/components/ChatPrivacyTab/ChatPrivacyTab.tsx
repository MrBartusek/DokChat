import React from 'react';
import { Stack } from 'react-bootstrap';
import { BsBoxArrowLeft, BsEyeSlashFill, BsSlashCircle } from 'react-icons/bs';
import { LocalChat } from '../../types/Chat';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export interface ChatPrivacyTabProps {
	currentChat: LocalChat
}

export default function ChatPrivacyTab({ currentChat }: ChatPrivacyTabProps) {
	return (
		<Stack gap={3}>
			<InteractiveCard
				title="Hide this conversation"
				description='Temporarily remove this chat from chats list'
				icon={BsEyeSlashFill}
			/>
			{!currentChat.isGroup && (
				<InteractiveCard
					title="Block"
					description='Block this user'
					icon={BsSlashCircle}
				/>
			)}
			{currentChat.isGroup && (
				<InteractiveCard
					title="Leave group"
					description='Leave this group'
					icon={BsBoxArrowLeft}
				/>
			)}
		</Stack>
	);
}
