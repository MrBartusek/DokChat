import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import { LocalChat } from '../../types/Chat';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';

function UserBlockPopup() {
	const { userId } = useParams();
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ isLoading, setLoading ] = useState(false);
	const [ error, setError ] = useState<string | null>(null);
	const [ user ] = useContext(UserContext);
	const [ chats, sendMessage, setChatList ] = useContext(MessageManagerContext);
	const userFetch = useFetch<EndpointResponse<User>>(`/user/get?id=${userId}`, true);
	const navigate = useNavigate();

	async function handleHide() {
		const axios = getAxios(user);

		setLoading(true);
		await axios.post('user/block', { userId })
			.then(() => {
				toast('This user has been blocked');
				navigate('/chat');
			})
			.catch((error) => {
				const resp: EndpointResponse<null> = error.response?.data;
				setError(resp?.message || 'Failed to block this user at this time. Please try again later.');
				setLoading(false);
			});
	}

	useEffect(() => {
		if(userFetch.error) {
			setError('Failed to fetch user data');
		}
	}, [ userFetch.error ]);

	return (
		<Popup
			title={`Block ${userFetch.res?.data.username || ''}`}
			footer={(
				<>
					<InteractiveButton variant='secondary' onClick={handleClose} disabled={isLoading}>
						Cancel
					</InteractiveButton>
					<InteractiveButton variant='danger' onClick={handleHide} loading={isLoading || userFetch.loading || userFetch.error} >
						Block
					</InteractiveButton>
				</>
			)}
			setHandleClose={setHandleClose}
			static={isLoading}
		>
			<>
				{error && <Alert variant='danger'>{error}</Alert>}
				{userFetch.loading && <SimpleLoading />}
				{!userFetch.loading && !userFetch.error && (
					<p>
						You are about to block <b>{userFetch.res.data.username}#{userFetch.res.data.tag}</b>.
						<ul>
							<li>This user won&apos;t be able to communicate with you directly.</li>
							<li>This user won&apos;t be able to add you to groups.</li>
							<li>The current groups where you and this user are won&apos;t change. You can leave them manually.</li>
						</ul>
					</p>
				)}

			</>
		</Popup>
	);
}

export default UserBlockPopup;
