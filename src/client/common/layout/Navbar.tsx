import React from 'react';
import { Button, Container, Nav, Navbar as BsNavbar } from 'react-bootstrap';
import './Navbar.scss';

interface Props {
	zeroWidth?: boolean;
}

function Navbar({zeroWidth} : Props) {
	return (
		<BsNavbar bg="primary" variant="dark">
			<Container>
				<BsNavbar.Brand href=".">Chat App</BsNavbar.Brand>
				<Nav className="me-auto">

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
