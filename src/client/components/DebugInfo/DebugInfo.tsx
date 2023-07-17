import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

export default function DebugInfo() {
	const [user] = useContext(UserContext);

	return (
		<div className='small text-muted mt-5 text-center'>
			User: <code className='text-muted'>{user.id}</code> ({user.discriminator})
		</div>
	);
}
