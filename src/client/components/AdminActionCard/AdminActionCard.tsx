import { AxiosError } from 'axios';
import React, { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { BsChatSquareTextFill, BsHammer } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { ChatCreateResponse, EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { LocalChat } from '../../types/Chat';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export enum AdminAction {
    SUSPEND_ACCOUNT = 'Suspend Account',
    REMOVE_SUSPENSION = 'Remove Suspension'
}

export interface AdminActionCardProps {
	action: AdminAction;
    targetId: string;
}

export default function AdminActionCard({ action, targetId }: AdminActionCardProps) {
	const [ user ] = useContext(UserContext);
	const [ isLoading, setLoading ] = useState(false);
	const axios = getAxios(user);

	function handleClick() {
		setLoading(true);
		if (confirm(`Are you sure? ${action} -> ${targetId}`) == true) {
			setLoading(false);
			const [ url, body ] = getActionData(action, targetId);

			axios.post(`/admin/${url}`, body)
				.then(() => toast.success(`Success! ${action} -> ${targetId}`))
				.catch((e: any) => {
					const resp: EndpointResponse<null> = e.response?.data;
					toast.error(resp?.message || 'Administration action failed');
				})
				.finally(() => setLoading(false));
		}
		else {
			setLoading(false);
			toast.error('Administration action canceled');
		}
	}

	function getActionData(action: AdminAction, targetId: string): [string, object] {
		switch(action) {
			case AdminAction.SUSPEND_ACCOUNT:
				return [ 'ban', { targetId, status: true} ];
			case AdminAction.REMOVE_SUSPENSION:
				return [ 'ban', { targetId, status: false} ];
			default:
				throw new Error(`Unsupported admin action - ${action}`);
		}
	}

	if(!user.isAdmin) return <></>;

	return (
		<InteractiveCard
			title={action}
			description='Administrator option'
			icon={BsHammer}
			onClick={handleClick}
			iconColor='var(--bs-danger)'
			disabled={isLoading || user.id == targetId}
		/>
	);
}

