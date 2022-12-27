import React, { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { BsDoorClosed, BsInfoCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ChatParticipant } from '../../../types/common';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import IconButton from '../IconButton/IconButton';
import { UserCard } from '../UserList/UserList';

export interface ParticipantCardProps {
    currentChat: LocalChat,
	participant: ChatParticipant
}

export default function ParticipantCard({ currentChat, participant }: ParticipantCardProps) {
	const [ user ] = useContext(UserContext);
	const [ isLoading, setLoading ] = useState(false);
	const [ removed, setRemoved ] = useState(false);
	const navigate = useNavigate();

	async function handleRemove() {
		const axios = getAxios(user);

		setLoading(true);
		await axios.delete('chat/modify-participants', { data: { chat: currentChat.id, participant: participant.id }})
			.then(() => {
				toast('This user was removed from this group');
				setRemoved(true);
				setLoading(false);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data as any;
				toast.error(resp.message || 'Something went wrong');
				setLoading(false);
			});
	}

	function handleInfo() {
		navigate(`/chat/user/${participant.userId}`);
	}

	return (
		<div style={{opacity: removed ? 0.25 : 1}}>
			<UserCard user={participant} icons={(
				<span className='d-flex flex-row'>
					<IconButton icon={BsInfoCircle} size={34} disabled={isLoading || removed} onClick={handleInfo} />
					{participant.userId !== user.id && currentChat.isGroup && (
						<IconButton icon={BsDoorClosed} size={34} disabled={isLoading || removed} onClick={handleRemove} />
					)}
				</span>
			)} />
		</div>
	);
}
