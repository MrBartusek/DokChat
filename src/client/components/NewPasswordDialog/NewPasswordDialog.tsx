import * as jose from 'jose';
import React, { FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import * as DateFns from 'date-fns';
import SimpleLoading from '../SimpleLoadng/SimpleLoading';
import NewPasswordForm from '../NewPasswordForm/NewPasswordForm';

const axios = getAxios();

function NewPasswordDialog() {
	const [ loading, setLoading ] = useState(true);
	const [ error, setError ] = useState<string | null>(null);
	const { token } = useParams();

	useEffect(() => {
		let data: jose.JWTPayload;
		try {
			data = jose.decodeJwt(token);
		}
		catch (error) {
			console.error(error);
			setError('Invalid token, please try make password reset request once again');
			setLoading(false);
			return;
		}

		const expired = DateFns.isPast(DateFns.fromUnixTime(data.exp));
		if(expired) {
			setError('This token is expired');
			setLoading(false);
			return;
		}

		setLoading(false);
	}, [ token ]);

	if(loading) {
		return ( <SimpleLoading /> );
	}
	else if(error) {
		return (
			<>
				<Alert variant='danger'>{error}</Alert>
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
	return ( <NewPasswordForm token={token} /> );
}

export default NewPasswordDialog;
