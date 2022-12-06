import React, { useContext, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { BsBoxArrowLeft, BsEyeSlashFill, BsSlashCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import InteractiveCard from '../InteractiveCard/InteractiveCard';
import { Alert } from 'react-bootstrap';

export interface ChatPrivacyTabProps {
	currentChat: LocalChat,
	setCustomStatic: React.Dispatch<React.SetStateAction<boolean>>,
}

export default function ChatPrivacyTab({ currentChat, setCustomStatic }: ChatPrivacyTabProps) {
	const [ user ] = useContext(UserContext);
	const [ loading, setLoading ] = useState(false);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const [ error, setError ] = useState(null);
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

	async function handleLeave(e: React.MouseEvent) {
		const axios = getAxios(user);

		setLoading(true);
		setCustomStatic(true);
		await axios.post('chat/leave', { chat: currentChat.id })
			.then(() => {
				const chatsCopy = [ ...chats ];
				setChatList(chatsCopy.filter(c => c.id !== currentChat.id));
				navigate('/chat');
			})
			.catch((error) => {
				const resp: EndpointResponse<null> = error.response?.data;
				setError(resp?.message || 'Failed to delete your account at this time. Please try again later.');
				setLoading(false);
			});
	}

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}
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
						onClick={handleLeave}
					/>
				)}
			</Stack>
		</>
	);
}
