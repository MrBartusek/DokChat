import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, FloatingLabel, Form } from 'react-bootstrap';
import { BsExclamationSquareFill } from 'react-icons/bs';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import { usePageInfo } from '../../hooks/usePageInfo';
import { toast } from 'react-hot-toast';

function ChangePasswordPopup() {
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ values, handleChange, resetForm ] = useForm({ oldPassword: '', newPassword: '', newPasswordConfirm: '' });
	const [ isLoading, setLoading ] = useState(false);
	const [ error, setError ] = useState<string | null>(null);
	const [ user, updateToken, setUser, callLogout ] = useContext(UserContext);
	const passwordRef = useRef<HTMLInputElement>(null!);
	const passwordConfirmRef = useRef<HTMLInputElement>(null!);
	const formRef = useRef<HTMLFormElement>(null);

	usePageInfo({
		title: 'Change password'
	});

	useLayoutEffect(() => {
		if (values.newPassword != values.newPasswordConfirm) {
			passwordConfirmRef.current.setCustomValidity('The password confirmation does not match');
		}
		else {
			passwordConfirmRef.current.setCustomValidity('');
		}

		if (values.oldPassword == values.newPassword) {
			passwordRef.current.setCustomValidity('New password cannot be identical to old one');
		}
		else {
			passwordRef.current.setCustomValidity('');
		}
	}, [ values, passwordRef, passwordConfirmRef ]);

	async function handleSubmit(event: React.MouseEvent | React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		await getAxios(user).post('/user/change-password', {
			newPassword: values.newPassword,
			oldPassword: values.oldPassword
		})
			.then(() => {
				if(user.hasPassword) {
					toast.success('Password changed');
				}
				else {
					toast.success('Password set!');
				}
				callLogout(true);
			} )
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to change your password at this time. Please try again later.');
				setLoading(false);
			});
	}

	return (
		<Popup
			title="Change Password"
			footer={(
				<>
					<InteractiveButton variant='secondary' onClick={handleClose}>
						Cancel
					</InteractiveButton>
					<InteractiveButton
						variant='primary'
						onClick={() => formRef.current.requestSubmit()}
						loading={isLoading}
					>
						Change Password
					</InteractiveButton>
				</>
			)}
			setHandleClose={setHandleClose}
			static={isLoading}
		>
			<>
				{error && <Alert variant='danger'>{error}</Alert>}
				<div className='text-muted lead mb-4 text-center'>
					{user.hasPassword
						? 'Confirm your old password and chose new one. '
						: 'Setup your new password that you can use alongside 3rd‑party Login Providers. '}
					You will need to login once again after this action.
				</div>
				<Form autoComplete='off' onSubmit={handleSubmit} ref={formRef}>
					<FloatingLabel label={'Old Password'} className="mb-2">
						<Form.Control
							type="password"
							name="oldPassword"
							className={!user.hasPassword ? 'd-none' : ''}
							value={values.oldPassword}
							onChange={handleChange}
							disabled={isLoading}
							required={user.hasPassword}
						/>
					</FloatingLabel>
					<FloatingLabel label={'New Password'} className="mb-2">
						<Form.Control
							type="password"
							name="newPassword"
							value={values.newPassword}
							onChange={handleChange}
							disabled={isLoading}
							required
							ref={passwordRef}
						/>
					</FloatingLabel>
					<FloatingLabel label={'Confirm Password'} className="mb-2">
						<Form.Control
							type="password"
							name="newPasswordConfirm"
							value={values.newPasswordConfirm}
							onChange={handleChange}
							disabled={isLoading}
							required
							ref={passwordConfirmRef}
						/>
					</FloatingLabel>

					{/* Clicking enter doesn't trigger form if not for that */}
					<Form.Control type="submit" className='d-none' />
				</Form>
			</>
		</Popup>
	);
}

export default ChangePasswordPopup;
