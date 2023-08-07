import React, { useContext, useEffect, useState } from 'react';
import { Alert, FloatingLabel, Form } from 'react-bootstrap';
import { BsExclamationSquareFill } from 'react-icons/bs';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import { usePageInfo } from '../../hooks/usePageInfo';

function DeleteAccountPopup() {
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ values, handleChange, resetForm ] = useForm({ password: '' });
	const [ isChanged, setChanged ] = useState(false);
	const [ isLoading, setLoading ] = useState(false);
	const [ error, setError ] = useState<string | null>(null);
	const [ user, updateToken, setUser, callLogout ] = useContext(UserContext);

	usePageInfo({
		title: 'Delete Account'
	});

	/**
	 * Handle isUnsaved hook
	 */
	useEffect(() => {
		const changed = values.password != '';
		setChanged(changed);
	}, [ values ]);

	async function handleSubmit(event: React.MouseEvent<HTMLInputElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		await getAxios(user).delete('/user/delete', { data: values })
			.then(() => callLogout())
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to delete your account at this time. Please try again later.');
				setLoading(false);
			});
	}

	return (
		<Popup
			title="Account Removal Confirmation"
			footer={(
				<>
					<InteractiveButton variant='secondary' onClick={handleClose}>
						Cancel
					</InteractiveButton>
					<InteractiveButton
						variant='danger'
						onClick={handleSubmit}
						disabled={!isChanged}
						loading={isLoading}
					>
						Delete Account
					</InteractiveButton>
				</>
			)}
			setHandleClose={setHandleClose}
			static={isLoading}
		>
			<>
				<p className='fw-bold text-danger fs-5 d-flex flex-column align-items-center gap-2 px-3'>
					<BsExclamationSquareFill className='fs-3' />
					<span className='text-center'>
						You&apos;re about to delete your DokChat account ({user.discriminator})
					</span>
				</p>
				{error && <Alert variant='danger'>{error}</Alert>}
				<p>
					All of your account information will be permanently deleted. You will lose
					any messages, attachments or groups that you have created. This action is not reversible.
				</p>
				<p>
					For security reasons please confirm your password:
				</p>
				<Form autoComplete='off' onSubmit={(e) => e.preventDefault()}>
					<FloatingLabel label={'Confirm your password'}>
						<Form.Control
							type="password"
							name="password"
							value={values.password}
							onChange={handleChange}
							required
						/>
					</FloatingLabel>
				</Form>
			</>
		</Popup>
	);
}

export default DeleteAccountPopup;
