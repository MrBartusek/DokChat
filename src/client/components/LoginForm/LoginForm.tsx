import React, { useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { BsFillChatSquareTextFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import axios, { AxiosError } from 'axios';
import { useForm } from '../../hooks/useForm';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { useNavigate } from 'react-router-dom';

function LoginForm() {
	const [loading, setLoading] = useState(false);
	const [values, handleChange] = useForm({ email: '', password: '' });
	const [error, setError] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null!);
	const navigate = useNavigate();

	return (
		<>
			<LoginTitle />
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form ref={formRef}>
				<Form.Group className="mb-3" controlId="formBasicEmail">
					<Form.Label>Email address</Form.Label>
					<Form.Control
						type="email"
						name="email"
						placeholder="Enter email"
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
						placeholder="Password"
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
					<Form.Check type="checkbox" label="Remember me" disabled={loading} />
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
		await axios.post('/api/auth/login', {
			email: values.email,
			password: values.password
		}, { validateStatus: () => true })
			.then((r: any) => {
				const resp: EndpointResponse<UserLoginResponse> = r.data;
				if(resp.error === true) {
					setError(resp.message);
					setLoading(false);
				}
				else if(resp.error === false) {
					//navigate('/chat');
					console.log(resp.data.token);
				}
				else {
					setError('Failed to log in you at this time. Please try again later.');
					setLoading(false);
				}
			})
			.catch(() => {
				setError('Failed to log in you at this time. Please try again later.');
				setLoading(false);
			});

	}
}

function LoginTitle() {
	return (
		<h2 className='d-flex justify-content-center flex-row fw-normal gap-1 mb-5 mt-3'>
			<span>Login to</span>
			<span className='fw-bold'>
				<BsFillChatSquareTextFill className='mx-2'/>
                DokChat
			</span>
		</h2>
	);
}

export default LoginForm;
