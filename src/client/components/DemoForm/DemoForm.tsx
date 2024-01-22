import React, { useContext, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';
import { BsChatSquareTextFill, BsPersonFillSlash, BsStopwatchFill, BsTrashFill } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import DokChatCaptcha from '../DokChatCaptcha/DokChatCaptcha';
import ReCAPTCHA from 'react-google-recaptcha';

const axios = getAxios();

function DemoForm() {
	const [ user, updateToken, setUser ] = useContext(UserContext);
	const [ loading, setLoading ] = useState(false);
	const [ error, setError ] = useState<string | null>(null);
	const captchaRef = useRef<ReCAPTCHA>(null!);
	const navigate = useNavigate();

	return (
		<div
			className='d-flex flex-column align-items-center justify-content-center gap-3'
		>
			{error && <Alert variant='danger'>{error}</Alert>}
			<p className='text-center lead'>
                If you want to test the DokChat service without creating an
                account we can create a demo account for you!
			</p>

			<div>
				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsStopwatchFill color={'var(--bs-primary'} className='me-3' />
					<span className='text-muted'>
                        This will take only a couple of seconds
					</span>
				</p>

				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsChatSquareTextFill color={'var(--bs-primary'} className='me-3' />
					<span className='text-muted'>
						You can test DokChat with our messaging bot
					</span>
				</p>

				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsPersonFillSlash color={'var(--bs-primary'} className='me-3' />
					<span className='text-muted'>
                        You won&apos;t have access to all the features
					</span>
				</p>

				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsTrashFill color={'var(--bs-primary'} className='me-3' />
					<span className='text-muted'>
						This is a one-time account that will be deleted in 24 hours
					</span>
				</p>
			</div>

			<div className='d-grid w-100 mt-4'>
				<InteractiveButton
					variant="primary"
					onClick={useDemoAccount}
					className='py-2'
					loading={loading}
				>
					Create demo account
				</InteractiveButton>
			</div>

			<DokChatCaptcha ref={captchaRef} />
		</div>
	);

	async function useDemoAccount(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);

		// Allow for empty response, if server don't send site keys
		// It means reCAPTCHA is disabled
		const reCaptchaResponse = captchaRef.current ? await captchaRef.current.executeAsync() : null;

		await axios.post('/auth/demo', { reCaptchaResponse })
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				setTimeout(() => {
					setUser(resp.data.token);
					navigate('/chat');
				}, 1000);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to create a demo account at this time. Please try again later.');
				setLoading(false);
			});
	}
}

export default DemoForm;
