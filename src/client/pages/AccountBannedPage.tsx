import * as DateFns from 'date-fns';
import React, { useContext } from 'react';
import { BsPersonX } from 'react-icons/bs';
import FullFocusPage from '../components/FullFocusPage/FullFocusPage';
import LogoutButton from '../components/LogoutButton/LogoutButton';
import { UserContext } from '../context/UserContext';

function AccountBannedPage() {
	const [ user ] = useContext(UserContext);

	return (
		<FullFocusPage>
			<div className='d-flex justify-content-center align-items-center flex-column'>
				<BsPersonX size={80} color='var(--bs-danger)' className='mb-3' />
				<h1 className='text-center text-danger'>
					Account suspended
				</h1>
				<p className='py-4 text-center'>
					Your DokChat account ({user.discriminator}) has been suspended for
					violating our terms of service. If you want to learn more or believe
					this is a mistake, please contact our support at {' '}
					<a href="mailto:dokchat@dokurno.dev">dokchat@dokurno.dev</a>
				</p>
				<LogoutButton />

				<p className='text-center opacity-50 mt-5'>
					id: {user.id}, user: {user.discriminator}, timestamp: {DateFns.getUnixTime(new Date())}
				</p>
			</div>
		</FullFocusPage>
	);
}

export default AccountBannedPage;
