import React, { useContext, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import SocialLogin from '../SocialLogin/SocialLogin';
import TwoFactorLoginPopup from '../TwoFactorLoginPopup/TwoFactorLoginPopup';

const axios = getAxios();

export interface LoginFormProps {
	redirectUrl?: string;
}

function LoginForm(props: LoginFormProps) {
	const [ user, updateToken, setUser ] = useContext(UserContext);
	const [ loading, setLoading ] = useState(false);
	const [ values, handleChange ] = useForm({ email: '', password: '', rememberMe: false });
	const [ error, setError ] = useState<string | null>(null);
	const [ showTwoFactorPopup, setShowTwoFactorPopup ] = useState(false);
	const [ twoFactorCode, setTwoFactorCode ] = useState<string>(undefined);
	const navigate = useNavigate();
	const [ searchParams ] = useSearchParams({ redirectUrl: '/chat' });

	const redirectUrl = props.redirectUrl ?? searchParams.get('redirectUrl');

	return (
		<>
			{error && !showTwoFactorPopup && <Alert variant='danger'>{error}</Alert>}
			{showTwoFactorPopup && <TwoFactorLoginPopup
				setCode={setTwoFactorCode}
				isLoading={loading}
				handleSubmit={onSubmit}
				error={error}
			/> }
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
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						name="password"
						autoComplete="current-password"
						id="current-password"
						required
						disabled={loading}
						value={values.password}
						onChange={handleChange}
					/>
					<Form.Text className="text-muted">
						<Link to='/forgot-password' className='link-secondary text-decoration-none'>
							Forgot password?
						</Link>
					</Form.Text>
				</Form.Group>
				<Form.Group className="mb-3" controlId="formRememberMe">
					<Form.Check
						type="checkbox"
						label="Remember me"
						name='rememberMe'
						disabled={loading}
						checked={values.rememberMe}
						onChange={handleChange}
					/>
				</Form.Group>
				<div className='d-grid'>
					<InteractiveButton
						variant="primary"
						type="submit"
						className='py-2'
						loading={loading}
					>
						Log in
					</InteractiveButton>
				</div>
				<div className='d-flex justify-content-center mt-3'>
					<Form.Text className="text-muted">
						<span>
							New user? {' '}
						</span>
						<Link to='/register' className='link-secondary'>
							Sign up
						</Link>
						{' '} | {' '}
						<a onClick={useDemoAccount} className='link-secondary' href="#">
							Create demo account
						</a>
					</Form.Text>
				</div>
			</Form>
			<SocialLogin
				setError={setError}
				setLoading={setLoading}
				loading={loading}
				redirectUrl={redirectUrl}
			/>
		</>
	);

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		await axios.post('/auth/login', {...values, twoFactorCode})
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				setTimeout(() => {
					setUser(resp.data.token);
					navigate(redirectUrl);
				}, 1000);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				if(resp?.message == '2FA_CODE_MISSING') {
					if(showTwoFactorPopup) {
						setError('Missing 2FA code');
					}
					else {
						setShowTwoFactorPopup(true);
					}
					setLoading(false);
				}
				else {
					setError(resp?.message || 'Failed to log you in you at this time. Please try again later.');
					setLoading(false);
				}
			});
	}

	async function useDemoAccount(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		await axios.post('/auth/demo')
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

export default LoginForm;
