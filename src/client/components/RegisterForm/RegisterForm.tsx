import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { EndpointResponse, UserLoginResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';

const axios = getAxios();

function RegisterForm() {
	const [ loading, setLoading ] = useState(false);
	const [ values, handleChange ] = useForm({ email: '', username: '', password: '', confirmPassword: '', terms: false });
	const [ error, setError ] = useState<string | null>(null);
	const formRef = useRef<HTMLFormElement>(null!);
	const passwordConfirmRef = useRef<HTMLInputElement>(null!);
	const navigate = useNavigate();
	const [ user, updateToken, setUser ] = useContext(UserContext);

	useLayoutEffect(() => {
		if(values.password != passwordConfirmRef.current.value) {
			passwordConfirmRef.current.setCustomValidity('The password confirmation does not match');
		}
		else {
			passwordConfirmRef.current.setCustomValidity('');
		}
	}, [ values, passwordConfirmRef ]);

	return (
		<>
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
						ref={passwordConfirmRef}
						required
						disabled={loading}
						value={values.confirmPassword}
						onChange={handleChange}
					/>
				</Form.Group>
				<Form.Group className="mb-3" controlId="formBasicCheckbox">
					<Form.Check
						type="checkbox"
						label="Akceptuję Polityke Pawła Kukiza"
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
				<div className='d-flex justify-content-center mt-3'>
					<Form.Text className="text-muted">
						<span>
						Already have account? {' '}
						</span>
						<Link to='/login' className='link-secondary'>
						Log in
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
		await axios.post('auth/register',
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

export default RegisterForm;
