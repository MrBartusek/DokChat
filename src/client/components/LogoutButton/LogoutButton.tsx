import React, { useContext, useState } from 'react';
import { BsBoxArrowLeft } from 'react-icons/bs';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import InteractiveButton from '../InteractiveButton/InteractiveButton';

export default function LogoutButton() {
	const [ user, refreshToken, setUser, removeUser ] = useContext(UserContext);
	const [ isLoading, setLoading ] = useState(false);

	function handleClick() {
		setLoading(true);
		const axios = getAxios(user);
		axios.post('/auth/logout')
			.then(() => removeUser())
			.catch(() => setLoading(false));
	}

	return (
		<InteractiveButton
			loading={isLoading}
			onClick={handleClick}
			icon={BsBoxArrowLeft}
			variant="secondary"
			size='sm'
		>
			Logout
		</InteractiveButton>
	);
}
