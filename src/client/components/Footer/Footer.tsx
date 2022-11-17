import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { BiCoffeeTogo } from 'react-icons/bi';
import { BsHeartFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import DokChatLogo from '../DokChatLogo/DokChatLogo';

function Footer() {
	return (
		<div className='bg-dark'>
			<Container className='py-5 text-light'>
				<Row>
					<Col xs={'auto'}>
						<DokChatLogo variant='white' height={55} />
						<p className='lead text-muted text-center'>
							Connect with anyone
						</p>
					</Col>
					<Col className='d-flex justify-content-end gap-5'>
						<div style={{width: 250}}>
							<h3>
								Links
							</h3>
							<Link to='/' className='link-secondary'>About DokChat</Link><br/>
							<Link to='/download' className='link-secondary'>Download for Desktop</Link><br/>
							<Link to='https://github.com/MrBartusek/DokChat' className='link-secondary'>Github Repository</Link><br/>
							<Link to='/login' className='link-secondary'>Login to DokChat</Link>
						</div>
						<div style={{width: 250}}>
							<h3>
								Contact
							</h3>
							<p>
								E-mail: <a href="mailto:dokchat@dokurno.dev" className='link-secondary'>dokchat@dokurno.dev</a>
							</p>
						</div>
					</Col>
				</Row>
				<Row className='pt-5'>
					<Col className='text-secondary'>
						&copy; DokChat {new Date().getFullYear()} - Made with <BsHeartFill /> & <BiCoffeeTogo /> by {' '}
						<a href="https://dokurno.dev/" className='link-secondary'>MrBartusek</a>!
					</Col>
				</Row>
			</Container>
		</div>
	);
}

export default Footer;
