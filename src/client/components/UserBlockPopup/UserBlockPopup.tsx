import React, { useContext, useEffect, useState } from 'react';
import { Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { User } from '../../../types/common';
import { EndpointResponse } from '../../../types/endpoints';
import { MessageManagerContext } from '../../context/MessageManagerContext';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useFetch } from '../../hooks/useFetch';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';

function UserBlockPopup() {
	const { userId } = useParams();
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ isLoading, setLoading ] = useState(false);
	const [ error, setError ] = useState<string | null>(null);
	const [ user ] = useContext(UserContext);
	const userFetch = useFetch<EndpointResponse<User>>(`/user/get?id=${userId}`, true);
	const [ searchParams  ] = useSearchParams({});
	const navigate = useNavigate();

	const blockStatus = searchParams.get('status') == 'true';

	async function handleHide() {
		const axios = getAxios(user);

		setLoading(true);
		await axios.post('user/block', {
			id: userId,
			blockStatus
		})
			.then(() => {
				toast(`This user has been ${blockStatus ? 'blocked' : 'unblocked'}`);
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
			title={`${blockStatus ? 'Block' : 'Unblock'} ${userFetch.res?.data.username || ''}`}
			footer={(
				<>
					<InteractiveButton variant='secondary' onClick={handleClose} disabled={isLoading}>
						Cancel
					</InteractiveButton>
					<InteractiveButton
						variant={blockStatus ? 'danger' : 'primary'}
						onClick={handleHide}
						loading={isLoading || userFetch.loading || userFetch.error}
					>
						{blockStatus ? 'Block' : 'Unblock'}
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
					<>
						<p>
							You are about to {blockStatus ? 'block' : 'unblock'} {' '}
							<b>{userFetch.res.data.username}#{userFetch.res.data.tag}</b>.
						</p>
						{blockStatus && (
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
