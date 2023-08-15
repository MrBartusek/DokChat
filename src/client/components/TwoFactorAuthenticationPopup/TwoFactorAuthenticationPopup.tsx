import React, { useContext, useState } from 'react';
import { Col, Form, InputGroup, Row, Stack, Button, Spinner, Alert } from 'react-bootstrap';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import Popup from '../Popup/Popup';
import Utils from '../../helpers/utils';
import { usePageInfo } from '../../hooks/usePageInfo';
import { useFetch } from '../../hooks/useFetch';
import { EndpointResponse, TwoFactorCodeResponse } from '../../../types/endpoints';
import LazyImage from '../LazyImage/LazyImage';
import { useForm } from '../../hooks/useForm';
import getAxios from '../../helpers/axios';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';

function TwoFactorAuthenticationPopup() {
	const [ user, refreshUser ] = useContext(UserContext);
	const [ handleClose, setHandleClose ] = useState<() => void>(null);
	const [ error, setError ] = useState<string | null>(null);
	const codeFetch = useFetch<EndpointResponse<TwoFactorCodeResponse>>('/auth/two-factor/get-code', true);

	usePageInfo({
		title: '2FA'
	});

	return (
		<Popup
			title='Two Factor Authentication'
			footer={(
				<InteractiveButton variant='primary' onClick={handleClose}>
					Cancel
				</InteractiveButton>
			)}
			setHandleClose={setHandleClose}
		>
			{error && <Alert variant='danger'>{error}</Alert>}
			{!user.is2FAEnabled ? (
				<>
					<div className='lead text-center'>
							Add additional layer of security to your DokChat Account with these 3 easy steps
					</div>
					<Stack gap={4} className='m-3'>
						<TwoFactorStep
							image={Utils.getBaseUrl() + '/img/google-authenticator-logo.png'}
							title='Download Authenticator App'
						>
							<div className='text-muted'>
						Download and install {' '}
								<a href="https://play.google.com/store/apps/details?id=com.authy.authy">Authy</a> or {' '}
								<a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">Google&nbsp;Authenticator</a> {' '}
						for your phone or tablet.
							</div>
						</TwoFactorStep>
						<TwoFactorStep
							image={codeFetch.res?.data?.qr}
							imageAlt='QR Code'
							title='Scan the QR Code'
							fullSize
						>
							<div className='text-muted'>
						Open the authenticator app and scan the image to the left using your
						phone camera.
							</div>
						</TwoFactorStep>
						<TwoFactorStep
							image={Utils.getBaseUrl() + '/img/person-lock.svg'}
							title='Login with your code'
						>
							<div className='text-muted'>
							Enter the generated 6-digit code below
							</div>
							<TwoFactorCodeInput action='enable' setError={setError} />

						</TwoFactorStep>
					</Stack>
				</>
			): (
				<>
					<Alert variant='warning'>
					You are about to disable Two-factor authentication (2FA for short). This action
					is going to reduce your account security.
					</Alert>

					<div className='text-muted'>
						Enter the 6-digit authentication code to proceed
					</div>
					<TwoFactorCodeInput action='disable' setError={setError} />
				</>
			)}
		</Popup>
	);
}

interface TwoFactorStepProps {
	image?: string;
	title: string;
	imageAlt?: string;
	fullSize?: boolean;
	children?: React.ReactNode;
}

function TwoFactorStep({ image, title, imageAlt, fullSize, children }: TwoFactorStepProps) {
	return (
		<Row className='border border-secondary border-1 rounded-3 p-2'>
			<Col xs={4} className='d-flex align-items-center justify-content-center'>
				<LazyImage
					src={image}
					width={fullSize ? '100%' : 100}
					alt={imageAlt ?? '2FA Decoration'}
					className='m-4 rounded-1'
				/>
			</Col>
			<Col xs={8} className='p-3'>
				<span className='lead'>{title}</span>
				{children}
			</Col>
		</Row>
	);
}

interface TwoFactorCodeInputProps {
	action: 'enable' | 'disable';
	setError: React.Dispatch<React.SetStateAction<string>>;
}

function TwoFactorCodeInput({action, setError}: TwoFactorCodeInputProps) {
	const [ user, refreshUser ] = useContext(UserContext);
	const [ values, handleChange ] = useForm({ code: '' });
	const navigate = useNavigate();
	const axios = getAxios(user);
	const [ isLoading, setLoading ] = useState(false);

	return (
		<Form onSubmit={handleSubmit}>
			<InputGroup className='mt-3'>
				<Form.Control
					className='d-flex flex-fill'
					type="numeric"
					maxLength={6}
					name="code"
					value={values.code}
					onChange={handleChange}
				/>
				<InteractiveButton
					variant='primary'
					className='d-flex'
					loading={isLoading}
					type="submit"
				>
					{action == 'enable' ? 'Activate' : 'Disable'}
				</InteractiveButton>
			</InputGroup>
		</Form>
	);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		await axios.post(`/auth/two-factor/${action}`, values) // Backend request body should exactly match this hook
			.then((r: any) => {
				refreshUser().then(() => {
					navigate('/chat/profile/');
				});
			})
			.catch((e: any) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || `Failed to ${action} 2FA this time. Please try again later.`);
				setLoading(false);
			});
	}
}

export default TwoFactorAuthenticationPopup;
