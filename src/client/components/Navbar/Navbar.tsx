import React, { useContext } from 'react';
import { Button, Container, Nav, Navbar as BsNavbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import DokChatLogo from '../DokChatLogo/DokChatLogo';
import './Navbar.scss';

interface Props {
	zeroHeight?: boolean;
}

function Navbar({zeroHeight} : Props) {
	const [ user ] = useContext(UserContext);

	const brand = (
		<BsNavbar.Brand as={Link} to='/' style={{'flex': '0 0 140px'}} className='d-flex justify-content-start align-items-center'>
			<DokChatLogo width={140} variant='white' />
		</BsNavbar.Brand>
	);

	return (
		<BsNavbar
			bg={zeroHeight ? 'transparent' : 'primary'}
			variant="dark"
			className={zeroHeight ? 'navbar-zero-height' : ''}
			expand="md"
		>
			<Container>
				{brand}
				<BsNavbar.Toggle />
				<BsNavbar.Collapse className='my-2'>
					<Nav className='flex-fill justify-content-center'>
						<Nav.Link as={Link} to='/'>Home</Nav.Link>
						<Nav.Link as={Link} to='/about'>About</Nav.Link>
						<Nav.Link as={Link} to='/download'>Download</Nav.Link>
						<Nav.Link href='https://github.com/MrBartusek/DokChat' target='_blank'>Github</Nav.Link>
					</Nav>
					<BsNavbar.Text style={{'flex': '0 0 140px'}} className='d-flex justify-content-md-end'>
						<Link to={user.isAuthenticated ? '/chat' : '/login'}>
							<Button variant="light" >
								{user.isAuthenticated ? 'Open DokChat' : 'Log in'}
							</Button>
						</Link>
					</BsNavbar.Text>
				</BsNavbar.Collapse>
			</Container>
		</BsNavbar>
	);
}

export default Navbar;
