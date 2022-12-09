import React, { useContext, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import SocialLogin from '../SocialLogin/SocialLogin';

const axios = getAxios();

function LoginForm() {
	const [ loading, setLoading ] = useState(false);
	const [ values, handleChange ] = useForm({ email: '', password: '', rememberMe: false });
	const [ error, setError ] = useState<string | null>(null);
	const navigate = useNavigate();
	const [ user, updateToken, setUser ] = useContext(UserContext);

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form onSubmit={onSubmit}>
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						type="email"
						name="email"
						disabled={loading}
						required
						autoFocus
						value={values.email}
						onChange={handleChange}
					/>
				</Form.Group>

				<Form.Group className="mb-3" controlId="formBasicPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						name="password"
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
				<Form.Group className="mb-3" controlId="formBasicCheckbox">
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
					</Form.Text>
				</div>
			</Form>
			<SocialLogin setError={setError} setLoading={setLoading} loading={loading} />
		</>
	);

	async function onSubmit(event: React.FormEvent) {
		event.preventDefault();
		setLoading(true);
		await axios.post('/auth/login', values) // Backend request body should exactly match this hook
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				setTimeout(() => {
					setUser(resp.data.token);
					navigate('/chat');
				}, 1000);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || 'Failed to log you in you at this time. Please try again later.');
				setLoading(false);
			});
	}
}

export default LoginForm;
