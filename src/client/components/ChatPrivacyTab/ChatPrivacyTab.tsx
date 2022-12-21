import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Stack } from 'react-bootstrap';
import { BsBoxArrowLeft, BsCheckCircle, BsEyeSlashFill, BsSlashCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ChatParticipant } from '../../../types/common';
import { BlockStatusResponse, EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export interface ChatPrivacyTabProps {
	currentChat: LocalChat,
	participants?: ChatParticipant[]
}

export default function ChatPrivacyTab({ currentChat, participants }: ChatPrivacyTabProps) {
	const [ user ] = useContext(UserContext);
	const navigate = useNavigate();
	const otherParticipant = useMemo(() => participants.find(x => x.userId != user.id), [ participants ]);

	const [ blocked, setBlocked ] = useState(null);
	const [ isLoading, setLoading ] = useState(!currentChat.isGroup);

	useEffect(() => {
		if(!otherParticipant) return;
		setLoading(false);
		if(currentChat.isGroup) return;
		setLoading(true);
		const axios = getAxios(user);
		axios.get(`user/block?id=${otherParticipant.userId}`)
			.then((r) => {
				const resp: EndpointResponse<BlockStatusResponse> = r.data;
				setBlocked(resp.data.blocked);
				setLoading(false);
			})
			.catch(console.error);
	}, [ otherParticipant, currentChat ]);

	function handleBlock() {
		if(!otherParticipant) return;
		navigate(`/chat/user/${otherParticipant.userId}/block`);
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
						title={blocked ? 'Unblock' : 'Block'}
						description={`${blocked ? 'Unblock' : 'Block'} this user`}
						icon={blocked ? BsCheckCircle : BsSlashCircle}
						onClick={handleBlock}
						disabled={isLoading}
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
