import React, { useContext, useEffect, useState } from 'react';
import { BsCheckCircle, BsSlashCircle } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { BlockStatusResponse, EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import InteractiveCard from '../InteractiveCard/InteractiveCard';

export interface BlockUserCardProps {
	userId: string;
}

export default function BlockUserCard({ userId }: BlockUserCardProps) {
	const [ user ] = useContext(UserContext);
	const [ blocked, setBlocked ] = useState(null);
	const [ isLoading, setLoading ] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		setLoading(true);
		if (user.id == userId) return;
		const axios = getAxios(user);
		axios.get(`user/block?id=${userId}`)
			.then((r) => {
				const resp: EndpointResponse<BlockStatusResponse> = r.data;
				setBlocked(resp.data.blocked);
				setLoading(false);
			})
			.catch(console.error);
	}, [ userId ]);

	function handleBlock() {
		navigate(`/chat/user/${userId}/block`);
	}

	return (
		<InteractiveCard
			title={blocked ? 'Unblock' : 'Block'}
			description={`${blocked ? 'Unblock' : 'Block'} this user`}
			icon={blocked ? BsCheckCircle : BsSlashCircle}
			onClick={handleBlock}
			disabled={isLoading}
		/>
	);
}
