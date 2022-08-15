import React from 'react';
import { Button, Container, Nav, Navbar as BsNavbar } from 'react-bootstrap';
import './Navbar.scss';

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
				<BsNavbar.Brand href=".">Chat App</BsNavbar.Brand>
				<Nav className="me-auto">
					<Nav.Link>Home</Nav.Link>
					<Nav.Link>Login</Nav.Link>
					<Nav.Link>Register</Nav.Link>
				</Nav>
				<BsNavbar.Collapse className="justify-content-end">
					<BsNavbar.Text>
						<Button variant="light" style={{'borderRadius': 9999}}>
							Open Chat App
						</Button>
					</BsNavbar.Text>
				</BsNavbar.Collapse>
			</Container>
		</BsNavbar>
	);
}

export default Navbar;
