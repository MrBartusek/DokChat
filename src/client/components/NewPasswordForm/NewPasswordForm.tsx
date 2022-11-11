import * as jose from 'jose';
import React, { FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import * as DateFns from 'date-fns';

const axios = getAxios();

export interface NewPasswordFormProps {
	token: string,
}

function NewPasswordForm({ token }: NewPasswordFormProps) {
	const [ loading, setLoading ] = useState(false);
	const [ values, handleChange ] = useForm({ password: '', confirmPassword: '' });
	const [ error, setError ] = useState<string | null>(null);
	const [ success, setSuccess ] = useState<boolean>(false);

	if(success) {
		return (
			<>
				<div className='text-center mb-4'>
					<h2 className='fw-normal mb-4'>Password Updated!</h2>
					<p className='text-muted text-center mb-0'>
						Your password has been successfully changed, you can log-in now using
						your new credentials.
					</p>
				</div>
				<Link to='/login' className='text-decoration-none'>
					<div className='d-grid'>
						<Button variant='primary'>
							Go to login
						</Button>
					</div>
				</Link>
			</>
		);
	}

	return (
		<>
			<h2 className='fw-normal mb-4 text-center'>Update your password</h2>
			<p className='text-muted text-center mb-4'>
				Select a new password that you will use to login to DokChat
			</p>
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form onSubmit={onSubmit}>
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

				<Form.Group className="mb-4" controlId="formConfirmPassword">
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

				<div className='d-grid'>
					<InteractiveButton
						variant="primary"
						type="submit"
						className='py-2'
						loading={loading}
					>
						Update password
					</InteractiveButton>
				</div>
			</Form>
		</>
	);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		await axios.post('/auth/password-reset/update', {
			token,
			password: values.password
		})
			.then(() => {
				setSuccess(true);
				setLoading(false);
			})
			.catch((e) => {
				const resp: EndpointResponse<null> = e.response?.data as any;
				setError(resp?.message || 'Failed to request a password reset at this time. Please try again later.');
				setLoading(false);
			});

	}
}

export default NewPasswordForm;
