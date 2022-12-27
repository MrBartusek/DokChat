import React, { useContext, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { ChatCreateResponse, EndpointResponse, InviteResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat } from '../../types/Chat';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';

export interface InviteConfirmProps {
    handleClose?: (() => void);
    inviteKey: string;
}

function InviteConfirm({ inviteKey, handleClose }: InviteConfirmProps) {
	const [ user ] = useContext(UserContext);
	const inviteFetch = useFetch<EndpointResponse<InviteResponse>>(`invite-info?key=${inviteKey}`, true);
	const [ isLoading, setLoading ] = useState(false);
	const [ error, setError ] = useState<string | null>(null);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const navigate = useNavigate();

	async function handleJoin() {
		const axios = getAxios(user);
		setLoading(true);
		await axios.post('chat/join', { invite: inviteKey })
			.then((r) => {
				const resp: EndpointResponse<ChatCreateResponse> = r.data;
				const chatsCopy = [ ...chats ];
				const chatExist = chatsCopy.find(c => c.id == resp.data.id);
				if(!chatExist) {
					chatsCopy.push(new LocalChat(resp.data));
					setChatList(chatsCopy);
				}
				navigate(`/chat/${resp.data.id}`);
			})
			.catch((error) => {
				const resp: EndpointResponse<null> = error.response?.data;
				setError(resp?.message || 'Something went wrong');
				setLoading(false);
			});
	}

	if(inviteFetch.loading) {
		return <SimpleLoading />;
	}
	else if(inviteFetch.error) {
		console.log(inviteFetch);
		const error = inviteFetch.res?.message ?? 'Something went wrong while fetching invite data';
		return <Alert variant='danger'>{error}</Alert>;
	}
	else {
		const invite = inviteFetch.res.data;
		return (
			<div className='d-flex flex-column justify-content-center text-center' style={{minHeight: 380}}>
				{error && <Alert variant='danger' className='mb-3'>{error}</Alert>}
				<ProfilePicture src={invite.chat.avatar} size={80} className='mb-3' />
				<span className='text-muted mb-1 small'>
					You&apos;ve been invited to join
				</span>
				<span className='fs-4'>
					{invite.chat.name}
				</span>
				<span className='text-muted'>
					{invite.chat.participants.length} participants
				</span>
				<div className='d-flex flex-column px-2 py-3 flex-fill justify-content-end'>
					<InteractiveButton variant='primary' className='mb-2' onClick={handleJoin} loading={isLoading}>
                        Join <b>{invite.chat.name}</b>
					</InteractiveButton>
					<InteractiveButton variant='link' className='link-secondary' onClick={handleClose}>
                        No Thanks
					</InteractiveButton>
				</div>
			</div>
		);
	}
}

export default InviteConfirm;
