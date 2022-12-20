import React, { useContext, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import LogoutButton from '../LogoutButton/LogoutButton';
import MaskedText from '../MaskedText/MaskedText';
import Popup from '../Popup/Popup';

function EmailConfirmPopup() {
	const [ user ] = useContext(UserContext);
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ error, setError ] = useState<string | null>(null);
	const [ isLoading, setLoading ] = useState(false);
	const [ success, setSuccess ] = useState<boolean>(false);

	async function handleSubmit(event: React.MouseEvent<HTMLInputElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		setSuccess(false);

		await getAxios(user).post('/auth/email-confirm/start')
			.then(() => {
				setLoading(false);
				setSuccess(true);
				setError(null);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to send confirmation email at this time. Please try again later.');
				setLoading(false);
			});
	}

	return (
		<Popup
			title="Confirm your e-mail address"
			footer={(
				<>
					<LogoutButton size={null} />
					<InteractiveButton
						variant='primary'
						onClick={handleSubmit}
						loading={isLoading}
					>
						Send confirmation
					</InteractiveButton>
				</>
			)}
			setHandleClose={setHandleClose}
			static={true}
		>
			{error && <Alert variant='danger'>{error}</Alert>}
			{success && <Alert variant='success'>We&apos;ve sent account confirmation instructions to your inbox.</Alert>}
			<div className='text-center'>
				<p>
					Before using DokChat, you need to confirm your account. We&apos;ll send
					you an confirmation e-mail with one-time link that you can use to verify your
					account.
				</p>
				<p>
					Please ensure that this is a correct email address:
				</p>
				<p className='lead'>
					<MaskedText text={user.email} masked={user.emailMasked} />
				</p>
			</div>
		</Popup>
	);
}

export default EmailConfirmPopup;
