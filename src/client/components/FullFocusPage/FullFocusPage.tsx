import React from 'react';
import FullPageContainer from '../FullPageContainer/FullPageContainer';
import './FullFocusPage.scss';
import DokChatLogo from '../DokChatLogo/DokChatLogo';
import Separator from '../Separator/Separator';

interface FullFocusPageProps {
	children: React.ReactNode
}

function FullFocusPage(props: FullFocusPageProps) {
	return (
		<FullPageContainer className='bg-dark d-flex flex-column align-items-center justify-content-center'>
			<div className='full-focus-page-pattern' style={{zIndex: 10}}></div>
			<DokChatLogo variant='white' height='80px' className='mb-3' style={{zIndex: 20 }} />
			<div
				className='bg-light text-black p-5 m-3 border border-dark border-1 rounded-3 shadow-lg'
				style={{zIndex: 20, maxWidth: '800px'}}
			>
				{props.children}
			</div>
			<Separator height={85} />
		</FullPageContainer>
	);
}

export default FullFocusPage;
