import React from 'react';
import { Button, Container, Nav, Navbar as BsNavbar } from 'react-bootstrap';
import './Navbar.scss';
import { BsFillChatSquareTextFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';

interface Props {
	zeroHeight?: boolean;
}

function Navbar({zeroHeight} : Props) {
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
					className='fw-bold d-flex justify-content-end align-items-center'
				>
					<BsFillChatSquareTextFill className='me-2'/>
					DokChat
				</BsNavbar.Brand>
				<BsNavbar.Collapse className="justify-content-center">
					<Nav>
						<Nav.Link as={Link} to='/'>Download</Nav.Link>
						<Nav.Link as={Link} to='/'>Features</Nav.Link>
						<Nav.Link as={Link} to='/login'>Log in</Nav.Link>
						<Nav.Link as={Link} to='/about'>About</Nav.Link>
						<Nav.Link href='https://github.com/MrBartusek/DokChat' target='_blank'>Github</Nav.Link>
					</Nav>
				</BsNavbar.Collapse>
				<BsNavbar.Text style={{'width': 140}} className='d-flex justify-content-end'>
					<Button variant="light">
						Open DokChat
					</Button>
				</BsNavbar.Text>
			</Container>
		</BsNavbar>
	);
}

export default Navbar;
