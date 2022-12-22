import { AxiosError } from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { BsChatSquareFill, BsCheckCircle, BsSlashCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { BlockStatusResponse, ChatCreateResponse, EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export interface OpenDMCardProps {
    userId: string;
}

export default function OpenDMCard({ userId }: OpenDMCardProps) {
	const [ user ] = useContext(UserContext);
	const [ isLoading, setLoading ] = useState(false);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const navigate = useNavigate();

	async function handleOpenDm() {
		setLoading(true);
		const axios = getAxios(user);
		await axios.post('/chat/create', {
			participants: [ userId ]
		}, {
			validateStatus: (s) => [ 200, 409 ].includes(s)
		})
			.then((r) => {
				const resp: EndpointResponse<ChatCreateResponse> = r.data;
				const chatsCopy = [ ...chats ];
				const chatExist = chatsCopy.find(c => c.id == resp.data.id);
				if(!chatExist) {
					chatsCopy.push(new LocalChat(resp.data));
					setChatList(chatsCopy);
				}
				navigate(`/chat/${resp.data.id}`);
			}).catch((e: AxiosError) => {
				const resp: EndpointResponse<ChatCreateResponse> = e.response?.data as any;
				toast.error(resp.message || 'Something went wrong');
				setLoading(false);
			});
	}

	return (
		<InteractiveCard
			title='Open chat'
			description='Open private conversation with this user'
			icon={BsChatSquareFill}
			onClick={handleOpenDm}
			disabled={isLoading}
		/>
	);
}

