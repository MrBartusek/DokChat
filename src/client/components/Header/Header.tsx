import React, { useContext } from 'react';
import { Container, Button, Image } from 'react-bootstrap';
import './Header.scss';
import { BsCloudArrowDown, BsGlobe } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

function Header() {
	const [ user ] = useContext(UserContext);

	return (
		<div className='font-header w-100'>
			<Container
				className='text-center text-white'
				style={{
					'paddingTop': 'calc(70px + 4rem)',
					'paddingBottom': '6rem',
					'maxWidth': 700
				}}
			>
				<h1 className='display-4'>Connect with anyone</h1>
				<p className='lead py-3'>
					DokChat allows you to instantly message everyone who you care about. Share your tag anywhere and
					accept messages from new people. Create private groups and stay in touch with your friends.
				</p>

				<div className='d-flex justify-content-center gap-3'>
					<Link to={user.isAuthenticated ? '/chat' : '/login'}>
						<Button variant='light' size='lg' className='mt-3'>
						Open DokChat in your browser
						</Button>
					</Link>
					<Link to='/download' className='text-decoration-none'>
						<Button variant='dark' size='lg' className='mt-3 d-flex align-items-center'>
							<BsCloudArrowDown className='me-2' /> Download
						</Button>
					</Link>
				</div>

			</Container>
		</div>
	);
}

export default Header;
