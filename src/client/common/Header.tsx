import React from 'react';
import { Container } from 'react-bootstrap';
import './Header.scss';

function Header() {
	return (
		<div className={'full-width'}>
			<Container className='py-5 text-center text-white w-75' style={{'paddingTop': 'calc(70px + 3rem !important'}}>
				<h1 className='display-4'>Easily Connect with anyone</h1>
				<p className='lead'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Mollitia, praesentium. Exercitationem, tempora. Natus, beatae saepe? Possimus magnam quia, voluptatem non, velit quod reprehenderit dicta eos cumque voluptates obcaecati omnis quaerat.</p>
			</Container>
		</div>
	);
}

export default Header;
