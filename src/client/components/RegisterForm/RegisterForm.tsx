import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';
import { Link, useNavigate } from 'react-router-dom';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import DokChatCaptcha from '../DokChatCaptcha/DokChatCaptcha';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import SocialLogin from '../SocialLogin/SocialLogin';

const axios = getAxios();

function RegisterForm() {
	const [loading, setLoading] = useState(false);
	const [values, handleChange] = useForm({ email: '', username: '', password: '', confirmPassword: '', terms: false });
	const [error, setError] = useState<string | null>(null);
	const [user, updateToken, setUser] = useContext(UserContext);
	const captchaRef = useRef<ReCAPTCHA>(null!);
	const passwordConfirmRef = useRef<HTMLInputElement>(null!);
	const navigate = useNavigate();

	useLayoutEffect(() => {
		if (values.password != values.confirmPassword) {
			passwordConfirmRef.current.setCustomValidity('The password confirmation does not match');
		}
		else {
			passwordConfirmRef.current.setCustomValidity('');
		}
	}, [values, passwordConfirmRef]);

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form onSubmit={onSubmit}>
				<Form.Group className="mb-3">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						type="email"
						name="email"
						autoComplete="username"
						id="username"
						disabled={loading}
						required
						autoFocus
						value={values.email}
						onChange={handleChange}
					/>
					<Form.Text className="text-muted">
						Use your real e-mail. It will be used to confirm your account.
					</Form.Text>
				</Form.Group>

				<Form.Group className="mb-3" controlId="formUsername">
					<Form.Label>Username</Form.Label>
					<Form.Control
						type="text"
						name="username"
						required
						disabled={loading}
						value={values.username}
						onChange={handleChange}
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						name="password"
						autoComplete="new-password"
						id="new-password"
						required
						disabled={loading}
						value={values.password}
						onChange={handleChange}
					/>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control
						type="password"
						name="confirmPassword"
						autoComplete="new-password"
						ref={passwordConfirmRef}
						required
						disabled={loading}
						value={values.confirmPassword}
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className="mb-3" controlId="formTerms">
					<Form.Check
						type="checkbox"
						name='terms'
						label={
							<span>
								I have read and agreed to {' '}
								<Link to='/privacy-policy'>DokChat Privacy Policy</Link>
							</span>

						}
						disabled={loading}
						checked={values.terms}
						onChange={handleChange}
						required
					/>
				</Form.Group>
				<div className='d-grid'>
					<InteractiveButton
						variant="primary"
						type="submit"
						className='py-2'
						loading={loading}
					>
						Create new account
					</InteractiveButton>
				</div>
				<div className='d-flex justify-content-center mt-3'>
					<Form.Text className="text-muted">
						<span>
							Already a user? {' '}
						</span>
						<Link to='/login' className='link-secondary'>
							Log in
						</Link>
					</Form.Text>
				</div>
			</Form>
			<SocialLogin setError={setError} setLoading={setLoading} loading={loading} />
			<DokChatCaptcha ref={captchaRef} />
		</>
	);

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		const recaptchaResponse = await captchaRef.current.executeAsync().catch(() => {
			setError('Failed to get ReCAPTCHA token');
		});
		if (!recaptchaResponse) return setLoading(false);
		await axios.post('auth/register',
			{
				email: values.email,
				username: values.username,
				password: values.password,
				recaptchaResponse
			})
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				setTimeout(() => {
					setUser(resp.data.token);
					navigate('/chat');
				}, 1000);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to register this account at this time. Please try again later.');
				setLoading(false);
			});

	}
}

export default RegisterForm;
