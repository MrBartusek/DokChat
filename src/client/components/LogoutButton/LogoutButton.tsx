import React, { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { BsBoxArrowLeft } from 'react-icons/bs';
import { UserContext } from '../../context/UserContext';
import getAxios from '../../helpers/axios';
import InteractiveButton, { InteractiveButtonProps } from '../InteractiveButton/InteractiveButton';

export interface LogoutButton extends InteractiveButtonProps {}

export default function LogoutButton(props: InteractiveButtonProps) {
	const [ user, refreshToken, setUser, removeUser ] = useContext(UserContext);
	const [ isLoading, setLoading ] = useState(false);

	function handleClick() {
		setLoading(true);
		const axios = getAxios(user);
		axios.post('/auth/logout')
			.then(() => toast('You have successfully been logged out'))
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
			{...props}
		>
			Logout
		</InteractiveButton>
	);
}
