import React, { useContext, useEffect, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { EndpointResponse } from '../../../types/endpoints';
import { OnlineManagerContext } from '../../context/OnlineManagerContext';
import { useFetch } from '../../hooks/useFetch';
import BlockUserCard from '../BlockUserCard/BlockUserCard';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import ObjectHero from '../ObjectHero/ObjectHero';
import OpenDMCard from '../OpenDMCard/OpenDMCard';
import Popup from '../Popup/Popup';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';
import { usePageInfo } from '../../hooks/usePageInfo';
import AdminActionCard, { AdminAction } from '../AdminActionCard/AdminActionCard';

function UserPopup() {
	const { userId } = useParams();
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ error, setError ] = useState<string | null>(null);
	const userFetch = useFetch<EndpointResponse<User>>(`/user/get?id=${userId}`, true);
	const getOnlineStatus = useContext(OnlineManagerContext);
	const [ isOnline, setOnline ] = useState(false);
	const [ onlineStatus, setOnlineStatus ] = useState('');

	const discriminator = userFetch.res && `${userFetch.res.data.username}#${userFetch.res.data.tag}`;

	usePageInfo({
		title: discriminator,
		discordTitle: 'Viewing user profile',
		discordDetails: discriminator
	}, [ discriminator ]);

	useEffect(() => {
		if (userFetch.error) {
			setError('Failed to fetch user data');
		}
	}, [ userFetch.error ]);

	useEffect(() => {
		const [ online, status ] = getOnlineStatus(userId);
		setOnline(online);
		setOnlineStatus(online ? 'Online' : status);
	}, [ getOnlineStatus ]);

	return (
		<Popup
			title='DokChat User'
			footer={(
				<InteractiveButton variant='primary' onClick={handleClose}>
					Close
				</InteractiveButton>
			)}
			setHandleClose={setHandleClose}
		>
			<>
				{error && <Alert variant='danger'>{error}</Alert>}
				{userFetch.loading && <SimpleLoading />}
				{!userFetch.loading && !userFetch.error && (
					<>
						<ObjectHero
							currentAvatar={userFetch.res.data.avatar}
							title={(<>
								{userFetch.res.data.username}
								<span className="text-muted">#{userFetch.res.data.tag}</span>
							</>)}
							subTitle={onlineStatus}
							isOnline={isOnline}
							copyText={`${userFetch.res.data.username}#${userFetch.res.data.tag}`}
						/>
					</>
				)}
				<Stack gap={3}>
					<OpenDMCard userId={userId} />
					<BlockUserCard userId={userId} />
					<AdminActionCard action={AdminAction.SUSPEND_ACCOUNT} targetId={userId} />
					<AdminActionCard action={AdminAction.REMOVE_SUSPENSION} targetId={userId} />
				</Stack>
			</>
		</Popup>
	);
}

export default UserPopup;
