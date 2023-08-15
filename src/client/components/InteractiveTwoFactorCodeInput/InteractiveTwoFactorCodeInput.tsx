import React, { useContext, useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import { useForm } from '../../hooks/useForm';
import InteractiveButton from '../InteractiveButton/InteractiveButton';
import TwoFactorCodeInput from '../TwoFactorCodeInputProps/TwoFactorCodeInputProps';

export interface InteractiveTwoFactorCodeInputProps {
	action: 'enable' | 'disable';
    setCode?: React.Dispatch<React.SetStateAction<string>>
}

function InteractiveTwoFactorCodeInput({action}: InteractiveTwoFactorCodeInputProps) {
	const [ user, refreshUser ] = useContext(UserContext);
	const [ code, setCode ] = useState('');
	const navigate = useNavigate();
	const axios = getAxios(user);
	const [ isLoading, setLoading ] = useState(false);
	const [ error, setError ] = useState('');

	return (
		<>
			<TwoFactorCodeInput
				isLoading={isLoading}
				setCode={setCode}
				buttonText={action == 'enable' ? 'Activate' : 'Deactivate'}
				handleSubmit={handleSubmit}
			/>
			{error && <span className='text-danger'>{error}</span>}
		</>
	);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		await axios.post(`/auth/two-factor/${action}`, { code })
			.then((r: any) => {
				refreshUser().then(() => {
					navigate('/chat/profile/');
				});
			})
			.catch((e: any) => {
				const resp: EndpointResponse<null> = e.response?.data;
				setError(resp?.message || `Failed to ${action} 2FA this time. Please try again later.`);
				setLoading(false);
			});
	}
}

export default InteractiveTwoFactorCodeInput;
