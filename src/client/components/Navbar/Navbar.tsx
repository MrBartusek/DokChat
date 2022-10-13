import React, { useContext } from 'react';
import { Button, Container, Nav, Navbar as BsNavbar } from 'react-bootstrap';
import './Navbar.scss';
import { BsFillChatSquareTextFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';

interface Props {
	zeroHeight?: boolean;
}

function Navbar({zeroHeight} : Props) {
	const [ isUserLoading, user ] = useContext(UserContext);

	return (
		<BsNavbar
			bg={zeroHeight ? 'transparent' : 'primary'}
			variant="dark"
			className={zeroHeight ? 'navbar-zero-height' : ''}
		>
			<Container>
				<BsNavbar.Brand
					as={Link}
					to='/'
					style={{'width': 140}}
					className='fw-bold d-flex justify-content-start align-items-center'
				>
					<BsFillChatSquareTextFill className='me-2'/>
					DokChat
				</BsNavbar.Brand>
				<BsNavbar.Collapse className="justify-content-center">
					<Nav>
						<Nav.Link as={Link} to='/'>Download</Nav.Link>
						<Nav.Link as={Link} to='/'>Features</Nav.Link>
						<Nav.Link as={Link} to='/about'>About</Nav.Link>
						<Nav.Link href='https://github.com/MrBartusek/DokChat/issues' target='_blank'>Support</Nav.Link>
						<Nav.Link href='https://github.com/MrBartusek/DokChat' target='_blank'>Github</Nav.Link>
					</Nav>
				</BsNavbar.Collapse>
				<BsNavbar.Text style={{'width': 140}} className='d-flex justify-content-end'>
					<Link to={user.isAuthenticated ? '/chat' : '/login'}>
						<Button variant="light" >
							{user.isAuthenticated ? 'Open DokChat' : 'Log in'}
						</Button>
					</Link>
				</BsNavbar.Text>
			</Container>
		</BsNavbar>
	);
}

export default Navbar;
