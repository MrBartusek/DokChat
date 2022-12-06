import React, { useContext, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { BsBoxArrowLeft, BsEyeSlashFill, BsSlashCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export interface ChatPrivacyTabProps {
	currentChat: LocalChat,
	setCustomStatic: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function ChatPrivacyTab({ currentChat, setCustomStatic }: ChatPrivacyTabProps) {
	const [ user ] = useContext(UserContext);
	const [ loading, setLoading ] = useState(false);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const navigate = useNavigate();

	async function handleHide(e: React.MouseEvent) {
		const axios = getAxios(user);

		setLoading(true);
		setCustomStatic(true);
		await axios.post('chat/hide', { chat: currentChat.id })
			.then(() => {
				const chatsCopy = [ ...chats ];
				setChatList(chatsCopy.filter(c => c.id !== currentChat.id));
				navigate('/chat');
			});
	}

	return (
		<Stack gap={3}>
			<InteractiveCard
				title="Hide this conversation"
				description='Temporarily remove this chat from chats list'
				icon={BsEyeSlashFill}
				disabled={loading}
				onClick={handleHide}
			/>
			{!currentChat.isGroup && (
				<InteractiveCard
					title="Block"
					description='Block this user'
					icon={BsSlashCircle}
					disabled={loading}
				/>
			)}
			{currentChat.isGroup && (
				<InteractiveCard
					title="Leave group"
					description='Leave this group'
					icon={BsBoxArrowLeft}
					disabled={loading}
				/>
			)}
		</Stack>
	);
}
