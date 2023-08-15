import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EndpointResponse } from '../../../types/endpoints';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import TwoFactorCodeInput from '../TwoFactorCodeInput/TwoFactorCodeInput';

export interface InteractiveTwoFactorCodeInputProps {
	action: 'enable' | 'disable';
    setCode?: React.Dispatch<React.SetStateAction<number>>;
	redirectTo?: string
}

function InteractiveTwoFactorCodeInput({action, redirectTo = '/chat/profile?tab=account'}: InteractiveTwoFactorCodeInputProps) {
	const [ user, refreshUser ] = useContext(UserContext);
	const [ code, setCode ] = useState(undefined);
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
					navigate(redirectTo);
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
