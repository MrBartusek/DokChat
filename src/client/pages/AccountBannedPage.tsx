import * as DateFns from 'date-fns';
import React, { useContext } from 'react';
import { Container } from 'react-bootstrap';
import { BsDashCircle } from 'react-icons/bs';
import DokChatLogo from '../components/DokChatLogo/DokChatLogo';
import LogoutButton from '../components/LogoutButton/LogoutButton';
import { UserContext } from '../context/UserContext';

function AccountBannedPage() {
	const [ user ] = useContext(UserContext);

	return (
		<Container className='h-100 d-flex justify-content-center align-items-center flex-column' style={{ maxWidth: '600px' }}>
			<DokChatLogo variant='black' className='opacity-50 mb-4' height={40} />

			<div className='d-flex flex-column align-items-center border border-danger border-2 rounded-4 p-5'>
				<BsDashCircle size={80} color='var(--bs-danger)' className='mb-3' />
				<h1 className='text-center'>
					Account suspended
				</h1>
				<p className='py-4 text-center'>
					Your DokChat account ({user.discriminator}) has been suspended for
					violating our terms of service. If you want to learn more or believe
					this is a mistake, please contact our support at {' '}
					<a href="mailto:dokchat@dokurno.dev">dokchat@dokurno.dev</a>
				</p>
				<LogoutButton />
			</div>

			<p className='text-center text-secondary opacity-50 mt-4'>
				id: {user.id}, user: {user.discriminator}, timestamp: {DateFns.getUnixTime(new Date())}
			</p>
		</Container>
	);
}

export default AccountBannedPage;
