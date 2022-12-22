import React, { useContext, useEffect, useState } from 'react';
import { Alert, Stack } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { BlockStatusResponse, EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { OnlineManagerContext } from '../../context/OnlineManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import BlockUserCard from '../BlockUserCard/BlockUserCard';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import ObjectHero from '../ObjectHero/ObjectHero';
import OpenDMCard from '../OpenDMCard/OpenDMCard';
import Popup from '../Popup/Popup';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';

function UserPopup() {
	const { userId } = useParams();
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ error, setError ] = useState<string | null>(null);
	const userFetch = useFetch<EndpointResponse<User>>(`/user/get?id=${userId}`, true);
	const getOnlineStatus = useContext(OnlineManagerContext);
	const [ isOnline, setOnline ] = useState(false);
	const [ onlineStatus, setOnlineStatus ] = useState('');

	useEffect(() => {
		if(userFetch.error) {
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
							title={`${userFetch.res.data.username}#${userFetch.res.data.tag}`}
							subTitle={onlineStatus}
							isOnline={isOnline}
						/>
					</>
				)}
				<Stack gap={3}>
					<OpenDMCard userId={userId} />
					<BlockUserCard userId={userId} />
				</Stack>
			</>
		</Popup>
	);
}

export default UserPopup;
