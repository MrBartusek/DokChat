import React, { useContext } from 'react';
import { Button, Container } from 'react-bootstrap';
import { BsCloudArrowDown } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import useBreakpoint from '../../hooks/useBreakpoint';
import './Header.scss';

function Header() {
	const [ user ] = useContext(UserContext);
	const breakpoint = useBreakpoint();

	return (
		<div className='font-header w-100'>
			<Container
				className='text-center text-white'
				style={{
					'paddingTop': 'calc(70px + 5rem)',
					'paddingBottom': '7.5rem',
					'maxWidth': 700
				}}
			>
				<h1 className='display-4'>Connect with anyone</h1>
				<p className='lead py-3'>
					DokChat allows you to instantly message everyone who you care about. Share your tag anywhere and
					accept messages from new people. Create private groups and stay in touch with your friends.
				</p>

				<div className='d-flex justify-content-center mt-3 mx-4 gap-3 flex-column flex-lg-row stretch'>
					<Link to={user.isAuthenticated ? '/chat' : '/login'}>
						<Button variant='light' size='lg' className='w-100'>
							{[ 'xs', 'sm', 'md' ].includes(breakpoint) ? 'Open DokChat' : 'Open DokChat in your browser'}
						</Button>
					</Link>
					<Link to='/download' className='text-decoration-none'>
						<Button variant='dark' size='lg' className='d-flex justify-content-center align-items-center w-100'>
							<BsCloudArrowDown className='me-2' /> Download Desktop
						</Button>
					</Link>
				</div>

			</Container>
		</div>
	);
}

export default Header;
