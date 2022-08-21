import React, { useContext, useRef, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { BsFillChatSquareTextFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import axios, { AxiosError } from 'axios';
import { useForm } from '../../hooks/useForm';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../UserContext';

function RegisterForm() {
	const [loading, setLoading] = useState(false);
	const [values, handleChange] = useForm({ email: '', username: '', password: '', confirmPassword: '', terms: false });
	const [error, setError] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null!);
	const navigate = useNavigate();
	const [user, setUser] = useContext(UserContext);

	return (
		<>
			<RegisterTitle />
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form ref={formRef}>
				<Form.Group className="mb-3" controlId="formEmail">
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

				<Form.Group className="mb-3" controlId="formPassword">
					<Form.Label>Password</Form.Label>
					<Form.Control
						type="password"
						name="password"
						required
						disabled={loading}
						value={values.password}
						onChange={handleChange}
					/>
				</Form.Group>

				<Form.Group className="mb-3" controlId="formConfirmPassword">
					<Form.Label>Confirm Password</Form.Label>
					<Form.Control
						type="password"
						name="confirmPassword"
						required
						disabled={loading}
						value={values.confirmPassword}
						onChange={(e) => {
							handleChange(e);
							if(values.password != e.target.value) {
								e.target.setCustomValidity('The password confirmation does not match');
							}
							else {
								e.target.setCustomValidity('');
							}
						}}
					/>
				</Form.Group>
				<Form.Group className="mb-3" controlId="formBasicCheckbox">
					<Form.Check
						type="checkbox"
						label="Akceptuje Polityke Pawła Kukiza"
						name='terms'
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
		await axios.post('/api/auth/register',
			{
				email: values.email,
				username: values.username,
				password: values.password
			},
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

function RegisterTitle() {
	return (
		<h2 className='d-flex justify-content-center flex-row fw-normal gap-1 mb-5'>
			<span>Register to</span>
			<span className='fw-bold'>
				<BsFillChatSquareTextFill className='mx-2'/>
                DokChat
			</span>
		</h2>
	);
}

export default RegisterForm;
