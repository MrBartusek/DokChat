import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { BlockStatusResponse, EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';

function UserBlockPopup() {
	const { userId } = useParams();
	const [ isLoading, setLoading ] = useState(true);
	const [ error, setError ] = useState<string | null>(null);
	const [ user ] = useContext(UserContext);
	const userFetch = useFetch<EndpointResponse<User>>(`/user/get?id=${userId}`, true);
	const navigate = useNavigate();

	const [ blocked, setBlocked ] = useState(false);

	useEffect(() => {
		setLoading(true);
		const axios = getAxios(user);
		axios.get(`user/block?id=${userId}`)
			.then((r) => {
				const resp: EndpointResponse<BlockStatusResponse> = r.data;
				setBlocked(resp.data.blocked);
				setLoading(false);
			})
			.catch(console.error);
	}, [ userId ]);

	async function handleHide() {
		const axios = getAxios(user);

		setLoading(true);
		await axios.post('user/block', {
			id: userId,
			blockStatus: !blocked
		})
			.then(() => {
				toast(`This user has been ${blocked ? 'unblocked' : 'blocked'}`);
				navigate('/chat');
			})
			.catch((error) => {
				const resp: EndpointResponse<null> = error.response?.data;
				setError(resp?.message || 'Failed to block this user at this time. Please try again later.');
				setLoading(false);
			});
	}

	function handleBack() {
		navigate(`/chat/user/${userId}`);
	}

	useEffect(() => {
		if(userFetch.error) {
			setError('Failed to fetch user data');
		}
	}, [ userFetch.error ]);

	return (
		<Popup
			title={`${blocked ? 'Unblock' : 'Block'} ${userFetch.res?.data.username || ''}`}
			footer={(
				<>
					<InteractiveButton variant='secondary' onClick={handleBack} disabled={isLoading}>
						Back
					</InteractiveButton>
					<InteractiveButton
						variant={blocked ? 'primary' : 'danger'}
						onClick={handleHide}
						loading={isLoading || userFetch.loading || userFetch.error}
					>
						{blocked ? 'Unblock' : 'Block'}
					</InteractiveButton>
				</>
			)}
			static={isLoading}
		>
			<>
				{error && <Alert variant='danger'>{error}</Alert>}
				{userFetch.loading && <SimpleLoading />}
				{!userFetch.loading && !userFetch.error && (
					<>
						<p>
							You are about to {blocked ? 'unblock' : 'block'} {' '}
							<b>{userFetch.res.data.username}#{userFetch.res.data.tag}</b>.
						</p>
						{!blocked && (
							<ul>
								<li>This user won&apos;t be able to communicate with you directly.</li>
								<li>This user won&apos;t be able to add you to groups.</li>
								<li>The current groups where you and this user are won&apos;t change. You can leave them manually.</li>
							</ul>
						)}
					</>
				)}

			</>
		</Popup>
	);
}

export default UserBlockPopup;
