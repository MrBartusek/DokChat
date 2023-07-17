import React from 'react';
import { Container } from 'react-bootstrap';
import { BsBugFill, BsChatSquareTextFill, BsEmojiSmileFill, BsPeopleFill, BsStarFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';

function WelcomePage() {
	return (
		<Container>
			<div className='d-flex justify-content-center align-items-center flex-column m-5'>
				<h1 className='mb-5'>
					Welcome to DokChat 👋
				</h1>
				<p className='lead w-100 mb-4'>
					DokChat is fully fledged communication platform for you and your friends! By creating
					a account you have unlocked all of the neat features that we have to offer. You can now freely
					message your friends, family or start a community.
				</p>
				<p className='lead w-100 mb-4'>
					Your chat list looks a litle bit empty right now. Let&apos;s change that.
				</p>

				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsStarFill color={'var(--bs-secondary'} className='me-3' />
					<div>
						Star{' '}
						<a href="https://github.com/MrBartusek/DokChat" target="_blank" rel="noopener noreferrer">MrBartusek/DokChat</a>{' '}
						on GitHub
					</div>
				</p>

				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsPeopleFill color={'var(--bs-secondary'} className='me-3' />
					<div>
						Tell your friends about DokChat and ask them about their user tag
					</div>
				</p>

				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsChatSquareTextFill color={'var(--bs-secondary'} className='me-3' />
					<div>
						<Link to='/chat/new'>Create a new chat</Link> using your friends user tags.
					</div>
				</p>

				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsEmojiSmileFill color={'var(--bs-secondary'} className='me-3' />
					<div>
						If you can&apos;t find anybody, you can message me. My user tag is <code>MrBartusek#0001</code>
					</div>
				</p>

				<p className='lead w-100 mb-2 d-flex align-items-center'>
					<BsBugFill color={'var(--bs-secondary'} className='me-3' />
					<div>
						If you find any issues, please be sure to report them to our{' '}
						<a href="https://github.com/MrBartusek/DokChat/issues" target="_blank" rel="noopener noreferrer">issue tracker</a>
					</div>
				</p>

			</div>
		</Container>
	);
}

export default WelcomePage;
