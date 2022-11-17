import React, { FormEvent, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';

const axios = getAxios();

function PasswordResetForm() {
	const [ loading, setLoading ] = useState(false);
	const [ values, handleChange ] = useForm({ email: '' });
	const [ error, setError ] = useState<string | null>(null);
	const [ success, setSuccess ] = useState<boolean>(false);

	if(success) {
		return (
			<>
				<div className='text-center mb-4'>
					<h2 className='fw-normal mb-4'>Check your email!</h2>
					<p className='text-muted text-center mb-0'>
					We&apos;ve sent password reset instructions to:
					</p>
					<div className='fs-4 lead my-4'>
						{values.email}
					</div>
					<p className='text-muted text-center mb-0'>
					If you haven&apos;t received this email in few minutes, please check your spam folder.
					</p>
				</div>
				<Link to='/login' className='text-decoration-none'>
					<div className='d-grid'>
						<Button variant='secondary'>
							Go back to login
						</Button>
					</div>
				</Link>
			</>

		);
	}

	return (
		<>
			<h2 className='fw-normal mb-4 text-center'>Forgot your password?</h2>
			<p className='text-muted text-center mb-4'>
				Type below e-mail address that you&apos;ve used to register a DokChat account. {' '}
				We&apos;ll send you a one-time link that you can use to reset your password.
			</p>
			{error && <Alert variant='danger'>{error}</Alert>}
			<Form onSubmit={onSubmit}>
				<Form.Group className="mb-4">
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

				<div className='d-flex flex-row justify-content-end gap-2'>
					<Link to='/login'>
						<Button variant='secondary'>
							Cancel
						</Button>
					</Link>
					<InteractiveButton
						variant="primary"
						type="submit"
						className='py-2'
						loading={loading}
					>
						Send password reset link
					</InteractiveButton>
				</div>
			</Form>
		</>
	);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		await axios.post('/auth/password-reset/start', values)
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

export default PasswordResetForm;
