import React, { ChangeEvent, FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Button, FloatingLabel, Form, FormControlProps } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { BsPencil } from 'react-icons/bs';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import CopyButton from '../CopyButton/CopyButton';
import IconButton from '../IconButton/IconButton';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import LogoutButton from '../LogoutButton/LogoutButton';
import Popup from '../Popup/Popup';
import ProfilePicture from '../ProfilePicture/ProfilePicture';
import { Link } from 'react-router-dom';
import MaskedText from '../MaskedText/MaskedText';

function EmailConfirmPopup() {
	const [ user, updateToken ] = useContext(UserContext);
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ error, setError ] = useState<string | null>(null);
	const [ isLoading, setLoading ] = useState(false);
	const [ success, setSuccess ] = useState<boolean>(false);

	async function handleSubmit(event: React.MouseEvent<HTMLInputElement>) {
		event.preventDefault();
		setLoading(true);

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
			title="Confirm e-mail address"
			footer={(
				<>
					<Button variant='secondary' onClick={handleClose}>
						Close
					</Button>
					{!success && (
						<InteractiveButton
							variant='primary'
							onClick={handleSubmit}
							loading={isLoading}
						>
							Send confirmation e-mail
						</InteractiveButton>
					)}
				</>
			)}
			setHandleClose={setHandleClose}
		>
			{error && <Alert variant='danger'>{error}</Alert>}
			{!success ? (
				<div className='text-center'>
					<p>
						You are about to request confirmation for this DokChat account {' '}
						<span className='text-muted'>({user.discriminator})</span>. {' '}
						We&apos;ll send you an confirmation e-mail with one-time link that you can use to verify your account.
					</p>
					<p>
						Please ensure that this is a correct email address:
					</p>
					<p className='lead'>
						<MaskedText text={user.email} masked={user.emailMasked} />
					</p>
				</div>
			): (
				<div className='text-center'>
					<p>
						We&apos;ve sent account confirmation instructions to:
					</p>
					<p className='lead'>
						<MaskedText text={user.email} masked={user.emailMasked} />
					</p>
					<p>
						If you haven&apos;t received this email in few minutes, please check your spam folder.
					</p>
				</div>
			)}

		</Popup>
	);
}

export default EmailConfirmPopup;
