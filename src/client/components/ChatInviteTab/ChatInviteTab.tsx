import copyToClipboard from 'copy-to-clipboard';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Button, Form, InputGroup, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { User } from '../../../types/common';
import { EndpointResponse, InviteResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat } from '../../types/Chat';
import UserTagInput from '../UserTagInput/UserTagInput';

export interface ChatInviteTabProps {
	currentChat: LocalChat,
}

export default function ChatInviteTab({ currentChat }: ChatInviteTabProps) {
	const [ user ] = useContext(UserContext);
	const [ inviteLink, setInviteLink ] = useState(null);
	const inviteInputRef = useRef<HTMLInputElement>(null);
	const inviteFetch = useFetch<EndpointResponse<InviteResponse>>(`chat/invite?chat=${currentChat.id}`, true);
	const [ isLoading, setLoading ] = useState(false);

	useEffect(() => {
		if(inviteFetch.loading || inviteFetch.error) return;
		setInviteLink(inviteFetch.res.data.invite);
	}, [ inviteFetch ]);

	function handleCopy() {
		if(!inviteLink) return;
		copyToClipboard(inviteLink);
		inviteInputRef.current.select();
	}

	async function handleAdd(addedUser: User) {
		if(isLoading) return;
		const axios = getAxios(user);
		await axios.put('chat/modify-participants', { chat: currentChat.id, user: addedUser.id })
			.then(() => {
				toast('This user was added this group');
				setLoading(false);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data as any;
				toast.error(resp.message || 'Something went wrong');
				setLoading(false);
			});
	}

	return (
		<>
			<div className='mb-4'>Invite friends to {currentChat.name}</div>
			<Stack gap={4}>
				<div>
					<div className='text-muted mb-2'>Invite using DokChat user tag</div>
					<UserTagInput onAdd={handleAdd} />
				</div>
				<div>
					<div className='text-muted mb-2'>Or send a chat invite link to a friend</div>
					<InputGroup>
						<Form.Control
							className='d-flex flex-fill'
							type="text"
							name="link"
							value={inviteLink ?? 'Loading...'}
							ref={inviteInputRef}
							readOnly
						/>
						<Button variant='secondary' onClick={handleCopy} className='d-flex'>
							Copy Invite
						</Button>
					</InputGroup>
					<div className='text-muted small mb-2'>Your invite link will expire in 7 days</div>
				</div>
			</Stack>
		</>
	);
}
