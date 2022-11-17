import React, { useContext, useRef, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';

const axios = getAxios();

function LoginForm() {
	const [ loading, setLoading ] = useState(false);
	const [ values, handleChange ] = useForm({ email: '', password: '', rememberMe: false });
	const [ error, setError ] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null!);
	const navigate = useNavigate();
	const [ user, updateToken, setUser ] = useContext(UserContext);

	return (
		<>
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form ref={formRef}>
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						type="email"
						name="email"
						disabled={loading}
						required
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
						onClick={onSubmit}
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
		</>
	);

	async function onSubmit(event: React.MouseEvent) {
		event.preventDefault();
		const valid = formRef.current.checkValidity();
		if(!valid) {
			return formRef.current.reportValidity();
		}
		setLoading(true);
		await axios.post('/auth/login',
			values, // Backend request body should exactly match this hook
			{ validateStatus: () => true })
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				if(resp.error === true) {
					setError(resp.message);
					setLoading(false);
				}
				else if(resp.error === false) {
					setUser(resp.data.token);
					navigate('/chat');
				}
				else {
					setError('Failed to log you in you at this time. Please try again later.');
					setLoading(false);
				}
			})
			.catch(() => {
				setError('Failed to log you in you at this time. Please try again later.');
				setLoading(false);
			});

	}
}

export default LoginForm;
