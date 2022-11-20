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
					<Col lg={'auto'} className='text-center'>
						<DokChatLogo variant='white' height={65} />
						<p className='lead text-muted'>
							Connect with anyone
						</p>
					</Col>
					<Col className='d-flex justify-content-center justify-content-lg-end gap-5 text-center text-lg-start'>
						<div style={{width: 250}}>
							<h3>
								Support
							</h3>
							<p>
								<a href='https://github.com/MrBartusek/DokChat' className='link-secondary'>Bug tracker</a><br/>
								<a href='mailto:dokchat@dokurno.dev' className='link-secondary'>dokchat@dokurno.dev</a><br/>
							</p>
						</div>
						<div style={{width: 250}}>
							<h3>
								Links
							</h3>
							<Link to='/' className='link-secondary'>About DokChat</Link><br/>
							<Link to='/download' className='link-secondary'>Download for Desktop</Link><br/>
							<a href='https://github.com/MrBartusek/DokChat' className='link-secondary'>Github Repository</a><br/>
							<Link to='/login' className='link-secondary'>Login to DokChat</Link><br/>
							<Link to='/register' className='link-secondary'>Register Account</Link><br/>
							<Link to='/forgot-password' className='link-secondary'>Forgot Password</Link><br/>
						</div>
					</Col>
				</Row>
				<Row className='pt-5 text-center text-lg-start'>
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
